const express = require('express');
const router = express.Router();
const Source = require('../../models/source');

router.get('/', function(req, res) {
  Source.find({}).sort('name').lean().exec(function(err, responseSources) {
    if (err) {
      res.send({
        error : err
      });
    } else {
      res.json({
        success : responseSources
      });
    }
  });
});

router.get('/:id', function(req, res) {
  var id = req.params.id;
  Source.findById(id).lean().exec(function(err, responseSource){
    if (err) {
      res.send({
        error : err
      });
    } else {
      res.json({
        success : responseSource
      });
    }
  });
});


router.post('/', function(req, res) {

  const name = req.body.name;
  const url = req.body.url;

  if (name && url) {
    Source.findOne({
      'url' : url
    }).exec(function(err, responseSource) {
      if (err) {
        res.send({ error : err });
      } else {
        if (responseSource) {
          res.send({
            error : {
              msg : "Source with given url already exists",
              name : name,
              url : url
            }
          });
        } else {
          const source = new Source({
            name : name,
            url : url
          });

          source.save(function(err, source) {
            if (err) {
              res.send({ error : err });
            } else {
              res.send({
                success : source
              });
            }
          });
        }
      }
    });
  } else {
    res.send({
      error : "Name and url of source must both be provided"
    });
  }


});

module.exports = router;