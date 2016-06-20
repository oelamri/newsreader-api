var _ = require('underscore');

module.exports = function httpRequestMiddleware$PUT(req, res, next) {

    var data = req.lectalApiData;

    var Model = data.Model;
    var conditions = data.conditions || {};
    var count = data.limit || 0;
    var isLean = data.lean !== false;  //default value for isLean to true
    var updateData = data.updateData;
    var options = data.options || {};
    var callNext = data.callNext !== false; // default to true

    if (Object.keys(updateData).length < 1) {
        return next(new Error('no body in PUT request'));
    }

    var opts = _.defaults(options, {
        upsert: false,
        multi: true,
        safe: true,
        overwrite: false
    });


    Model.update(conditions, updateData, opts, function (err, result) {

        if (err) {
            next(err);
        }
        else if (result) {
            if(callNext){
                req.lectalTemp = {
                    data: result,
                    status: 200
                };
                next();
            }
        }
        else {
            next(new Error('grave error in model.save method'));
        }
    });


};


