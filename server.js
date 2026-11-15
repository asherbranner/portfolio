// Portfolio server. nginx terminates TLS and proxies to this plain-HTTP
// listener; it binds loopback on purpose (2026-11-15: the 2023 server bound
// every interface and even served the app source tree — see middleware.js).
// PORT/HOST are env seams so one codebase runs prod (:3000) and dev (:3001).
require("dotenv").config();

const express = require("express");
const app = express();

const middleware = require("./middleware");
const routes = require("./routes");

middleware(app);
routes(app);

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "127.0.0.1";

app.listen(port, host, function () {
  console.log(`HTTP server listening on http://${host}:${port}`);
});
