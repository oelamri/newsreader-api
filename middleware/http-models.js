//#config
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');

//logging
var log = require('lectal-logger');

module.exports = {

    PUT_MODEL: require('./http/put'),
    PUT_MANY_MODELS: require('./http/put-many'),
    POST_MODEL: require('./http/post'),
    GET_MODEL: require('./http/get'),
    GET_COUNT: require('./http/get-count'),
    GET_MANY_MODELS: require('./http/get-many'),
    DELETE_MODELS: require('./http/delete')

};