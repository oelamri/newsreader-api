const express = require('express');
const router = express.Router();
const Post = require('../../models/post');
const Checks = require('../../middleware/checks');


router.put('/',/*Checks.isLoggedIn,*/ function(req){

    const userId = req.user._id;

    Post.update({ '_id' : req.params.id },
        { '$pull' :
            { 'upvotes' :
                { 'createdBy' : userId }
            }
        }
    );
});


module.exports = router;