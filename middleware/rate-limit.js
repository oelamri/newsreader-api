const log = require('lectal-logger');

const rlm = require('../services/rate-limit');


module.exports = function(req, res, next) {

    rlm.limit({

        req: req,
        log: log.debug.bind(log),
        excludeRoutes: ['/v1/posts/by_id/:id/add_upvote', '/v1/posts/by_id/:id/remove_upvote', '/v1/handle/blacklisted'],
        maxReqsPerPeriod: 30,
        periodMillis: 2000,
        identifier: 'ip'

    }).then(function(data) {

        if (data.rateExceeded) {
            res.status(429).json({
                error: 'Rate limit exceeded'
            });
        } else {
            next();
        }

    }).catch(function(err) {

        switch (err.type) { //Express allows you to pass an object as first argument, not always an instanceof Error
            case rlm.errors.REDIS_ERROR:
                err.status = 500;
                break;
            case rlm.errors.NO_KEY: // whatever you chose to use as you're request unique identifier, there was a problem finding it
                err.status = 500;
                break;
            case rlm.errors.BAD_ARGUMENTS: //if you have some dynamicism in your project, then maybe you could pass bad args at runtime
                err.status = 500;
                break;
            default:
                log.warn('Unexpected err via rate limiter:', err);
        }

        next(err);

    });


};
