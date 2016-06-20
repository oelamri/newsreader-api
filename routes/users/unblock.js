const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Checks = require('../../middleware/checks');

router.post('/', Checks.isAdmin, function(req){
    User.update({ '_id' : req.params.id }, {
        '$set' : {
            'checks.isBlocked' : false
        }
    });
});

module.exports = router;