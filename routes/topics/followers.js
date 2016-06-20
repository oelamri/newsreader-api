const express = require('express');
const router = express.Router();
const Topic = require('../../models/topic');
const User = require('../../models/user');
const _ = require('underscore');

router.get('/', function(req, res){
    const id = req.params.id;

    Topic.findById(id).select('followers').exec(function(err, responseFollowers){
        if (err){
            res.status(404).send({ error : "No topics with given ID" });
        } else {
            User.find({
                'id' : {
                    '$in' : _.map(responseFollowers, function(followers){ return followers.followerId; })
                }
            }).exec(function(err, responseUsers){
               if (err){
                   res.status(404).send({ error : 'Followers of topic not found' });
               } else {
                   res.json({ success : responseUsers });
               }
            });
        }
    });
});


module.exports = router;
