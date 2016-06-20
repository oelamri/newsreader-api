var testUser = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NmI1N2Y0NjdjN2Q0OGY0MjU5MDg1ZTciLCJsZWN0YWwtc2VydmljZSI6ImxlY3RhbC13ZWIiLCJleHBpcmVzT24iOiIyMDE2LTAyLTA3VDA5OjMxOjM0Ljk0N1oifQ.7vcWqHd_2nQSLtkQSK2iAY6ubAhQsLP4nGCSwyuusBc';

const suman = require('C:\\Users\\denman\\WebstormProjects\\suman');
const Test = suman.Test(module, 'suman.conf.js');

//core
var URL = require('url');
var request = require('request');


Test.describe('@TestCrawler*', function () {

    var config = require('univ-config')(module, '@TestCrawler*', 'config/conf');


    const urls = [
        'http://www.bbc.com/news/world-asia-35508475',
        'http://www.bbc.com/news/health-35459797',
        'http://www.newson6.com/story/31117340/imprivata-cortext-named-category-leader-for-secure-messaging-in-the-20152016-best-in-klas-software-and-services-report',
        'http://www.cnet.com/news/alphabet-fourth-quarter-earnings-2016/',
        'http://arstechnica.com/gadgets/2016/01/neato-botvac-connected-review-a-lidar-powered-robot-vacuum-is-my-maid-now/',
        'https://medium.com/@thnkr/my-name-is-patrick-mcconlogue-i-need-help-c98baf464291',
        'http://www.bbc.com/news/business-35464599',
        'https://twitter.com/ProductHunt',
        'http://www.masas-sushi.com/'
    ];


    urls.forEach($url => {

        this.it('[test] crawler', {parallel: true, delay: 1000}, (t, done) => {

            try {

                var url = URL.parse($url);
                var host = url.host;

                request.post({
                    url: 'http://localhost:5001/v1/crawl',
                    body: {
                        url: url.href,
                        domain: host
                    },
                    json: true,
                    headers: {
                        'x-lectal-authorization': testUser
                    }

                }, function (err, resp, body) {

                    if (err) {
                        done(err);
                    }
                    else {
                        if(resp.statusCode > 201){
                            done(new Error(resp.statusCode));
                        }
                        else{
                            done(null);
                        }
                    }
                });
            }
            catch (err) {
                done(err);
            }

        });


    });


});