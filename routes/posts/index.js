const express = require('express');
const router = express.Router();
const Post = require('../../models/post');
const Topic = require('../../models/topic');
const config = require('univ-config')(module, '*lectal-api*', 'config/conf');
const async = require('async');
const mongoose = require('mongoose');
const path = require('path');
const ranker = require('../../services/ranker-delegator');
const helpers = require('../helpers'); //waiting for ES7 destructing assigment
const log = require('lectal-logger');
const Checks = require('../../middleware/checks');
const bitly = require('../../services/url-shortener.js');
const _ = require('underscore');


router.use('/initial_set', require('./initial-set'));
router.use('/next_set', require('./next-set'));
router.use('/full', require('./full'));
router.use('/count', require('./count'));
router.use('/:id/edit', require('./edit'));
router.use('/:id/hide', require('./hide'));
router.use('/:id/unhide', require('./unhide'));
router.use('/:id/add_to_frontpage', require('./add-to-frontpage'));
router.use('/:id/remove_from_frontpage', require('./remove-from-frontpage'));
router.use('/:id/upvote', require('./upvote'));
router.use('/:id/remove_upvote', require('./remove-upvote'));
router.use('/:id/upvote_count', require('./upvote-count'));


router.get('/', function(req, res) {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 150;
    Post.find({}).sort('-dateCreated').limit(limit).lean().exec(function(err, responsePosts){
        if(err){
            // Send error log and message
            res.status(404).send({ error : "Error accessing posts" });
        }else{

            // Get all topic hashtags from all posts as an array of unique hashtags
            const topicIds = _.uniq(_.flatten(_.map(responsePosts, function(post){
                return _.map(_.filter(post.summary, function(token){
                    return token.kind === 'topic' && token.id;
                }), function(token){
                    return token.id;
                });
            })));


            Topic.find({
                '_id' : {
                    '$in' : topicIds
                }
            }).lean().exec(function(err, responseTopics){
                if (err){
                    // Send error log and message
                    res.status(404).send({ error : "Error accessing topics" });
                } else {

                    // For each post, add the "name", "hashtag", and "picture" values for all
                    // tokens in each summary where the kind of the token is "topic"
                    const postsWithTopicInfo = _.map(responsePosts, function(post){

                        // For each token in the summary, check if the token is of kind "topic"
                        // and if so, add the topic values to the summary
                        const summary = _.map(post.summary, function(token){
                            if (token.kind === 'topic'){
                                const topic = _.find(responseTopics, function(topic){
                                    return String(topic._id) === String(token.id);
                                });
                                if (topic) {
                                    return Object.assign({},{
                                        name : topic.name,
                                        hashtag : topic.hashtag,
                                        picture : topic.picture
                                    }, token);

                                } else {
                                    return token;
                                }
                            } else {
                                return token;
                            }
                        });
                        return Object.assign({}, post, {summary : summary});
                    });

                    res.json({
                        success : postsWithTopicInfo
                    });
                }
            });
        }
    });
});

router.get('/:id', function (req, res) {

    Post.findById(req.params.id, function(err, responsePost) {

        if(err) {
            res.status(404).send({ error : "No posts with given ID" });
        } else {
            res.json({ success : responsePost });
        }
    });

});



router.post('/', /*Checks.isLoggedIn,*/ function(req, res){
    const pictureUrl = req.body.picture;
    const summary = req.body.summary;
    const string = req.body.string;
    const linkFull = req.body.link;

    var post = null;

    bitly.shorten(String(linkFull)).then(
        function(response) {
            const linkShort = response.data.url;

            async.parallel([
                function getRemainingImageURLsFromCloudinary(cb) {
                    helpers.images.uploadImageViaURL(pictureUrl, cb);
                },
                function savePostInitial(cb) {
                    post = new Post({
                        picture: {
                            original:pictureUrl
                        },
                        summary: summary,
                        link: linkShort,
                        string: string
                    });

                    post.save(function (err) {

                        if (err) {

                            cb({msg: 'Error saving post', error: err.stack});
                        }
                        else {
                            cb(null);
                        }

                    });
                }
            ], function complete(err, results){
                if (err) {
                    res.status(500).send({
                       error: err
                    });
                } else {
                    if (results[0] && results[0].medium && results[0].large) {

                        post.picture.original = pictureUrl;
                        post.picture.large = results[0].large;
                        post.picture.medium = results[0].medium;

                        post.save(function savePostAgain(err, post) {
                            if (err) {
                                res.status(500).send({
                                    error: err
                                });
                            } else {

                                res.json({
                                    success: post
                                });
                            }
                        });
                    } else {
                        res.status(500).send({
                            error: 'Bad images returned by helper function.'
                        });
                    }
                }
            });
        }
    );
});


// DEV ONLY
router.post('/create', function(req, res){
    var post = new Post({
        link : req.body.link,
        string : req.body.string
    });

    post.save(function(err, post){
        if (err){
            res.send({ error: "Error" });
        } else {
            res.send({ success: {} });
        }
    });
});



module.exports = router;