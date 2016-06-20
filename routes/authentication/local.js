const config = require('univ-config')(module, '*lectal-web*', 'config/conf');
const express = require('express');
const router = express.Router();
const base64url = require('base64url');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;


passport.use(new JwtStrategy({
    secretOrKey : "super secret key",
    jwtFromRequest : ExtractJwt.fromAuthHeader()
}, function(payload, done){
    User.findOne({ '_id' : payload.id}, function(err, user){
        if (err){
            return done(err, false);
        } else if (user){
            done(null, user);
        } else {
            done(null, false);
        }
    });
}));

router.get('/', function (req, res) {
    res.render('connect-local.ejs', {message: req.flash('loginMessage')});
});

router.post('/', passport.authenticate('jwt', {
    successRedirect: '/profile',
    failureRedirect: '/connect/local',
    failureFlash: true
}));

module.exports = router;