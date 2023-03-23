
// Require necessary modules
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');

// Create a new instance of Express
const app = express();
app.use(express.static('public'));
app.use(express.static(__dirname, { dotfiles: 'allow' } ));
// Set the view engine to EJS
app.set('view engine', 'ejs');
const privateKey = fs.readFileSync('C:/Certbot/live/web.noaha.tech/privkey.pem', 'utf8');
const certificate = fs.readFileSync('C:/Certbot/live/web.noaha.tech/cert.pem', 'utf8');
const ca = fs.readFileSync('C:/Certbot/live/web.noaha.tech/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

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
// Start the server
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});