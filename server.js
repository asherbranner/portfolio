// Require necessary modules
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const httpport = 80;
const httpsport = 443;
const cacheTime = 86400000 * 30 // the time you want
const path = require('path')
var nodemailer = require('nodemailer');
const { TLSSocket } = require('tls');
require('dotenv').config();
// Create a new instance of Express
const app = express();
app.enable('trust proxy')
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'Noah A. (noaha.tech)');
  res.setHeader('X-Frame-Options', 'sameorigin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains', 'preload');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' cookie-consent.js https://www.googletagmanager.com/gtag/ 'sha256-ZLtEgppw1P3isUNOYbz1xcxK6bgqxx00Io/DlASqepc=' 'sha256-YUQ52I8GF319OxqpfTHoQ8ajwiA2vmu4RtrpbhTK3mk=' 'sha256-nU7XM9gIBZIPWRETdoZ/YE3pWDzDFfv5EhPRHM0O7I4=' https://www.termsfeed.com/public/cookie-consent/4.1.0/cookie-consent.js; style-src 'self' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=' 'sha256-K6/pHjz+b5qzOPRBaO1xI4GL+D0wOqIvoRZSavSxZ28=' 'sha256-yMiGtQYlACZBJEj1sw+4EM2Y3XWcczaIdX4gqMtpN5k=' 'sha256-XGS1JKdycWIe7BhWs0cEyLgw2KWd3GZyey+0ShimSo4=' 'sha256-MnPweODNNWJyc/GRQA/Kn9GSJx1s3yxbQyBVrSEsXp8=' 'sha256-h17i/NAekPiaIOlQqAjejMYjK42ywM6sW/pCKFwFTSM=' 'sha256-w95jju5vVf6gHHcv2mrXtPZ04ZZF1zuOvmkUE4syuAQ=' 'sha256-nU7XM9gIBZIPWRETdoZ/YE3pWDzDFfv5EhPRHM0O7I4=' https://www.termsfeed.com/public/cookie-consent/4.1.0/cookie-consent.js; img-src 'self' data:; font-src 'self'; base-uri 'self';  connect-src 'self' https://analytics.google.com/g/ https://stats.g.doubleclick.net/g/ https://www.googletagmanager.com/gtag/ https://www.termsfeed.com/public/cookie-consent/4.1.0/cookie-consent.js; frame-src 'self';");
  res.setHeader('Cache-Control', 'max-age= 300');
  req.secure ? next() : res.redirect('https://' + req.headers.host + req.url);
})
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: cacheTime
}))
app.use(express.static(__dirname, { dotfiles: 'allow' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');
const privateKey = fs.readFileSync(process.env.cbprivkey, 'utf8');
const certificate = fs.readFileSync(process.env.cbcert, 'utf8');
const ca = fs.readFileSync(process.env.cbca, 'utf8');
const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};

// Start the server
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);
// Start Service Worker
app.get('/sw.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'sw.js'));
});
// Define routes
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/contact', function (req, res) {
  res.render('contact');
});

app.post('/contactform', function (req, res) {
  console.log(req.body);
  console.log(req.body.contactname);
  var contactname = req.body.contactname;
  var contactemail = req.body.contactemail;
  var contactphone = req.body.contactphone;
  var contactmessage = req.body.contactmessage;
  var transporter = nodemailer.createTransport({
    service: process.env.nodemailservice,
    auth: {
      user: process.env.nodemailuser,
      pass: process.env.nodemailpass
    },
  });
  var mailOptions = {
    from: process.env.emailfrom,
    to: process.env.emailto,
    subject: 'Form Submission - ' + contactname,
    text: 'Name: ' + contactname + '\r\n' + 'Email: ' + contactemail + '\r\n' + 'Phone: ' + contactphone + '\r\n' + 'Message: ' + contactmessage + '\r\n\r\n' + 'Sent by noaha.tech'
  }
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    }
    else {
      console.log('Email sent: ' + info.response);
    }
    res.redirect('/contact')
  })
})

app.get('/engineering', (req, res) => {
  res.render('engineering');
});

app.get('/software', (req, res) => {
  res.render('software');
});

app.get('/software/matlab', (req, res) => {
  res.render('software/matlab');
});

app.get('/software/python', (req, res) => {
  res.render('software/python');
});

app.get('/software/labview', (req, res) => {
  res.render('software/labview');
});

app.get('/software/c', (req, res) => {
  res.render('software/c');
});

app.get('/software/java', (req, res) => {
  res.render('software/java');
});

app.get('/software/html5', (req, res) => {
  res.render('software/html5');
});

app.get('/engineering/add', (req, res) => {
  res.render('engineering/add');
});

app.get('/engineering/cad', (req, res) => {
  res.render('engineering/cad');
});

app.get('/engineering/elec', (req, res) => {
  res.render('engineering/elec');
});

app.get('/engineering/team', (req, res) => {
  res.render('engineering/team');
});

// Handling non matching request from the client
app.use((req, res, next) => {
  res.status(404).send(
    "<%- include('const/header') %><h1>That's awkward... This page doesn't exist. Retry Home?</h1><a href='/'><img src= '/images/icons/status/online.png'</a>")
})

httpServer.listen(httpport, function () {
  console.log('HTTP Server running on port 80');
});

httpsServer.listen(httpsport, function () {
  console.log('HTTPS Server running on port 443');
});
