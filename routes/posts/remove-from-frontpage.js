const express = require('express');
const router = express.Router();
const Post = require('../../models/post');
const Checks = require('../../middleware/checks');


router.put('/', /*Checks.isLoggedIn,*/ function(req){
    Post.update({ '_id' : req.params.id }, { isFrontPage : false });
});

module.exports = router;