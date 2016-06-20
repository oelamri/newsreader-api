module.exports = function httpMiddleware_$getCount(req, res, next) {


    var data = req.lectalApiData;

    var Model = data.Model;
    var conditions = data.conditions || {};
    var callNext = data.callNext !== false; // default to true

    Model.count(conditions, function (err, count) {

        if (err) {
            next(err);
        }
        else if (count !== null && count !== undefined) {
            req.lectalTemp = {
                status: 200,
                data: count
            };
            next();
        }
        else {
            next(new Error('count could not be retrieved from DB'));
        }
    });

};