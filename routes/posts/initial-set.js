'use strict';

const express = require('express');
const router = express.Router();
const async = require('async');
const Post = require('../../models/post');
const Topic = require('../../models/topic');
const _ = require('underscore');
const ranker = require('../../services/ranker');

function insertTopicInfoInSummary(post, cb){

    // 1) Get topic ids from post
    const topicIds = _.filter(post.summary, function(token){
        return token.kind === 'topic';
    }).map(function(token){
        return token.id;
    });

    Topic.find({
        '_id' : {
            '$in' : topicIds
        }
    }).lean().exec(function(err, topics){
        if (err){
            cb(err, null);
        } else {
            const newSummary = post.summary.map(function(token){
                if (token.kind === 'topic') {

                    const matchedTopic = _.find(topics, function(topic){
                        return String(topic._id) === String(token.id);
                    });


                    if (matchedTopic) {
                        return {
                            id: matchedTopic._id,
                            name: matchedTopic.name,
                            hashtag: matchedTopic.hashtag,
                            picture: matchedTopic.picture,
                            kind: 'topic'
                        };
                    } else {
                        return token;
                  }
                } else {
                    return token;
                }
            });

            const newPost = _.extend(post, {summary : newSummary});

            console.log("Post");
            console.log(newPost);
            cb(null, newPost);
        }
    });


}


function insertTopicInfoInSummaries(posts, cb) {
    async.parallel(posts.map(function(post) {
        return function(cb) {
            insertTopicInfoInSummary(post, cb);
        };
    }), cb);
}


// Get first 10 post whole objects + next 140 post id
router.get('/', function (req, res) {

    const isRanked = req.query.ranked || false;

    Post.aggregate([
        {   $project :
            {   upvoteCount : { $size : '$upvotes' },
                dateCreated : 1,
                _id : 1

            }
        },
    ]).sort('-dateCreated').limit(150).exec(function(err, unsortedPosts){
        if (err){
            res.status(404).send({ error : "Error while looking up posts" });
        } else {

            const sortedPosts = isRanked ? ranker.rank(unsortedPosts) : unsortedPosts;

            Post.find({
                '_id': {
                    $in: _.map(_.first(sortedPosts,10), function(x){ return x._id;})
                }
            }).lean().exec(function(err, responsePosts){
                if (err){
                    res.status(404).send({ error : "Error while looking up posts" });
                } else {

                    insertTopicInfoInSummaries(responsePosts, function(err, initialPosts){
                       if (err) {
                           res.status(500).send({
                               error: err
                           });
                       } else {
                           res.json({
                              success: {
                                  initialPosts: initialPosts,
                                  remainingPostIds: _.rest(sortedPosts, 10)
                              }
                           });
                       }
                    });



                }
            });
        }
    });
});

module.exports = router;