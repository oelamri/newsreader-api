const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Checks = require('../../middleware/checks');


router.use('/count', require('./count'));
router.use('/:id/notifications', require('./notifications'));
router.use('/:id/add_notification', require('./add-notification'));
router.use('/:id/followers', require('./followers'));
router.use('/:id/following', require('./following'));
router.use('/:id/follow', require('./follow'));
router.use('/:id/unfollow', require('./unfollow'));
router.use('/:id/block', require('./block'));
router.use('/:id/unblock', require('./unblock'));

router.get('/', function(req, res){
    User.find({}).sort('fullname').exec(function(err, responseUsers){
        if (err){
            res.status(404).send({ error : "Error accessing users" });
        } else {
            res.json({ success : responseUsers });
        }
    });
});


router.get('/:id', function(req, res){
    const id = req.params.id;
    User.findById({ '_id' : id }).exec(function(err, responseUser){
        if (err){
            res.status(404).send({ error : "No users with given ID" });
        } else {
            res.json({ success : responseUser });
        }
    });
});

// DEV ONLY
router.post('/create', function(req, res){
    var user = new User({
        email : req.body.email,
        username : req.body.username,
        fullname : req.body.fullname,
        picture : req.body.picture
    });

    user.save(function(err, user){
        if (err){
            res.send({error: "Error"});
        } else {
            res.send({ success: {} });
        }
    });
});


router.post('/:id', /*Checks.isLoggedIn,*/ function(req){

    const id = req.params.id;

    User.update({ '_id' : id }, req.body);

});


module.exports = router;