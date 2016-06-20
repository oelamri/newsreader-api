const express = require('express');
const router = express.Router();
const Topic = require('../../models/topic');
const Handle = require('../../models/handle');
const Checks = require('../../middleware/checks');

router.use('/next_set', require('./next-set'));
router.use('/:id/follow', require('./follow'));
router.use('/:id/unfollow', require('./unfollow'));
router.use('/:id/followers', require('./followers'));


router.get('/', function(req, res){
   Topic.find({}).sort('name').exec(function(err, responseTopics){
       if (err){
            res.status(404).send({ error : "Error accessing topics" });
       } else {
            res.json({ success : responseTopics });
       }
   });
});


router.get('/:id', function(req, res){
    var id = req.params.id;
    Topic.findById(id).exec(function(err, responseTopic){
        if (err){
            res.status(404).send({ error : "No topics with given ID" });
        } else {
            res.json({ success : responseTopic });
        }
    });
});

// Create a new topic
router.post('/', /*Checks.isLoggedIn,*/ function(req, res){
    //const userId = req.user._id;
    const hashtag = req.body.hashtag;
    const name = req.body.name;
    const picture = req.body.picture;
    const googleData = req.body.googleData;

    Handle.findOne({ 'handle' : hashtag }).exec(function(err, responseHandle){
        if (err || !responseHandle) {
            const topic = new Topic({
                name : name,
                hashtag : hashtag,
                picture : picture,
                googleData : googleData
                //creatorId : userId
            });

            const handle = new Handle({
                kind : 'topic',
                handle : hashtag
            });

            topic.save(function(err, topic){
                if (err) {
                    res.status(500).send({ error : err });
                } else {
                    handle.save(function(err, handle){
                        if (err){
                            res.status(500).send({ error : err });
                        } else {
                            // Everything went smoothly
                            res.json({
                                success : {
                                    topicId: topic._id,
                                    name: topic.name,
                                    hashtag: topic.hashtag,
                                    picture: topic.picture
                                }
                            });
                        }
                    });
                }
            });
        } else {
            if (responseHandle.kind === 'topic') {
                Topic.findOne({ 'hashtag' : responseHandle.handle }).exec(function(err, responseTopic){
                    if (err) {
                        res.status(500).send({
                           error: err
                        });
                    } else {

                        const topic = {
                            topicId: responseTopic._id,
                            name: responseTopic.name,
                            hashtag: responseTopic.hashtag,
                            picture: responseTopic.picture
                        };

                        res.json({
                            success: topic
                        });
                    }
                });
            } else {
                res.status(404).send({
                    error: {
                        msg: "A handle already exists by this name",
                        handle: hashtag
                    }
                });
            }
        }
    });

});

// DEV ONLY
router.post('/create', function(req, res){
    var topic = new Topic({
        name : req.body.name,
        hashtag : req.body.hashtag,
        picture : req.body.picture
    });

    topic.save(function(err, topic){
        if (err){
            res.send({error: "Error"});
        } else {
            res.send({ success: {} });
        }
    });
});


module.exports = router;