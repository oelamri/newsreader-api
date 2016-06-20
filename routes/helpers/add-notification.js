var log = require('lectal-logger');
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var async = require('async');
var _ = require('underscore');
var User = require('../../models/user');
var Checks = require('../../middleware/checks');
var httpMiddleware = require('../../middleware/http-models');


function addNotificationOriginal(req, res, next) {

    var userId = (req.user || req.proxyUser)._id;
    var userToNotify = req.params.id;

    var conditions = {
        '_id': userToNotify
    };

    var message = req.body.message || 'notifications message';


    var data = {
        '$push': {
            'notifications': {
                'message': message,
                'dateCreated': new Date(),
                'createdBy': userId,
                'notifiedBy': userId,
                'isRead': false
            }
        }
    };

    req.lectalApiData = {
        Model: User,
        conditions: conditions,
        updateData: data,
        limit: 1,
        options: {
            multi: false
        }
    };

    next();

}


function addNotification(data, cb) {

    var error = null;

    try {

        var userId = data.user._id;
        var userToNotify = data.userToNotify;
        var message = data.message || 'notifications message';
        var req = data.req;

        var conditions = {
            '_id': userToNotify
        };

        var updateData = {
            '$push': {
                'notifications': {
                    'message': message,
                    'dateCreated': new Date(),
                    'createdBy': userId,
                    'notifiedBy': userId,
                    'isRead': false
                }
            }
        };

        req.lectalApiData = {
            Model: User,
            conditions: conditions,
            updateData: updateData,
            limit: 1,
            options: {
                multi: false
            }
        };
    }
    catch (err) {
        error = err;
    }
    finally {
        cb(error);
    }

}


module.exports = { addNotification: addNotification };