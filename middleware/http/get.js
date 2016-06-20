module.exports = function(req, res, next) {

    var data  = req.lectalApiData;

    var Model = data.Model;
    var conditions = data.conditions || {};
    var props = data.props || '';
    var count = data.limit || 0;
    var isLean = data.lean !== false;  //note: default value for isLean to true
    var id = data.id;
    var callNext = data.callNext !== false; // default to true

    if(data.count){
        throw new Error('data.count is defined where it shouldnt be');
    }

    var idName = Model.getIdName();
    conditions[idName] = id;

    Model.find(conditions).select(props).limit(count).lean(isLean).exec(function (err, items) {
        if (err) {
            next(err);
        }
        else if (items) {
            if(callNext){
                req.lectalTemp = {
                    data: items,
                    status: 200
                };
                next();
            }
        }
        else {
            next(new Error('grave error'));
        }
    });

};