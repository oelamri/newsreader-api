function pessimisticDelete(Model, model_id, req, res, next) {


    function done(err, result) {
        if (err) {
            res.json({error: err.toString()});
            next(err);
        }
        else {
            res.json({success: result});
        }
    }


    Model.remove({_id: model_id}, function (err) {
        if (err) {
            done({error: err.toString()});
        }
        else {
            done({success: model_id});
        }
    });

}


function optimisticDelete(Model, model_id, req, res, next) {


    Model.remove({_id: model_id});



    req.json({success: model_id});
}


function del(Model, model_id, req, res, next) {

    if (!Model) {
        throw new Error('model is null');
    }

    if (req.query.optimisticDelete) {
        optimisticDelete.apply(null, arguments);
    }
    else {
        pessimisticDelete.apply(null, arguments);
    }
}

module.exports = del;