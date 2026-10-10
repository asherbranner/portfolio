// node:test suite for middleware.js — security headers + request chaining.
// Serves the real middleware on an ephemeral 127.0.0.1 port; X-Forwarded-Proto
// (trust proxy is enabled by the middleware) drives req.secure. A /__probe
// route added AFTER the middleware lets us observe the middleware's own
// headers without express's finalhandler (404) rewriting them.
const test = require("node:test");
const assert = require("node:assert");
const http = require("http");

const express = require("express");
const middleware = require("../middleware");

function startApp() {
  const app = express();
  middleware(app);
  // Probe route registered after the middleware: reached only if the
  // middleware chains to next() for secure requests.
  app.get("/__probe", (req, res) => res.end("probe-ok"));
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function get(server, { secure = true, path = "/__probe" } = {}) {
  const { port } = server.address();
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        method: "GET",
        path,
        headers: {
          host: "noaha.tech",
          "x-forwarded-proto": secure ? "https" : "http",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve({ res, body }));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

test("security headers are set on the response", async () => {
  const server = await startApp();
  try {
    const { res } = await get(server, { secure: true });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.headers["x-powered-by"], "Noah A. (noaha.tech)");
    assert.strictEqual(res.headers["x-frame-options"], "sameorigin");
    assert.strictEqual(res.headers["x-content-type-options"], "nosniff");
    assert.ok(
      String(res.headers["strict-transport-security"]).startsWith("max-age=31536000"),
      "HSTS present after the 2026-10-02 cert flip"
    );
    assert.ok(
      String(res.headers["content-security-policy"]).includes("default-src 'self'"),
      "CSP present"
    );
    assert.strictEqual(res.headers["cache-control"], "max-age= 300");
  } finally {
    server.close();
  }
});

test("secure request is chained to next() (reaches probe, no redirect)", async () => {
  const server = await startApp();
  try {
    const { res, body } = await get(server, { secure: true });
    assert.strictEqual(res.statusCode, 200, "probe not reached — next() not called");
    assert.strictEqual(body, "probe-ok");
  } finally {
    server.close();
  }
});

test("insecure request redirects to https on the same host", async () => {
  const server = await startApp();
  try {
    const { res } = await get(server, { secure: false, path: "/some/path" });
    assert.strictEqual(res.statusCode, 302);
    assert.ok(
      String(res.headers["location"]).startsWith("https://noaha.tech/"),
      res.headers["location"]
    );
  } finally {
    server.close();
  }
});

test("middleware chain does not throw for a complete request (no 5xx)", async () => {
  const server = await startApp();
  try {
    const { res } = await get(server, { secure: true, path: "/__probe" });
    assert.ok(res.statusCode < 500, `chain blew up: ${res.statusCode}`);
    assert.strictEqual(res.headers["x-content-type-options"], "nosniff");
  } finally {
    server.close();
  }
});
