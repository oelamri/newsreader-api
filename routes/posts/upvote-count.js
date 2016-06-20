const express = require('express');
const router = express.Router({mergeParams: true});
const Post = require('../../models/post');
const mongoose = require('mongoose');

router.get('/', function (req, res) {

    Post.aggregate([
        { $project :
            { upvoteCount :
                { $size : '$upvotes' }
            }
        },
        { $match :
            { '_id' : new mongoose.Types.ObjectId(req.params.id) }
        }
    ]).exec(function(err, responsePost){
        if (err || !responsePost[0]) {
            res.status(404).send({ error : "No posts exist with given ID" });
        } else {
            res.json({ success: responsePost[0].upvoteCount });
        }
    });

});

module.exports = router;