var jwt = require('jwt-simple');
var secret = 'cantona07+';


module.exports = {

    generateToken: function (user) {
        return jwt.encode({
            "_id": user._id,
            "lectal-service": "lectal-api"
        }, secret);
    }

};