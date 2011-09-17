var http = require('http'),
    port = Number(process.env.VCAP_APP_PORT || 3000),
    host = process.env.VCAP_APP_HOST || 'localhost',
    util = require('util'),
    redis = require('redis');

var cf = require("cloudfoundry");
var redisSvc = cf.redis["ax-rq-redis"]||{"credentials":{ 
     host: '127.0.0.1',
     port: 6380,
     password: 'a0f8e298-56d7-4006-8ffa-6614b2ec3d90',
     }};
     
var cred = redisSvc.credentials;
var client = redis.createClient(cred.port, cred.host);
client.auth(cred.password);
client.on('connect',function() {
    console.log('redis connected @ '+new Date());
}).on('ready',function() {
    console.log('redis ready version: '+client.server_info.redis_version);    
}).on('error',function() {
        console.log('redis could not connect');
});
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Welcome to Cloud Foundry!\n' +
        host + ':' + port + '\n' +
        '\n'+
        'redis version: '+client.server_info.redis_version+
        '\n\n'+
        util.inspect(redisSvc.credentials, false, null)+
        '\n\n'+
        util.inspect(redisSvc, false, null)+
        '\n\n'+
        util.inspect(cf.redis, false, null)+
        '\n\n'+
        util.inspect(cf.services, false, null)+
        '\n\n'+
        util.inspect(process.env, false, null)+
        '\n\n'
    );
}).listen(port, host);
 
console.log('Server running at http://' + host + ':' + port + '/');