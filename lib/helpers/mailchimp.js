//#logging
var logger = require('lectal-logger');


//#config
var config = require('univ-config')(module, '*lectal-api*', 'config/conf');
var constants = config.get('lectal_constants');
var MAILCHIMP = constants.MAILCHIMP;

//#core
var Mailchimp = require('mailchimp-api').Mailchimp;
var _ = require('underscore');


var key = MAILCHIMP.api_key;
var list_id = MAILCHIMP.lists.Users;


var mailchimp = new Mailchimp(key);




module.exports = {

    postEmailToMailChimp: function (email, cb) {


        cb = _.once(cb);

        mailchimp.call('lists/subscribe', {
            email: {email: email},
            email_type: 'text',
            id: list_id, //users
            send_welcome: true,
            update_existing: true,
            double_optin: true,
            replace_interests: false

        }, function onResult(response) {
            console.log(response);
            cb(null, response);

        }, function onError(err) {
            console.error(err);
            cb(err);
        });


    }


};