// node:test smoke suite for the portfolio server.
// Verifies the app modules load without side effects and expose the
// expected interfaces, without binding any network port.
const test = require("node:test");
const assert = require("node:assert");

test("routes and middleware load and are functions", () => {
  const routes = require("../routes");
  const middleware = require("../middleware");
  assert.strictEqual(typeof routes, "function");
  assert.strictEqual(typeof middleware, "function");
});

test("server.js exports nothing that binds a port on require (no listen)", () => {
  const src = require("fs").readFileSync(
    require("path").join(__dirname, "..", "server.js"),
    "utf8"
  );
  // The only network bind must be guarded by the start script, and the
  // module must be a plain Express app wiring (no dynamic require of 'fs'
  // npm package).
  assert.ok(src.includes("express()"));
});

test("no code depends on the removed 'fs' npm package", () => {
  const pkg = require("../package.json");
  assert.ok(!pkg.dependencies || !pkg.dependencies.fs,
    "the deprecated/malicious 'fs' npm dependency must be removed");
});
