//#logging
var log = require('lectal-logger');


//#config
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var constants = config.get('lectal_constants');


/////////////////////////////


module.exports = {
    quote: function (str) {
        return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
    }
};