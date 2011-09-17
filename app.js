
var kue = require('kue'),
    redis = require('redis'),
    util = require('util'),
    redis = require('redis');

var port = Number(process.env.VCAP_APP_PORT || 3000),
    host = process.env.VCAP_APP_HOST || 'localhost';

var cf = require("cloudfoundry");
var redisSvc = cf.redis["ax-rq-redis"]||{"credentials":{ 
     host: '127.0.0.1',
     port: 6380
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

// start redis with $ redis-server

// create some jobs at random,
// usually you would create these
// in your http processes upon
// user input etc.

function create() {
  var name = ['tobi', 'loki', 'jane', 'manny'][Math.random() * 4 | 0];
  var job = jobs.create('video conversion', {
      title: 'converting ' + name + '\'s to avi'
    , user: 1
    , frames: 200
  });

  job.on('complete', function(){
      console.log(" Job complete");
  }).on('failed', function(){
      console.log(" Job failed");
  }).on('progress', function(progress){
    process.stdout.write('\r  job #' + job.id + ' ' + progress + '% complete');
  });

  job.save();

  //setTimeout(create, Math.random() * 2000 | 0);
}

create();

// process video conversion jobs, 1 at a time.

jobs.process('video conversion', 1, function(job, done){
  var frames = job.data.frames;

  function next(i) {
    // pretend we are doing some work
    convertFrame(i, function(err){
      if (err) return done(err);
      // report progress, i/frames complete
      job.progress(i, frames);
      if (i >= frames) done()
      else next(i + Math.random() * 10);
    });
  }

  next(0);
});

function convertFrame(i, fn) {
  setTimeout(fn, Math.random() * 50);
}

// start the UI
kue.app.listen(port, host);
 
console.log('Kue Server running at http://' + host + ':' + port + '/');
