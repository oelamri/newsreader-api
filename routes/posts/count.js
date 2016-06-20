const express = require('express');
const router = express.Router();
const Post = require('../../models/post');

router.get('/', function(req, res){

    // Get the kind and id
    const kind = req.query.kind;
    const id = req.query.id;

    // Params specified
    if (kind && id){

        // For topics
        if (kind === "topic"){
           Post.find({}).where('summary').elemMatch({
               kind : 'topic',
               id : id
           }).count({}, function(err, responseCount){
               if(err) {
                   res.sendStatus(404).send({ error : "Error accessing posts" });
               } else {
                   res.json({ success : responseCount });
               }
           });
        }

        // For users
        else if (kind === "user"){
            Post.count({
                posterId : id
            }, function(err, responseCount){
                if(err) {
                    res.sendStatus(404).send({ error : "Error accessing posts" });
                } else {
                    res.json({ success : responseCount });
                }
            });
        }

        // Kind not user or topic
        else {
            res.sendStatus(404);
        }
    }

    // Params not specified, getting count for all posts
    else{
        Post.count({}, function(err, responseCount){
            if(err) {
                res.sendStatus(404).send({ error : "Error accessing posts" });
            } else {
                res.send({
                    success : responseCount
                });
            }
        });
    }



});

module.exports = router;