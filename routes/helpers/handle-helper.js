//#models
var Handle = require('../../models/handle');


module.exports = {

    insertHandle: function (data, cb) {

        var kind = data.kind;
        var handleName = data.handle;
        var originalHandle = data.originalHandle;

        var handle = new Handle({
            kind: kind,
            handle: handleName,
            originalHandle: originalHandle
        });

        handle.save(function (err) {
            cb(err);
        });
    }

};