const config = require('univ-config')(module, '*lectal-api*', 'config/conf');
const express = require('express');
const router = express.Router();
const async = require('async');
const mailchimp = require('../lib/helpers/mailchimp.js');
const Email = require('../models/email.js');
const httpMiddleware = require('../middleware/http-models');
const Checks = require('../middleware/checks');
const helpers = require('./helpers');


router.post('/insert_email', Checks.isLoggedIn, function (req, res, next) {

    //TODO sanitize inputs

    var emailAddress = String(req.body.email).trim();
    var userId = String(req.body.userId);


    var email = new Email({
        userId: userId,
        email: emailAddress
    });

    email.save(function (err) {
        if (err) {
            next(err);
        }
        else {
            res.json({success: true});
        }
    });

});

router.get('/by_id/:id', function (req, res, next) {

    /**
     * @api {get} /emails/by_id/:id Generic endpoint to retrieve emails by id
     * @apiVersion 1.0.0
     * @apiName lectal-api
     * @apiGroup emails
     * @apiUse inBeta
     *
     */

    var id = parseInt(req.params.id);

    req.lectalApiData = {
        Model: Email,
        id: id,
        limit: 1,
        conditions: req.query
    };

    next();

}, httpMiddleware.GET_MODEL);


router.get('/', function (req, res, next) {

    /**
     * @api {get} /v1/emails Generic endpoint to retrieve multiple emails filtered by query params
     * @apiVersion 1.0.0
     * @apiUse isBlocked
     * @apiName lectal-api
     * @apiGroup emails
     * @apiSuccess {Boolean} active        Specify if the account is active.
     * @apiSuccess {Object}  profile       User profile information.
     * @apiSuccess {Number}  profile.age   Users age.
     * @apiSuccess {String}  profile.image Avatar-Image.
     */

    var conditions = req.query.conditions ? JSON.parse(req.query.conditions) : {};
    var limit = req.query.limit ? parseInt(req.query.limit) : 0; //

    req.lectalApiData = {
        Model: Email,
        conditions: conditions,
        limit: limit
    };

    next();

}, httpMiddleware.GET_MANY_MODELS);


router.put('by_id/:id', function (req, res, next) {

    /**
     * @api {put} /v1/emails/by_id/:id Generic endpoint to update emails by id
     * @apiVersion 1.0.0
     * @apiName lectal-api
     * @apiGroup emails
     *
     */

    var id = req.params.id;

    req.lectalApiData = {
        Model: Email,
        id: id,
        updateData: req.body,
        conditions: req.query,
        options: {}
    };

    next();

}, httpMiddleware.PUT_MODEL);


//router.post('/add_to_newsletter', function (req, res, next)

router.post('/', function (req, res, next) {

    /**
     *
     * @api {post} /v1/emails Post a new email to DB and to MailChimp
     * @apiVersion 1.0.0
     * @apiName lectal-api
     * @apiGroup emails
     *
     */

    var email = req.body.email;

    if (!email) {
        return res.status(500).json({error: 'no email address provided in query params'});
    }

    async.parallel([
            function (cb) {

                mailchimp.postEmailToMailChimp(email, function (err, result) {
                    if (err) {
                        console.error(err);
                        cb(null);
                    }
                    else {
                        cb(null, result);
                    }
                });
            },

            function (cb) {

                var data = {
                    email: email
                };

                Email.update({email: email}, data, {upsert: true}, function (err, result) {

                    if (err) {
                        cb(err);
                    }
                    else if (result) {
                        cb(null, result);
                    }
                    else {
                        cb(new Error('grave error in model.save method'));
                    }
                });
            }
        ],
        function complete(err, results) {

            if (err) {
                console.error(err);
                next(err);
            }
            else {
                res.status(201).json({success: results});
            }
        });


});

module.exports = router;