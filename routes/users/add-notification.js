const express = require('express');
const router = express.Router();
const Checks = require('../../middleware/checks');
const Notification = require('../../models/notification');


router.post('/', /*Checks.isLoggedIn,*/ function(req){

    const notification = new Notification({
        userId : req.params.id,
        message : req.message
    });

    notification.save(function(err, notification){
        if (err){
            // TODO : Handle errors here
        } else {

        }
    })
});

module.exports = router;