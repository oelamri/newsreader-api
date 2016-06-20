const express = require('express');
const router = express.Router();
const Topic = require('../../models/topic');

router.get('/', function(req, res){
    const limit = req.query.limit || 20;

    const dateCreated = new Date(req.query.dateCreated);
    Topic.find({
        'dateCreated' : {
            '$lt' : dateCreated
        }
    }).sort('-dateCreated').limit(limit).exec(function(err, responseTopics){
        if (err){
            res.status(404).send({ error : "Error accessing topics" });
        } else {
            res.json({ success : responseTopics });
        }
    });
});



module.exports = router;