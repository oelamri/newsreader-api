const express = require('express');
const router = express.Router();
const Follow = require('../../models/follow');
const Checks = require('../../middleware/checks');

router.post('/', /*Checks.isLoggedIn,*/ function(req, res){
    const userId = req.user;
    const topicId = req.params.id;

    Follow.find({
        'followerId' : userId,
        'followeeId' : topicId
    }).exec(function(err, matches){
        if (err){
            res.status(404).send({ error : "Error accessing follows" });
        } else {
            if (matches.length > 0) {
                res.status(200).send({ error : "User already follows topic" });
            } else {
                var follow = new Follow({
                    followerId : userId,
                    followeeId : topicId,
                    kind : "topic"
                });

                follow.save(function(err, follow){
                    if (err){
                        // TODO: Error handling here
                    } else {

                    }
                });
            }
        }
    });
});

module.exports = router;