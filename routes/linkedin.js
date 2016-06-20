const log = require('lectal-logger');
const config = require('univ-config')(module, '*lectal-api*', 'config/conf');
const express = require('express');
const router = express.Router();

const constants = config.get('lectal_constants');
const LINKEDIN_CONFIG = constants.LINKEDIN;
const lectalEnv = config.get('lectal_env');
const host = lectalEnv.lectal_api_server.host;
const port = lectalEnv.lectal_api_server.port;
const serverUrl = [host, ':', port].join();

const authUrl = serverUrl + '/v1/linkedin/auth';

const Linkedin = require('node-linkedin')(LINKEDIN_CONFIG.clientId, LINKEDIN_CONFIG.clientSecret, authUrl);


router.get('/auth', function (req, res) {
    Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, function (err, results) {
        if (err)
            return console.error(err);

        /**
         * Results have something like:
         * {"expires_in":5184000,"access_token":". . . ."}
         */

        log.debug(results);
        return res.redirect('/');
    });
});


router.post('/add_post', function (req, res, next) {


});


router.get('/companies', function (req, res, next) {

    const user = req.user;
    const token = user.accounts.linkedin.token;

    const linkedin = Linkedin.init(token);

    linkedin.companies.company('162479', function (err, company) {
        if (err) {
            next(err);
        }
        else {
            res.json({success: company});
        }

    });
});

module.exports = router;