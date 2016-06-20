var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var _ = require('underscore');


function rank(posts){
    return _.sortBy(posts, function (post){
        var score = post.upvoteCount;
        if (score <= 0){
            return 0;
        } else {
            var order = Math.log10(Math.max(score, 1));
            var seconds = post.dateCreated.getTime() - 1134028003;
            return Math.round((order + seconds / 45000) * 1e7) / 1e7;
        }
    });
}


module.exports = {
    rank: rank
};
