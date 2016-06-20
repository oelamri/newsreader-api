const express = require('express');
const router = express.Router();
const User = require('../../models/user');

router.get('/', function (req, res) {
    User.count({}, function(err, count){
        if (err) {
            res.status(404).send({ error: String(err) });
        } else {
            res.json({ success: count });
        }
    });
});
module.exports = router;