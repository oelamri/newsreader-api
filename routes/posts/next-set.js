const express = require('express');
const router = express.Router();
const Post = require('../../models/post');

router.get('/', function(req, res){

    Post.find({
        '_id' : {
            '$in': req.query.postIds
        }
    }).exec(function(err, responsePosts){
        if (err){
            res.status(404).send({ error : "No posts with given ids" });
        } else {
            res.json({ success : responsePosts });
        }
    });
});

module.exports = router;