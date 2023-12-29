const express = require('express');
const app = express();
const routes = require('./routes');
const middleware = require('./middleware');
const ssl = require('./ssl');
const http = require('http');
const https = require('https');
httpport = 81;
httpsport = 444;

middleware(app);
routes(app);

const httpServer = http.createServer(app);
const httpsServer = https.createServer(ssl(), app);

httpServer.listen(httpport, function () {
  console.log('HTTP Server running on port ' + httpport +'.');
});

httpsServer.listen(httpsport, function () {
  console.log('HTTPS Server running on port ' + httpsport +'.');
});