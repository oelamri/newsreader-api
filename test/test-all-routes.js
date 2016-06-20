//#core


var http = require('http');
var request = require('supertest');
var assert = require('assert');
var _ = require('underscore');


describe('@Test_Lectal_API:GET*', function () {

    var self = this;

    self.config = require('univ-config')(this.title, 'config/conf');
    self.constants = self.config.get('lectal_constants');
    var serverURL = self.config.get('lectal_env').lectal_api_server.host;
    var serverPort = self.config.get('lectal_env').lectal_api_server.port;
    self.apiServerUrl = serverURL + ':' + serverPort;


    self.testCases = [
        {
            path: '/v1/users',
            query:{}
        },
        {
            path: '/v1/topics',
            query:{}
        },
        {
            path: '/v1/posts',
            query:{}
        }
    ];


    self.testCases.forEach(function (testCase) {

        it('[test] ' + testCase.path, function (done) {

            request(self.apiServerUrl)
                .get(testCase.path)
                .set('sc_test_env', process.env.NODE_ENV)
                .set('Accept', 'application/json')
                .query(testCase.query)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    }
                    else {
                        done();
                    }
                });
        });

    });


    it('Should return 200 when /info is called.', function (done) {
        request(self.apiServerUrl)
            .get('/info')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
    });

});

