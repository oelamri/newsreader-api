const log = require('lectal-logger');
const domain = require('domain');


module.exports = function(req, res, next) {

    var d = domain.create();

    d.on('error', function(err) {
        //this is a fatal error, we should send a response right away, don't call next() because next() will call the wrong function chain
        log.error(err);
        this.exit(); //exit from current domain
        if (!res.headersSent) {
            if (process.env.NODE_ENV === 'production') {
                res.json({
                    error: 'Lectal API production error'
                });
            } else {
                res.json({
                    error: err.stack
                });
            }
        }
    });

    d.run(function() {
        req.lectalDomain = d;
        next();
    });


};
