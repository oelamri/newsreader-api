// logging
var log = require('lectal-logger');


//#core
var _ = require('underscore');
var async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

//#models
var User = require('../../models/user');
var Topic = require('../../models/topic');


function shared(posts, data, user, ignoreBlock, cb) {

    var filteredOutPosts = [];

    posts = posts.filter(function (post) {
        if (post.posterId && Array.isArray(post.summary)) { //TODO this should be part of the query
            return true;
        }
        filteredOutPosts.push(post);
    });

    async.parallel([

        function doUsers(cb) {

            var posterIds = _.uniq(_.pluck(posts, 'posterId')).filter(function (item) {
                return item;
            }).map(function (item) {
                return String(item);
            });

            User.find({
                $and: [
                    {
                        _id: {
                            $in: posterIds
                        }
                    },
                    {
                        'checks.isBlocked': false
                    }
                ]

            }).select(data['user-props'] || '').lean(true).exec(function (err, posters) {

                if (err) {
                    cb(new Error('Error fetching posters - \n' + err));
                }
                else {

                    posters.forEach(function (poster) {
                        if (!_.contains(posterIds, poster.posterId)) {
                            log.warn('Looks like a user was deleted from the database');
                        }
                    });

                    for (var i = 0; i < posts.length; i++) {

                        var post = posts[i];

                        if (!post.upvotes || post.upvotes.length < 1) {

                            post.isUpvoted = false;
                            post.upvoteCount = 0;
                        }
                        else {

                            post.upvoteCount = post.upvotes.length;
                            if (user) {
                                for (var j = 0; j < post.upvotes.length; j++) {
                                    if (String(post.upvotes[j].createdBy) === String(user._id)) {
                                        post.isUpvoted = true;
                                        break;
                                    }
                                }
                            }
                        }

                    }

                    var $posters = {};

                    for (var z = 0; z < posters.length; z++) {
                        var userId = String(posters[z]._id);
                        var poster = posters[z];
                        $posters[String(userId)] = poster;
                    }

                    cb(null, $posters);

                }
            });

        },
        function doTopics(cb) {

            var topicIds = _.uniq(_.pluck(_.flatten(_.pluck(posts, 'summary')).filter(function (obj) {
                return obj && String(obj.kind).toUpperCase() === 'TOPIC';
            }), 'id')).filter(function (id) {
                return id;
            });


            Topic.find({
                _id: {
                    $in: topicIds
                }
            }).select(data['topic-props'] || '').lean(true).exec(function (err, topics) {
                if (err) {
                    log.error(err);
                    return cb(new Error('Error fetching topics - ' + err));
                }
                else {

                    topics = _.object(topics.map(function (topic) {
                        return [String(topic._id), topic];
                    }));

                    cb(null, topics);
                }
            });

        }

    ], function complete(err, results) {

        if (err) {
            cb(err);
        }
        else {

            var posters = results[0];
            var topics = results[1];


            function checkForExistingTopic(post) {
                var noProblem = true;
                for (var i = 0; i < post.summary.length; i++) {
                    var item = post.summary[i];
                    if (String(item.kind).toUpperCase() === 'TOPIC') {
                        if (!topics[item.id]) {
                            noProblem = false;
                            break;
                        }
                    }
                }

                return noProblem;
            }

            posts = posts.filter(function (post) {
                if (Array.isArray(post.summary) && posters[post.posterId] && checkForExistingTopic(post)) {
                    return true;
                }
                filteredOutPosts.push(post);

            }).map(function (post) {

                post.poster = posters[post.posterId];

                post.summary = post.summary.map(function (obj) {
                    if (String(obj.kind).toUpperCase() !== 'TOPIC') {
                        return obj;
                    }
                    obj.topic = topics[obj.id] || {};
                    return obj;
                });

                var thumbnail = _.findWhere(post.summary, {kind: 'topic'});
                if (thumbnail && thumbnail.topic) {
                    post.thumbnail = thumbnail.topic.picture || {};
                }
                else {
                    post.thumbnail = {};
                }

                return post;
            });

            log.warn('The following postIds were filteredOut:', _.pluck(filteredOutPosts, '_id'));

            cb(null, {
                filterOutPosts: filteredOutPosts,
                filteredInPosts: posts
            });

        }
    });

}


module.exports = {
    shared: shared
};