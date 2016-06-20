var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var options = {
    auth: {
        api_user: 'sdafds@heroku.com',
        api_key: 'safsfgdsagfds'
    },
    template: {
        ID: '0b1daf55-fb91-sds-b0f4-safgsgfs'
    }
};

var client = nodemailer.createTransport(sgTransport(options));


exports.sendMail2 = function (email, cb) {
    client.sendMail(email, function (err, info) {
        cb(err, info);
    });
};

exports.sendMail = function (data, cb) {
    client.sendMail(data, function (err, info) {
        cb(err, info);
    });
};


exports.sendMailExample = function (cb) {

    var message = {
        postURL: req.protocol + "://" + req.get('host') + "/v1/posts/by_id/" + id
    };

    var data = {
        from: 'curator@lectal.com',
        to: email,
        template: {
            ID: 'd1653917-2ec5-4520-9df5-sdafdsfdsf'
        },
        subject: 'Read your news with Lectal',
        text: message.postURL,
        html: '<p>Your post has been edited by Lectals team of community managers: <a href="' + message.postURL + '">View your post</a></p>'
    };

    sendgridEmail.sendMail(data, function (err, info) {
        if (err) {
            console.error(err);
            return next(new Error('error sending email'));
        }
        else {
            console.log('Message sent: ' + info);
            res.send({
                success: {
                    message: 'email sent successfully ' + JSON.stringify(info)
                }
            });
        }
    });
};


