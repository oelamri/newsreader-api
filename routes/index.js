var express = require('express');
var router = express.Router();

// Homepage
router.get('/', function (req, res) {

    res.render('index', {
        title: 'Lectal API index page'
    });
});

module.exports = router;
