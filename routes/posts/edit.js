const express = require('express');
const router = express.Router();
const Post = require('../../models/post');
const Checks = require('../../middleware/checks');


router.post('/', /*Checks.isLoggedIn,*/ function(req, res){
    const summary = req.query.summary;
    const string = req.query.string;
    const id = req.params.id;

    Post.findById(id).exec(function(err, responsePost){
        if (err){
            res.status(404).send({ error : "No posts with given ID" });
        } else {
            Post.update({'_id' : id }, {
                '$push' : {
                    'versions' : {
                        'summary' : responsePost.summary,
                        'string' : responsePost.string
                    }
                },
                'summary' : summary,
                'string' : string
            });
        }
    });

});


module.exports = router;