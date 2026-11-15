// Security headers + static serving + template engine.
// 2026-11-15 rebuild:
//  - REMOVED `express.static(__dirname, { dotfiles: "allow" })` — that served
//    the whole app source (middleware/routes/package.json, and .env) publicly.
//  - REMOVED the Google Analytics / TermsFeed cookie-consent allowances from
//    the CSP: the site ships zero third-party scripts, so the consent banner
//    and the analytics connect-src entries are gone with them.
//  - HSTS kept: every noaha.tech host serves a real Let's Encrypt cert.
//  - The response-header contract (X-Powered-By alias, frame/nosniff/HSTS/CSP/
//    Cache-Control) and the http->https redirect are locked by
//    test/middleware.test.js — change one, change the other.
const path = require("path");
const express = require("express");
const cacheTime = 86400000 * 30; // 30 days for static assets

module.exports = function (app) {
  app.enable("trust proxy");
  app.use((req, res, next) => {
    res.setHeader("X-Powered-By", "Noah A. (noaha.tech)");
    res.setHeader("X-Frame-Options", "sameorigin");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    ); // safe: all noaha.tech subdomains serve LE certs (2026-10-02 flip)
    // Zero-JS site: script-src 'none' is the honest policy. No inline styles
    // either — every style lives in this one stylesheet.
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'none'; style-src 'self'; " +
        "img-src 'self' data:; font-src 'self'; base-uri 'self'; " +
        "form-action 'self'; frame-ancestors 'self'"
    );
    res.setHeader("Cache-Control", "max-age= 300");
    req.secure ? next() : res.redirect("https://" + req.headers.host + req.url);
  });
  app.use(
    express.static(path.join(__dirname, "public"), {
      maxAge: cacheTime,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.set("view engine", "ejs");
};
