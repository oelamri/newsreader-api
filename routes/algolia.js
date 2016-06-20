var log = require('lectal-logger');
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var express = require('express');
var router = express.Router();
var _ = require('underscore');
var async = require('async');
var client = require('../config/algolia-client.js');
var indices = require('../config/algolia-indices.js');


var models = {
    topics: {
        model: require('../models/topic'),
        pick: ['_id', 'name', 'hashtag', 'image']
    },

    users: {
        model: require('../models/user'),
        pick: ['_id', 'fullname', 'username', 'picture']
    }
};




router.get('/index_name/:indexName', function (req, res, next) {

    //TODO: use this code only on front-end?

    var indexName = req.params.indexName;

    var index = indices[indexName];

    if (!index) {
        return res.status(500).json({error: 'bad algolia index name'});
    }

    var st = req.query.st || '';

    index.search(st, function searchDone(err, content) {
        if (err) {
            next(err);
        }
        else {
            res.json({success: content});
        }
    });

});

router.get('/list_indexes', function (req, res, next) {

    client.listIndexes(function (err, content) {

        if (err) {
            next(err);
        }
        else {
            res.status(200).json({success: content});
        }
    });
});

router.get('/browse_all/index_name/:indexName', function (req, res, next) {

    var indexName = req.params.indexName;
    var index = indices[indexName];

    if (!index) {
        return res.status(500).json({error: 'bad algolia index name'});
    }

    var hits = [];

    var cursor = index.browseAll();

    cursor.on('result', function onResult(content) {
        hits = hits.concat(content.hits);
    });

    cursor.on('end', function onEnd() {
        if (!res.headersSent) {
            res.status(200).json({success: hits});
        }
    });

    cursor.on('error', function onError(err) {
        cursor.stop();
        if (!res.headersSent) {
            next(err);
        }
    });

});


router.delete('/index_name/:indexName', function (req, res, next) {

    var data = req.lectalQueryData;
    var force = data.force;

    if (force === true) {

        var indexName = req.params.indexName;
        var index = indices[indexName];

        if (!index) {
            return res.status(500).json({error: 'bad algolia index name'});
        }

        client.deleteIndex(indexName, function (err) {
            if (err) {
                res.status(500).json({error: err.message});
            }
            else {
                res.status(200).json({success: true});
            }
        });
    }
    else {
        res.status(500).json({error: 'bad algolia query'})
    }

});

router.post('/load/index_name/:indexName', function (req, res, next) {

    //note: use this to load an Algolia index from scratch, otherwise the Algolia Oplog tailing project will handle all new data


    var indexName = req.params.indexName;
    var index = indices[indexName];

    if (!index) {
        return next(new Error('bad algolia index name =' + indexName));
    }

    var indexModel = models[indexName];

    if (!indexModel) {
        return next(new Error('algolia indexname does not match any items in models hash'));
    }

    var Model = indexModel.model;
    var picks = indexModel.pick;


    if (req.query.clear === true) {
        index.clearIndex(function (err) {
            if (err) {
                res.status(500).json({error: err.message});
            }
            else {
                addToIndex();
            }
        });
    }
    else {
        addToIndex();
    }

    function addToIndex() {

        Model.find({}).lean().exec(function (err, models) {

            if (err) {
                res.status(500).json({error: err.message});
            }
            else {

                models = models.map(function (model) {
                    model = _.pick(model, picks);
                    model.objectID = model._id;
                    delete model._id;

                    switch (String(Model.modelName).toUpperCase()) {

                        case 'TOPIC':

                            split = (model.name || '').match(/\S+/g) || [];   // match function does not always return array, so need to safeguard it

                            var length = split.length;
                            if (length < 1) {
                                console.error('strange length of data in algolia route');
                            }

                            model.name_word_count = split.length || 0;

                            break;

                        case 'USER':

                            split = (model.fullname || '').match(/\S+/g) || []; // match function does not always return array, so need to safeguard it

                            var length = split.length;
                            if (length < 1) {
                                console.error('strange length of data in algolia route');
                            }

                            model.fullname_word_count = split.length || 0;

                            break;

                        default:

                    }

                    return model;
                });


                index.addObjects(models, function (err, content) {
                    if (err) {
                        console.error(err);
                        next(err);
                    }
                    else {
                        log.debug('content from Algolia:', content);
                        res.status(201).json({success: content});
                    }
                });

            }
        });
    }

});


module.exports = router;