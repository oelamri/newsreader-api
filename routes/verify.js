const log = require('lectal-logger');
const config = require('univ-config')(module, '*lectal-api*', 'config/conf');
const webServerConfig = config.get('lectal_env').lectal_web_server;
const webServerBaseUrl = webServerConfig.getUrl();
const express = require('express');
const router = express.Router();
const Checks = require('../middleware/checks');
const Token = require('../models/token');
const sendgridEmail = require('../lib/helpers/sendgrid.js');


router.get('/:token', function (req, res, next) {

    const token = req.params.token;

    Token.verifyUser(token, function (err) {
        if (err) {
            res.redirect(webServerBaseUrl + '/setup'); //send to login on web server
            next(new Error('user not verified'));
        }
        else {
            log.debug('success, user is now verified');
            res.redirect(webServerBaseUrl + '/login'); //send to login on web server
        }
    });
});

router.post('/', Checks.isLoggedIn, function (req, res, next) {

    const userId = req.user._id;
    const email = req.body.email;

    if (!email) {
        return next(new Error('no email sent to post handler'));
    }

    const verificationToken = new Token({});

    verificationToken.createVerificationToken(userId, function (err, token) {

        if (err) {
            return next({msg: 'Could not create verification token', error: err.stack});
        }
        else {

            const message = {
                postURL: req.protocol + '://' + req.get('host') + '/v1/verify/' + token
            };

            const data = {
                from: 'noreply@lectal.com',
                to: email,
                template: {
                    ID: 'd1653917-2ec5-4520-9df5-5b3b616c0af6'
                },
                subject: 'Verify your email on Lectal' || 'Read your news with Lectal',

                html: 'To finish setting up your Lectal account, please click the link below to verify your email.<br> <br>' +
                '<a href="' + message.postURL + '">' + message.postURL + '</a>' +
                '<br><br>Thanks,<br>' +
                'Lectal Team'
            };

            sendgridEmail.sendMail(data, function (err, info) {
                if (err) {
                    console.error(err);
                    next(new Error('error sending email'));
                }
                else {
                    res.json({
                        success: {
                            message: 'email sent successfully ' + info
                        }
                    });
                }
            });
        }
    });

});


module.exports = router;
