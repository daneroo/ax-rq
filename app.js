
var kue = require('kue'),
    redis = require('redis'),
    util = require('util'),
    redis = require('redis');

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

// start redis with $ redis-server

// create some jobs at random,
// usually you would create these
// in your http processes upon
// user input etc.

function produce() {
  var name = ['tobi', 'loki', 'jane', 'manny'][Math.random() * 4 | 0];
  var job = jobs.create('video conversion', {
      title: 'converting ' + name + '\'s to avi'
    , user: 1
    , frames: 200
  });

  job.on('complete', function(){
      console.log(" Job  #" + job.id + " complete          "); //blank out rest
      //console.log(" Job complete");
  }).on('failed', function(){
      console.log(" Job  #" + job.id + " failed            "); //blank out rest
  }).on('progress', function(progress){
    if (isVCAP){
        // no progress output on vcap
    } else {
        process.stdout.write('\r  job #' + job.id + ' ' + progress + '% complete\r');
    }
  });

  job.save();

  setTimeout(produce, Math.random() * 30000 | 0);
}

produce();

// process video conversion jobs, 1 at a time.

jobs.process('video conversion', 1, function(job, done){
  var frames = job.data.frames;

  console.log('\nstart processing job #'+job.id+'\n');
  
  function next(i) {
    // pretend we are doing some work
    convertFrame(i, function(err){
      if (err) return done(err);
      // report progress, i/frames complete
      job.progress(i, frames);
      if (i >= frames) done()
      else next(i + Math.random() * 50);
    });
  }

  next(0);
});

function convertFrame(i, fn) {
  setTimeout(fn, Math.random() * 500);
}

// start the UI
kue.app.listen(port, host);

console.log('process.env: '+util.inspect(process.env, false, null)+'\n\n');
console.log('Kue Server running at http://' + host + ':' + port + '/');

// cleanup some jobs
var completeJobExpiry=5*60*1000; // 5 minutes
function cleanup(){
    console.log("cleaning up");
    jobs.card('complete',function (err,n) {
        if (err) return;
        console.log("completed tasks: "+n);
    });
    jobs.state('complete',function (err,ids) {
        if (err) return;
        (ids).forEach(function(id,index) {
            console.log("considering task: "+id);
            kue.Job.get(id,function(err,job) {
                if (err) {
                    console.error('remove failed to find:',id,err);
                    return;
                }
                if (!job){
                    console.log('!job,err',job,err);
                    return;
                }
                /*var clone = {
                    type:job.type,
                    data:job.data,
                    id:job.id,
                    created_at:job.created_at,
                    updated_at:job.updated_at
                }
                console.log(clone);*/
                var updated_at = parseInt(job.updated_at, 10),
                    howOld = updated_at - Date.now(),
                    shouldDelete = ! Math.max(updated_at + completeJobExpiry - Date.now(), 0);


                if (!shouldDelete) {
                    console.log("-not removing task: "+id,howOld/60000,'min ago:',new Date(updated_at));
                    return;
                }
                console.log("+removing task: "+id,howOld/60000,'min ago:',new Date(updated_at));
                
                //console.log('removing',id,job);
                job.remove(function(err) {
                    if (err){
                        console.error('2-remove failed:',id,err);
                    } else {
                        console.log('confirmed that remove worked',id);
                    }
                })
            });
        });
    });
};

//cleanup();
//setTimeout(cleanup,200);
setInterval(cleanup,3000);

function myownaccess () {
    var client = kue.redis.createClient();
    
    client.dbsize(function (err,n) {
        if (err) return;
        console.log("dbsize: ",n);
    });
    
}
//setTimeout(myownaccess,200);
