var express = require('express');
var router = express.Router();
var Post = require('../../models/post');
var Checks = require('../../middleware/checks');
var log = require('lectal-logger');
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var async = require('async');
var mongoose = require('mongoose');
var path = require('path');
var ranker = require('../../services/ranker-delegator');
var helpers = require('../helpers'); //waiting for ES7 destructing assigment


router.get('/', /*Checks.isLoggedIn,*/ function (req, res, next) {


    req.lectalTimer = Date.now();

    var user = req.user || req.proxyUser;
    var data = req.lectalQueryData;
    var count = data.count === 0 ? 0 : data.count || 50;
    var ignoreBlock = data.ignoreBlock === true;
    var isRanked = data.isRanked === true;
    var conditions = data.conditions || {};

    var endDate;

    if (data.endDate && isFinite(endDate = Number(data.endDate))) {

        endDate = new Date(endDate);
        if (isNaN(endDate.getTime())) {
            return next(new Error('Invalid endDate'));
        }
        conditions.dateCreated = {
            $lt: endDate
        };
    }

    var posterId = data.posterId;
    if (posterId != null) {
        conditions.posterId = posterId;
    }
    var topicId = data.topicId;

    if (topicId != null) {
        conditions['summary'] = {
            '$elemMatch': {
                id: topicId
            }
        }
    }

    Post.find(conditions).select(data['post-props'] || '').sort({dateCreated: 'desc'}).lean(true).limit(count).exec(function (err, posts) {
        if (err) {
            return next(new Error('Error fetching posts.'));
        } else {
            // TODO: enrich the reply with the topic ID and poster ID (Add Breeze in-browser ORM?)
            helpers.post.shared(posts, data, user, ignoreBlock, function (err, posts) {

                if (err) {
                    next(err);
                } else {
                    req.lectalTemp = {
                        data: posts,
                        status: 200
                    };

                    next();

                    log.debug('full posts time:', Date.now() - req.lectalTimer, delete req.lectalTimer);
                }
            });
        }
    });
});

module.exports = router;