const express = require('express');
const router = express.Router();
const Post = require('../../models/post');
const Checks = require('../../middleware/checks');

router.post('/', /*Checks.isLoggedIn,*/ function(req){
    Post.update({ '_id' : req.params.id }, { isFrontPage : true });
});

module.exports = router;