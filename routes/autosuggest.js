var log = require('lectal-logger');
var config = require('univ-config')(module,'*lectal-api*','config/conf');
var express = require('express');
var router = express.Router();
var algoliasearch = require('algoliasearch');
var client = algoliasearch('O1JG6K31FG', '32048f791371872f2f02dee69e2e30d6');
var indices = require('../config/algolia-indices.js');


// Gets results from searching an Algolia index
router.post('/',function(req,res,next){

    var indexName = req.params.indexName;
    var index = indices[indexName];

    if (!index) {
        return res.status(500).json({error: 'bad algolia index name'});
    }

    var searchTerms = req.body.searchTerms;

    if(!searchTerms){
        return res.status(500).json({error:'no search terms provided'});
    }

    index.search(searchTerms, function algoliaSearchComplete(err, content) {

        if(err){
           next(err);
        }
        else{
            res.status(201).json({success:content});
        }

    });

});


module.exports = router;