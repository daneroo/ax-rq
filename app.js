var http = require('http'),
    port = Number(process.env.VCAP_APP_PORT || 3000),
    host = process.env.VCAP_APP_HOST || 'localhost';

var cf       = require("cloudfoundry");
 
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Welcome to Cloud Foundry!\n' +
            host + ':' + port + '\n' +
            require('util').inspect(cf.services, false, null)+
            require('util').inspect(cf.redis, false, null)+
            require('util').inspect(process.env, false, null)
            );
}).listen(port, host);
 
console.log('Server running at http://' + host + ':' + port + '/');