
var kue = require('kue'),
    redis = require('redis'),
    util = require('util');

var isVCAP = (process.env.VCAP_APP_HOST)?true:false;

var port = Number(process.env.VCAP_APP_PORT || 3000),
    host = process.env.VCAP_APP_HOST || 'localhost';

var cf = require("cloudfoundry");
var redisSvc = cf.redis["ax-rq-redis"]||{"credentials":{ 
     host: '127.0.0.1',
     port: 6379
     }};

var cred = redisSvc.credentials;
var onlyOnce=true;

kue.redis.createClient = function() {
    var client = redis.createClient(cred.port, cred.host);
    if (cred.password) {
        client.auth(cred.password);
    }
    client.on('connect',function() {
        if (onlyOnce) console.log('redis connected @ '+new Date());
    }).on('ready',function() {
        if (onlyOnce) console.log('redis ready version: '+client.server_info.redis_version);
        onlyOnce=false;
    }).on('error',function() {
        console.log('redis could not connect');
    });
    return client;
  };
// create our job queue

var jobs = kue.createQueue();
function nowAndRepeat(fn,timeout){
    fn();
    setInterval(fn,timeout);
}

var Produce = require('./lib/produce');
if (1) {
    nowAndRepeat(function(){
        for (var i=0;i<3;i++){
            Produce.produce(jobs,isVCAP);
        }
    },30000);
}

// setup a consumer inside kue
var Consume = require('./lib/consume');
Consume.consume(jobs);

var completeJobExpiry=2*60*1000; // 2 minutes
//var completeJobExpiry=30*1000; // 30 seconds
var Cleanup = require('./lib/cleanup');
if (1) {
    nowAndRepeat(function(){
        Cleanup.cleanup(kue,jobs,completeJobExpiry);
    },5000);
}


// start the UI
kue.app.listen(port, host);

console.log('process.env: '+util.inspect(process.env, false, null)+'\n\n');
console.log('Kue Server running at http://' + host + ':' + port + '/');




function myownaccess () {
    var client = kue.redis.createClient();
    
    client.dbsize(function (err,n) {
        if (err) return;
        console.log("dbsize: ",n);
    });
    
}
//setTimeout(myownaccess,200);
