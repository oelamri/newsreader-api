const express = require('express');
const router = express.Router();
const Post = require('../../models/post');
const Notification = require('../../models/notification');
const Checks = require('../../middleware/checks');
const moment = require('moment');

router.post('/', /*Checks.isLoggedIn,*/ function(req, res){

    const userId = req.user._id;
    const postId = req.params.id;

    Post.update({ '_id' : postId },
        { '$push' :
            { 'upvotes' :
                {   'dateCreated' : new Date(),
                    'userId' : userId
                }
            }

        }
    ).then(function(){
        Post.findById(postId).select('createdBy').exec(function(err, posterId){
            if (err){
                // TODO: Error handling here
            } else {

                Notification.find({
                    'userId' : posterId,
                    'dateCreated' : {
                        '$gte' : moment().subtract(24, 'hours')
                    },
                    'message': {
                        'did' : 'upvote',
                        'what' : {
                            'kind' : 'post',
                            'id' : postId
                        }
                    }
                }).exec(function(err, responseNotification){
                    if (err){
                        var notification = new Notification({
                            'userId' : userId,
                            'message': {
                                'did' : 'upvote',
                                'what' : {
                                    'kind' : 'post',
                                    'id' : postId
                                }
                            }
                        });

                        notification.save(function(err, notification) {
                            if (err){
                                // TODO: Error handling here
                            } else {

                            }
                        });

                    } else {
                        Notification.update({ 'userId' : responseNotification.userId },{
                            '$push' : {
                                'message.who' : userId
                            },
                            'dateUpdated' : Date.now()
                        });
                    }
                });

            }
        });
    });


});

module.exports = router;