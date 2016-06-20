var config = require('univ-config')(module, '*lectal-api*', 'config/conf');

module.exports = {

    isLoggedIn: function (req, res, next) {

        if (req.user) {
            return next();
        } else {
            next(new Error('is not authenticated'));
        }
    },

    isSetup: function (req, res, next) {

        var user = req.user;

        if (user) {
            if (user.isSetup) {
                 next();
            } else {
                next(new Error('user is authenticated but is not setup'));
            }
        } else {
            next(new Error('is not authenticated'));
        }
    },

    isVerified: function (req, res, next) {

        var user = req.user;

        if (user) {
            if (user.checks.isVerified) {
                next();
            } else {
                next(new Error('user is authenticated but is not verified'));
            }
        } else {
            next(new Error('requestor is not authenticated'));
        }
    },

    isInBeta: function (req, res, next) {

        var user = req.user;

        if (user) {
            if (user.checks.inBeta) {
                return next();
            } else {
                next(new Error('user is authenticated but not inBeta'));
            }
        } else {
            next(new Error('is not authenticated'));
        }
    },

    isAdmin: function (req, res, next) {

        var user = req.user;

        if (user) {
            if (user.checks.isAdmin) {
                return next();
            } else {
                return next(new Error('user is authenticated but is not admin'));
            }
        } else {
            next(new Error('requestor is not authenticated'));
        }
    }

};