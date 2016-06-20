const log = require('lectal-logger');
const config = require('univ-config')(module, '*lectal-api*', 'config/conf');
const express = require('express');
const router = express.Router();
const async = require('async');
const Post = require('../models/post');
const User = require('../models/user');
const Topic = require('../models/topic');
const Checks = require('../middleware/checks');


router.post('/does_email_or_handle_exist', function (req, res, next) {


    const $handle = req.body.handle;
    const $email = req.body.email;

    const handle = new RegExp('^' + String($handle).toLowerCase() + '$', 'i');
    const email = new RegExp('^' + String($email).toLowerCase() + '$', 'i');

    async.parallel([
        function (cb) {
            User.findOne({
                $or: [
                    {email: email},
                    {username: handle}
                ]
            }, function (err, model) {
                cb(err, model);
            });
        },
        function (cb) {
            Topic.findOne({hashtag: handle}, function (err, model) {
                cb(err, model);
            });
        }
    ], function complete(err, results) {
        if (err) {
            next(err);
        }
        else {

            const bool = results.every(function (result) {
                return result;
            });

            var success = false;
            var msg = [];

            if (bool) {
                msg.push('username and hashtag are both taken!.');
            }
            else if (results[0]) {

                if (String(results[0].username).toUpperCase() === String($handle).toUpperCase()) {
                    msg.push('handle is already a username');
                }
                if (String(results[0].email).toUpperCase() === String($email).toUpperCase()) {
                    msg.push('email is already taken');
                }
            }
            else if (results[1]) {
                msg.push('handle is already a topic hashtag');
            }
            else {
                success = true;
                msg.push('handle is currently available for use');
            }

            if (success) {
                res.json({
                    success: {
                        messages: msg
                    }
                });
            }
            else {
                res.json({
                    error: {
                        messages: msg
                    }
                });
            }

        }
    });

});


router.get('/does_handle_exist/:handle', Checks.isLoggedIn, function (req, res, next) {

    const user = req.user || req.proxyUser;
    const handle = String(req.params.handle);

    const handleRegex = new RegExp('^' + String(handle).toLowerCase() + '$', 'i');

    async.parallel([
        function (cb) {
            User.findOne({username: handleRegex}, function (err, model) {
                cb(err, model);
            });
        },
        function (cb) {
            Topic.findOne({hashtag: handleRegex}, function (err, model) {
                cb(err, model);
            });
        }

    ], function complete(err, results) {
        if (err) {
            next(err);
        }
        else {

            const bool = results.every(function (result) {
                return result;
            });

            var msg = null;
            var handleIsAvailable = false;

            if (bool) {
                msg = 'handle is both a hashtag and a username!';
                log.error('handle is both a hashtag and a username!! => ' + handle);
            }
            else if (results[0]) {
                msg = 'handle_is_taken';
            }
            else if (results[1]) {
                msg = 'handle is already a topic hashtag';
            }
            else {
                handleIsAvailable = true;
                msg = 'handle is currently available for use';
            }

            res.json({
                success: {
                    message: msg,
                    handleIsAvailable: handleIsAvailable
                }
            });
        }
    });

});


router.get('/does_email_exist/:email', function (req, res, next) {

    const email = new RegExp('^' + String(req.params.email).toLowerCase() + '$', 'i');

    async.parallel([
        function (cb) {
            User.findOne({email: email}, function (err, model) {
                cb(err, model);
            });
        }
    ], function complete(err, results) {
        if (err) {
            next(err);
        }
        else {

            var msg = null;

            if (results[0]) {
                msg = 'email is taken';
            }
            else {
                msg = 'email is currently available for use';
            }

            res.json({
                success: msg
            })
        }
    });

});


router.get('/is_topic_or_user/:handle', function (req, res, next) {

    const user = req.user;

    const handle = new RegExp('^' + String(req.params.handle).toLowerCase() + '$', 'i');

    async.parallel([
        function (cb) {
            User.findOne({username: handle}, function (err, model) {
                cb(err, model);
            });
        },
        function (cb) {
            Topic.findOne({hashtag: handle}, function (err, model) {
                cb(err, model);
            });
        }

    ], function complete(err, results) {
        if (err) {
            next(err);
        }
        else {

            var isFollowing = null;

            const bool = results.every(function (result) {
                return result;
            });

            var model;

            if (bool) {
                //next('route');
                //next({error: new Error(), sendStack: false, status: 500});
                next(new Error('handle is both a hashtag and a username'));
            }
            else if (model = results[0]) {


                /*    var following = (user && user.following) ? user.following : [];

                 for (var i = 0; i < following.length; i++) {
                 var thing = following[i];
                 if (thing.followeeId == model.userId) {
                 isFollowing = true;
                 break;
                 }
                 }*/

                if (user) {

                    isFollowing = false;

                    var followers = (model && model.followers) ? model.followers : [];

                    for (var i = 0; i < followers.length; i++) {
                        var follower = followers[i];
                        if (String(follower.followerId) === String(user._id)) {
                            isFollowing = true;
                            break;
                        }
                    }
                }

                var userId = model._id;

                var conditions = {
                    posterId: userId
                };

                req.lectalTempData = {
                    kind: 'user',
                    id: userId,
                    model: model,
                    conditions: conditions,
                    isFollowing: isFollowing
                };

                next();

            }
            else if (model = results[1]) {


                if (user) {

                    isFollowing = false;
                    var followers = (model && model.followers) ? model.followers : [];

                    for (var i = 0; i < followers.length; i++) {
                        var follower = followers[i];
                        if (String(follower.followerId) === String(user._id)) {
                            isFollowing = true;
                            break;
                        }
                    }
                }

                var topicId = model._id;

                var conditions = {
                    summary: {
                        $elemMatch: {
                            kind: 'topic',
                            id: topicId  //TODO: this may need updating from id to topicId or what not
                        }
                    }
                };

                req.lectalTempData = {
                    kind: 'topic',
                    id: topicId,
                    model: model,
                    conditions: conditions,
                    isFollowing: isFollowing
                };

                next();


            }
            else {
                next(new Error('handle neither a hashtag nor a username'));
            }
        }
    });


}, function countOrNot(req, res, next) {


    var data = req.lectalTempData;
    var model = data.model;
    var conditions = data.conditions;

    var followerCount = model.followers ? model.followers.length : 0;
    var followingCount = model.following ? model.following.length : 0;


    //TODO: we can probably remove this Post.count call for most requests
    Post.count(conditions, function (err, count) {

        if (err) {
            next(err);
        }
        else if (count !== null && count !== undefined) { //0 is falsy...

            res.json({
                success: {
                    kind: data.kind,
                    model: model,
                    id: data.id,
                    postCount: count,
                    isFollowing: data.isFollowing,
                    followerCount: followerCount,
                    followingCount: followingCount
                }
            });
        }
        else {
            next(new Error('count could not be retrieved from DB'));
        }
    });

});

module.exports = router;
