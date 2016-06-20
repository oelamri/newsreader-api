//logging
var log = require('lectal-logger');


//core
var assert = require('assert');
var http = require('http');
var request = require('request');
var should = require('should');
var _ = require('underscore');
var debug = require('debug')('mocha');
var path = require("path");


describe('@Test_Dep_Check*', function () {


    it('passes', function (done) {

        var ndc = require('nodejs-dep-check');

        var result = ndc.run({
            verbose:true,
            ignoreModules: ['colors/safe'],
            ignoreDirs:['node_modules'],
            ignorePaths: [
                'doc',
                'public',
                'node_modules',
                'test',
                'bin/pm2.js',
                'scripts']
        });

        done(result);

    });

});