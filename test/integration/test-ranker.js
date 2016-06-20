var testUser = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NmI1N2Y0NjdjN2Q0OGY0MjU5MDg1ZTciLCJsZWN0YWwtc2VydmljZSI6ImxlY3RhbC13ZWIiLCJleHBpcmVzT24iOiIyMDE2LTAyLTA2VDE3OjM5OjUzLjk5MloifQ.mRb6oPF3y2EN9sItSrbA4ZoKemcauozRWo-dsdmuZ50';


//test
const suman = require('C:\\Users\\denman\\WebstormProjects\\suman');
const Test = suman.Test(module, 'suman.conf.js');

//core
var URL = require('url');
var request = require('request');


Test.describe('@TestRanker*', function () {

    var config = require('univ-config')(module, '@TestRanker*', 'config/conf');


    for (var i = 0; i < 10; i++) {


        this.it('[test] ranker', {parallel: true, delay: 200}, (t, done) => {

            try {

                request.get({
                    url: config.get('lectal_env').lectal_api_server.getUrl() +'/v1/posts/initial_set',
                    qs: {
                        data: JSON.stringify({
                            conditions: {
                                'post-conditions': {
                                    '$and': []
                                }
                            }
                        })
                    },
                    json: true,
                    headers: {
                        'x-lectal-authorization': testUser
                    }

                }, function (err, resp, body) {

                    if (err) {
                        done(err);
                    }
                    else if (resp.statusCode > 201) {
                        done(new Error(resp.statusCode));
                    }
                    else {
                        done(null);
                    }

                });
            }
            catch (err) {
                done(err);
            }


        });
    }


});