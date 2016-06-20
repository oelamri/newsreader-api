var jwt = require('jwt-simple');

var auth = jwt.encode({
        "lectal-service": "lectal-manager",
        "_id": 1
    },
    'dfgdfsgfd09+');

console.log(auth); ///