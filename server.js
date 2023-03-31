// Require necessary modules
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const httpport = 80;
const httpsport = 443;
// Create a new instance of Express
const app = express();
app.enable('trust proxy')
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains','preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self';frame-ancestors 'self'; base-uri 'self'");
    req.secure ? next() : res.redirect('https://' + req.headers.host + req.url);
})
app.use(express.static('public'));
app.use(express.static(__dirname, { dotfiles: 'allow' }));
// Set the view engine to EJS
app.set('view engine', 'ejs');
const privateKey = fs.readFileSync('C://Certbot/live/noaha.tech/privkey.pem', 'utf8');
const certificate = fs.readFileSync('C://Certbot/live/noaha.tech/cert.pem', 'utf8');
const ca = fs.readFileSync('C://Certbot/live/noaha.tech/chain.pem', 'utf8');
const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

// Start the server
const httpServer = http.createServer(app); 
const httpsServer = https.createServer(credentials, app);


// Define routes
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/projects', (req, res) => {
  res.render('projects');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/engineering', (req, res) => {
  res.render('engineering');
});

app.get('/software', (req, res) => {
  res.render('software');
});

app.get('/software/matlab', (req, res) => {
  res.render('matlab');
});

app.get('/software/python', (req, res) => {
  res.render('python');
});

app.get('/software/labview', (req, res) => {
  res.render('labview');
});

app.get('/software/c', (req, res) => {
  res.render('c');
});

app.get('/software/java', (req, res) => {
  res.render('java');
});

app.get('/software/html5', (req, res) => {
  res.render('html5');
});
// Handling non matching request from the client
app.use((req, res, next) => {
  res.status(404).send(
      "<%- include('header') %><h1>That's awkward... This page doesn't exist. Retry Home?</h1><a href='/'><img src= '/images/icons/status/online.png'</a>")
})

httpServer.listen(httpport, () => {
	console.log('HTTP Server running on port 80');
});


httpsServer.listen(httpsport,() => {
	console.log('HTTPS Server running on port 443');
});
