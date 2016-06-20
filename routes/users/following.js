const express = require('express');
const router = express.Router();
const User = require('../../models/user');

router.get('/', function(req, res){

    User.findById(req.params.id).select('following').exec(function(err, responseFollowees){
        if (err){
            res.status(404).send({ error : "No users with given ID" });
        } else {
            res.json({ success : responseFollowees || [] });
        }
    });

});

module.exports = router;