const config = require('univ-config')(module, '*lectal-api*', 'config/conf');
const clientsInfo = require('./config/clients-info');
const log = require('lectal-logger');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const colors = require('colors/safe');
const _ = require('underscore');
const encryption = require('./lib/helpers/encryption.js');
const jwt = require('jwt-simple');
const cookieSession = require('cookie-session');
const domain = require('domain');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const Checks = require('./middleware/checks');
const PreParseQuery = require('./middleware/parse-query-props');
const User = require('./models/user');
const app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//#setup
app.disable('etag');

var reqId = 0;

app.use(function(req, res, next) {
  req.lectalReqId = reqId++;
  req.requestStart = Date.now();
  next();
});


app.use(morgan('combined', {
  skip: function(req, res) {
    return res.statusCode < 400
  }
}));

app.use(bodyParser.json({
  limit: '5mb'
})); //TODO: limit?

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cookieParser());
app.use(flash());

app.set('trust proxy', 1); // trust first proxy

app.use(function(req, res, next) {
  next();
});

//TODO accept cookie header???

app.use(function allowCrossDomain(req, res, next) { // Enable CORS

  res.header('Access-Control-Allow-Origin', req.get('origin'));
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', req.get("Access-Control-Request-Headers"));
  res.header('Access-Control-Allow-Credentials', true);
  next();

});

if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
  app.use(cookieSession({
    name: 'lectal-cookie-todd',
    //secret: 'Bartholomew-the-Apostle',
    domain: '.lectal.com',
    secure: false,
    maxAge: 400000000,
    cookie: {
      name: 'lectal-cookie-todd',
      //secret: 'Bartholomew-the-Apostle',
      domain: '.lectal.com',
      secure: false,
      maxAge: 400000000
    },
    keys: ['key1', 'key2']
  }));
} else {


  app.use(cookieSession({
    name: 'lectal-cookie-dev',
    //secret: 'Bartholomew-the-Apostle',
    secure: false,
    maxAge: 400000000,
    cookie: {
      name: 'lectal-cookie-dev',
      //secret: 'Bartholomew-the-Apostle',
      secure: false,
      maxAge: 400000000,
    },
    keys: ['key1', 'key2']
  }));
}


var whitelist = ['http://localhost:4999', 'http://localhost:5000'];

var corsOptions = {
  origin: function(origin, cb) {
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    cb(null, originIsWhitelisted);
  }
};

app.enable('trust proxy 1');


app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')();


if (process.env.NODE_ENV !== 'production') {
  //app.use(reqLogging);
}

app.use('/docs', Checks.isAdmin, express.static(path.join(__dirname, 'doc')));

app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/favicon.ico'));


//add domain to request
app.use(require('./middleware/lectal-domain'));
app.use(PreParseQuery.parseData);


app.use(function(req, res, next) {


  var auth = req.headers['x-lectal-authorization'];

  if (!auth) {
    next(); //TODO: should probably always be a x-lectal-authorization header...no not for browser
  } else {
    try {
      auth = jwt.decode(auth, 'cantona07+');
    } catch (err) {
      return next(err);
    }

    if (typeof auth !== 'object') {
      next(new Error('not authorized - bad header'));
    } else {

      var userId;
      var expiresOn;
      var client = auth['lectal-service'];

      if (!_.contains(clientsInfo.acceptedClients, client)) {
        next(new Error('not authorized - not accepted client'));
      } else {
        userId = auth._id;
        expiresOn = String(auth.expiresOn);

        if (new Date() > Date.parse(expiresOn)) {
          //return res.status(403).json({error: 'expired token'});
          req.lectalAccessTokenIsExpired = true;
          next(); //let the request go through, but there will be no logged in user
        } else if (userId == 'beach') { //this is when no user is logged in
          //no logged in user, beach is accepted as userid
          next();
        } else if (!userId) {
          //no logged in user, beach is accepted as userid
          next();
        } else {

          //TODO: check if you can cast to Number/ObjectId

          User.findOne({
            _id: userId
          }, function(err, model) {
            if (err) {
              next(err);
            } else if (model) {
              req.proxyUser = model;
              next();
            } else {
              log.warn('warning in app middleware: no registered user model with userId=' + userId);
              next(new Error('no user in DB with userId=' + userId));
            }
          });
        }

      }

    }

  }

});


if(false){
  app.use(require('./middleware/rate-limit'));
}


/* routes for API independent of version (these routes can tell you endpoint info given version info) */
app.use('/', require('./routes/index'));
app.use('/info', require('./routes/info'));
/* routes for API version v1 */
app.use('/1/algolia', require('./routes/algolia'));
app.use('/1/autosuggest', require('./routes/autosuggest'));
app.use('/1/emails', require('./routes/emails'));
app.use('/1/handle', require('./routes/handle'));
app.use('/1/images', require('./routes/images/index'));
app.use('/1/linkedin', require('./routes/linkedin'));
app.use('/1/misc', require('./routes/misc'));
app.use('/1/oauth', require('./routes/oauth'));
app.use('/1/posts', require('./routes/posts/index'));
app.use('/1/sources', require('./routes/sources/index'));
app.use('/1/services', require('./routes/services'));
app.use('/1/testing', require('./routes/testing'));
app.use('/1/topics', require('./routes/topics/index'));
app.use('/1/twitter', require('./routes/twitter'));
app.use('/1/users', require('./routes/users/index'));
app.use('/1/verify', require('./routes/verify'));




if (_.contains(['dev_local', 'dev_remote', 'development'], app.get('env'))) {

  app.post('/hot-reload', function(req, res, next) {
    var path = req.body.path;
    path = require.resolve(path);
    if (path.indexOf('node_modules') < 0 && path.indexOf('routes') > 0) {
      try {
        delete require.cache[path];
        res.send({
          success: 'successfully deleted cache with keyname: ' + path
        });
      } catch (err) {
        res.send({
          error: String(err)
        });
      }
    }
  });
}


app.use(function(req, res, next) {
  try {
    req.lectalDomain.exit(); //exit from the current domain explicitly
  } catch (err) {
    log.error(err);
  } finally {
    next();
  }
});


app.use(function(req, res, next) {

  var r;

  var timeRequired = (Date.now() - req.requestStart) + 'ms';
  log.info('Time required for request:', timeRequired);

  if (r = req.lectalTemp) {
    if (!req.lectalSent && !res.headersSent) {
      req.lectalSent = true;
      res.status(r.status).json({
        timeRequired: timeRequired,
        success: r.data
      });
    } else {
      console.log('Headers sent already, but here is the data that would have been sent:', r);
    }
  } else if (req.lectalEnd) {
    //do nothing
  } else {
    next();
  }

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next({
    status: 404,
    error: new Error('404: Not Found - ' + req.method + ' ' + req.originalUrl)
  });
});

app.use(function(err, req, res, next) {

  var timeRequired = (Date.now() - req.requestStart) + 'ms';

  try {
    req.lectalDomain.exit(); //exit from the current domain explicitly
  } catch (err) {
    //log.error(err);
  }

  if (err.error && err.status) { //deconstruct err object
    var status = err.status;
    err = err.error;
    err.status = status;
  }

  log.error(err);

  if (app.get('env') === 'production') {
    if (!res.headersSent && !req.lectalSent) {
      res.status(err.status || 500).json({
        error: 'sorry the API experienced an error serving your priority request'
      });
    }
  } else {

    if (!res.headersSent && !req.lectalSent) {
      req.lectalSent = true;
      res.status(err.status || 500).json({
        error: {
          timeRequired: timeRequired,
          stack: stack,
          errMessage: err.message,
          errStack: err.stack
        }
      });
    }

  }
});


module.exports = app;
