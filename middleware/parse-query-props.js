var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var log = require('lectal-logger');

module.exports = {

    parseData: function (req, res, next) {
        if (req.query.data) {
            try {
                req.lectalQueryData = JSON.parse(req.query.data);
                log.debug('parsed data query param\n:', req.lectalQueryData);
                next();
            }
            catch (err) {
                next(new Error('Parsing error on "data" property of query object.'));
            }
        }
        else{
            req.lectalQueryData = {};
            next();
        }
    }

};