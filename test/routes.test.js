// node:test suite for routes.js — registration + handler behavior via a FAKE
// express app (no express required, no port bound): we record what routes.js
// registers, then invoke the recorded handlers with fake req/res objects and
// assert what they do. Locks the current contract: the 15 named page routes,
// the /sw.js static, and the catch-all 404 registered LAST.
const test = require("node:test");
const assert = require("node:assert");
const path = require("path");

// --- fake express -----------------------------------------------------------
function fakeApp() {
  const gets = [];   // { route, handler }
  const uses = [];   // { handler }
  const app = {
    get(route, handler) { gets.push({ route, handler }); },
    use(handler) { uses.push({ handler }); },
  };
  return { app, gets, uses };
}

function fakeRes() {
  const res = { calls: [] };
  res.status = (code) => { res.calls.push({ fn: "status", code }); return res; };
  res.send = (body) => { res.calls.push({ fn: "send", body }); return res; };
  res.render = (view) => { res.calls.push({ fn: "render", view }); return res; };
  res.sendFile = (file) => { res.calls.push({ fn: "sendFile", file }); return res; };
  return res;
}

function load() {
  const routes = require("../routes");
  const { app, gets, uses } = fakeApp();
  routes(app);
  return { gets, uses };
}

// --- registration -----------------------------------------------------------
test("registers the /sw.js static and the 15 named page routes (16 GETs)", () => {
  const { gets } = load();
  assert.strictEqual(gets.length, 16);
  assert.ok(gets.some((g) => g.route === "/sw.js"));
  for (const r of ["/", "/engineering", "/software", "/blog", "/blog/wdws",
    "/software/matlab", "/software/python", "/software/labview", "/software/c",
    "/software/java", "/software/html5", "/engineering/add", "/engineering/cad",
    "/engineering/elec", "/engineering/team"]) {
    assert.ok(gets.some((g) => g.route === r), `missing GET ${r}`);
  }
});

test("catch-all is registered via app.use AFTER the GETs", () => {
  const { uses } = load();
  assert.strictEqual(uses.length, 1);
  // Registration order is what makes the catch-all a catch-all: assert it by
  // re-loading with a recording app that sees every call in order.
  const order = [];
  const routes = require("../routes");
  routes({ get: (r) => order.push(["get", r]), use: () => order.push(["use"]) });
  assert.strictEqual(order[order.length - 1][0], "use");
  assert.ok(order.slice(0, -1).every(([k]) => k === "get"));
});

// --- handler behavior -------------------------------------------------------
test("page route handlers render their template for the path", () => {
  const { gets } = load();
  const home = gets.find((g) => g.route === "/");
  const res = fakeRes();
  home.handler({}, res);
  assert.deepStrictEqual(res.calls.length, 1);
  assert.strictEqual(res.calls[0].fn, "render");
  assert.strictEqual(res.calls[0].view, "home");

  const wdws = gets.find((g) => g.route === "/blog/wdws");
  const res2 = fakeRes();
  wdws.handler({}, res2);
  assert.strictEqual(res2.calls[0].view, "blog/wdws");
});

test("/sw.js handler sendFile resolves under public/", () => {
  const { gets } = load();
  const sw = gets.find((g) => g.route === "/sw.js");
  const res = fakeRes();
  sw.handler({}, res);
  const call = res.calls.find((c) => c.fn === "sendFile");
  assert.ok(call, "handler must sendFile the service worker");
  assert.strictEqual(call.file, path.resolve(__dirname, "..", "public", "sw.js"));
});

test("catch-all responds 404 with the awkward page and a Home link", () => {
  const { uses } = load();
  const res = fakeRes();
  uses[0].handler({ method: "GET", url: "/nope" }, res, () => {});
  const status = res.calls.find((c) => c.fn === "status");
  const send = res.calls.find((c) => c.fn === "send");
  assert.strictEqual(status.code, 404);
  assert.match(send.body, /That's awkward/);
  assert.match(send.body, /Go back to Home/);
});
