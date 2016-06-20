var _ = require('underscore');


module.exports = function httpMiddleware$post(req, res, next) {


    var data = req.lectalApiData;
    var modelData = data.modelData;
    var Model = data.Model;
    var options = data.options || {};
    var callNext = data.callNext !== false; // default to true
    var newModel = new Model(modelData); //TODO: surround with try/catch?

    // save should be identical to update with upsert set to true,
    // but save goes through Mongoose schema

    var opts = _.defaults(options, {
        upsert: false
    });

    newModel.save(opts, function (err, result) {
        if (err) {
            console.error(err);
            next(err);  //saves errors in array
        }
        else if (result) {
            if(callNext){
                req.lectalTemp = {
                    data: result,
                    status: 201
                };
                next();
            }
        }
        else {
            next(new Error('grave error in model.save method'));
        }
    });
};
