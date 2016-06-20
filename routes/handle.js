const config = require('univ-config')(module, '*lectal-api*', 'config/conf');
const express = require('express');
const router = express.Router();
const Handle = require('../models/handle');
const Checks = require('../middleware/checks');
const helpers = require('./helpers');


const handleFormat = /^[A-Za-z0-9_]{1,25}$/;


router.post('/insert_handle', Checks.isLoggedIn, function (req, res, next) {

    const originalHandle = String(req.body.handle);
    const kind = String(req.body.kind);

    if (!handleFormat.test(originalHandle)) {
        return next(new Error('handle has a bad format'));
    }

    const handle = originalHandle.toLowerCase();

    helpers.handle.insertHandle({
        kind: kind,
        handle: handle,
        originalHandle: originalHandle
    }, function (err) {
        if (err) {
            next(err);
        }
        else {
            res.json({
                success: 'successfully inserted new handle with value: ' + handle
            });
        }
    });
});

router.get('/blacklisted', function (req, res, next) {

    Handle.find({isBlacklisted:true}).lean(true).select('handle').exec(function(err,models){
        if(err){
            next(err);
        }
        else{
            res.json({
                success: models
            });
        }
    });
});


// DEV ONLY
router.post('/create', function(req, res){
    var handle = new Handle({
        kind : req.body.kind,
        handle : req.body.handle
    });

    handle.save(function(err, handle){
        if (err){
            res.send({error: "Error"});
        } else {
            res.send({ success: {} });
        }
    });
});

module.exports = router;