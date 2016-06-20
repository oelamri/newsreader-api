//#core
var http = require('http');
var request = require('supertest');
var assert = require('assert');
var _ = require('underscore');
var debug = require('debug')('mocha');
var defaultHeader = require('../config/default-header');


describe('@Test_Lectal_API:POST*', function () {

    var self = this;

    self.config = require('univ-config')(this.title, 'config/conf');
    self.constants = self.config.get('lectal_constants');
    var serverURL = self.config.get('lectal_env').lectal_api_server.host;
    var serverPort = self.config.get('lectal_env').lectal_api_server.port;
    self.apiServerUrl = serverURL + ':' + serverPort;


    self.testCases = [
        {
            path: '/v1/users',
            query: {
                handle: 'jimbo'
            },
            data: {
                username: 'jimbo'
            },
            expectCode: 201
        },
        {
            path: '/v1/topics',
            query: {
                handle: 'handle766'
            },
            data: {
                hashtag: 'handle766'
            },
            expectCode: 201
        },
        {
            path: '/v1/posts',
            query: {},
            data: {
                username: 'jimbo'
            },
            expectCode: 201
        }
    ];


    self.testCases.forEach(function (testCase) {

        it('[test] ' + testCase.path, function (done) {

            request(self.apiServerUrl)
                .post(testCase.path)
                .set('sc_test_env', process.env.NODE_ENV)
                .set('Accept', 'application/json')
                .set(defaultHeader)
                .query(testCase.query)
                .query({proxy: 52})
                //.expect('Content-Type', /json/)
                .send(testCase.data)
                .expect(testCase.expectCode)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                    }
                    else {
                        debug(res);
                        done();
                    }
                });
        });

    });

});

