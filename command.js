
var kue = require('kue'),
    redis = require('redis'),
    util = require('util');

var jobs = kue.createQueue();

function clear () {
    var client = kue.redis.createClient();
    
    client.dbsize(function (err,n) {
        if (err) return;
        console.log("dbsize before: ",n);
    });
    client.flushdb(function (err,n) {
        if (err) return;
        console.log("dbsize: ",n);
    });
    client.dbsize(function (err,n) {
        if (err) return;
        console.log("dbsize after: ",n);
    });

    
    
}

//console.log('process.env: '+util.inspect(process.env, false, null)+'\n\n');
console.log('process.argv: '+util.inspect(process.argv, false, null)+'\n\n');
if (process.argv.length>1){
    var command = process.argv[2];
    switch(command){
        case "produce":
            console.log("produce");
            produce();
            break;
        case "clear":
            console.log("clear");
            clear();
            break;
        default:
            console.log("unknown command: "+command);
    }
}
