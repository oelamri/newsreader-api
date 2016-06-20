const express = require('express');
const router = express.Router();
const Post = require('../../models/post');
const Checks = require('../../middleware/checks');

router.post('/', /*Checks.isLoggedIn,*/ function(req){

    Post.update({ '_id' : req.params.id, posterId : req.user._id }, { isHidden : true });

});


module.exports = router;