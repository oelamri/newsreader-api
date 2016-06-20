var moment = require('moment');
var _ = require('underscore');


var obj = [

    {
        "cat": 2,
        "dateCreated": Date.now()-1000
    },

    {
        "animal": 5,
        "dateCreated": Date.now()-4000
    }

];




var follows = _.groupBy(obj.filter(function (notif) {
    return notif;
}), function (notif) {
    return moment(notif.dateCreated).startOf('day').format();
});


console.log(follows);