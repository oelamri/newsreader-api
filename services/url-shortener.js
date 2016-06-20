var Bitly = require('bitly');

var bitly = new Bitly('908c0113cdeb21cbd1ce431f16097c774c21b3b4');

module.exports = {
    shorten: function (url, cb) {
        return bitly.shorten(url);
    },
};