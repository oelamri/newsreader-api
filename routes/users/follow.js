const express = require('express');
const router = express.Router();
const Follow = require('../../models/follow');
const Checks = require('../../middleware/checks');

router.post('/', /*Checks.isLoggedIn,*/ function(req, res){
    const followerId = req.user;
    const followeeId = req.params.id;

    Follow.find({
        followerId : followerId,
        followeeId : followeeId
    }).exec(function(err, responseFollows){
        if (err){
            // TODO: Handle errors here
        } else {
            if (responseFollows.length > 0){
                // Follower already follows followee
            } else {
                const follow = new Follow({
                    followerId : followerId,
                    followeeId : followeeId,
                    kind : 'user'
                });

                follow.save(function(err, follow){
                    if (err){
                        // TODO: Handle errors here
                    } else {

                    }
                });
            }
        }
    })
});

module.exports = router;