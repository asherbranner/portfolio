// Require necessary modules
const express = require('express');
const path = require('path')
const cacheTime = 86400000 * 30 // the time you want

module.exports = function (app) {
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
  app.set('view engine', 'ejs');
}