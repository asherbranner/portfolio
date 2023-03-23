// Require necessary modules
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const httpport = 80;
const httpsport = 443;
// Create a new instance of Express
const app = express();
app.use((req, res, next) => {
  if(req.protocol === 'http') {
    res.redirect(301, "https://" + req.headers.host + req.url);
    res.end();
  }
  next();
});
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

httpServer.listen(httpport, () => {
	console.log('HTTP Server running on port 80');
});


httpsServer.listen(httpsport,() => {
	console.log('HTTPS Server running on port 443');
});
