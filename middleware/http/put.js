var log = require('lectal-logger');
var _ = require('underscore');

module.exports = function httpRequestMiddleware$PUT(req, res, next) {

    var data = req.lectalApiData;

    var Model = data.Model;
    var conditions = data.conditions || {};
    var count = data.limit || 0;
    var id = data.id;
    var isLean = data.lean !== false;  //default value for isLean to true
    var updateData = data.updateData || {};
    var options = data.options || {};
    var callNext = data.callNext !== false;  //default value for callNext to true

    if (Object.keys(updateData).length < 1) {
        return next(new Error('no body in PUT request'));
    }

    var opts = _.defaults(options, {
        upsert: false,
        multi: false,
        safe: true,
        overwrite: false,
        limit: count
    });

    if (id) {
        conditions['_id'] = id;
    }


    Model.update(conditions, updateData, opts, function (err, result) {

        if (err) {
            next(err);
        }
        else if (result) {
            if (callNext) {
                req.lectalTemp = {
                    data: result,
                    status: 200
                };
                next();
            }
            else {
                log.debug('calling next is false, so here is DB response data:', result);
            }
        }
        else {
            next(new Error('grave error in Model.update method'));
        }
    });


};


