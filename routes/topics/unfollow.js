const express = require('express');
const router = express.Router();
const Checks = require('../../middleware/checks');


router.put('/', /*Checks.isLoggedIn,*/ function(req){
    const userId = req.user;
    const topicId = req.params.id;

    Follow.remove({
        'followerId' : userId,
        'followeeId' : topicId
    });

});

module.exports = router;