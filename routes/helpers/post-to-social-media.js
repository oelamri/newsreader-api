//core
var async = require('async');

//services
var socialMediaService = require('../../services/social-media');


function postToSocialMedia(data, cb) {  //this is garbage, but Omar wrote it first and I had to fix it

    var user = data.user;
    var post = data.post;
    var platforms = data.platforms;

    if(!Array.isArray(platforms)){
        return cb(new Error('Platforms is not an array'));
    }

    var potentialPlatforms = ['facebook', 'twitter', 'linkedin'];

    var actions = platforms.map(function(platform){
        return String(platform).toLowerCase().trim();
    }).filter(function (platform) {
        return potentialPlatforms.indexOf(platform) > -1; //TODO: make sure this is working as expected
    }).map(function (platform) {
        var fn;
        if (fn = socialMediaService.postToPlatform(platform)) {
            return function (cb) {
                fn(user, post, cb);
            }
        }
    }).filter(function(platform){
        return platform; //filter out undefineds
    });

    async.parallel(actions, function (err) {
        cb(err);
    });
}


module.exports = {
    postToSocialMedia: postToSocialMedia
};



