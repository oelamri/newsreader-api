var _ = require('underscore');

module.exports = function httpRequestMiddleware$PUT(req, res, next) {

    var data = req.lectalApiData;

    var Model = data.Model;
    var conditions = data.conditions || {};
    var count = data.limit || 0;
    var isLean = data.lean !== false;  //default value for isLean to true
    var id = data.id;
    var updateData = data.updateData;
    var options = data.options || {};
    var callNext = data.callNext !== false; // default to true

    if (Object.keys(updateData).length < 1) {
        return next(new Error('no body in PUT request'));
    }

    var opts = _.defaults(options, {
        upsert: false,
        multi: false,
        safe: true,
        overwrite: true
    });

    conditions[Model.getIdName()] = id;

    Model.findOne(conditions, function (err, model) {

        if (err) {
            next(err);
        }
        else if (model) {

            model.update(updateConditions, updateData, function (err, result) {

                if (err) {
                    next(err);
                }
                else if (result) {
                    req.lectalTemp = {
                        data: result,
                        status: 200
                    };
                    next();
                }
                else {
                    next(new Error('grave error in model.save method'));
                }
            });
        }
        else {
            next(new Error('no existing model to update'));
        }
    });

};


