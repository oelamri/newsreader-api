const express = require('express');
const router = express.Router();
const Checks = require('../../middleware/checks');

router.post('/', /*Checks.isLoggedIn,*/ function(req){

    Follow.remove({
        'followerId' : req.user,
        'followeeId' : req.params.id
    });

});

module.exports = router;