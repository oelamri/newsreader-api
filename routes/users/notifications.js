const express = require('express');
const router = express.Router();
const Notification = require('../../models/notification');

router.get('/', function(req,res){

    Notification.find({ 'userId' : req.params.id }).exec(function(err, responseNotifications){
        if (err){
            res.status(404).send({ error : "Error fetching notifications" });
        } else {
           res.json({ success : responseNotifications });
        }
    });

});

module.exports = router;