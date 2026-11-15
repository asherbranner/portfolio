// node:test suite for routes.js — registration + handler behavior via a FAKE
// express app (no express required, no port bound): we record what routes.js
// registers in order, then invoke the recorded handlers with fake req/res
// objects and assert what they do. Locks the 2026 contract: 10 GETs (6 named
// pages + 4 legacy 301 redirects), the /contactform POST, and the catch-all
// 404 registered LAST rendering the styled 404 page.
const test = require("node:test");
const assert = require("node:assert");

// --- fake express -----------------------------------------------------------
function fakeApp() {
  const order = [];
  const app = {
    get(route, handler) { order.push({ kind: "get", route, handler }); },
    post(route, handler) { order.push({ kind: "post", route, handler }); },
    use(handler) { order.push({ kind: "use", handler }); },
  };
  return { app, order };
}

function fakeRes() {
  const res = { calls: [] };
  res.status = (code) => { res.calls.push({ fn: "status", code }); return res; };
  res.send = (body) => { res.calls.push({ fn: "send", body }); return res; };
  res.render = (view, locals) => { res.calls.push({ fn: "render", view, locals }); return res; };
  res.redirect = (code, url) => { res.calls.push({ fn: "redirect", code, url }); return res; };
  return res;
}

function load() {
  const routes = require("../routes");
  const { app, order } = fakeApp();
  routes(app);
  return { order, gets: order.filter((r) => r.kind === "get"),
    posts: order.filter((r) => r.kind === "post"),
    uses: order.filter((r) => r.kind === "use") };
}

// --- registration -----------------------------------------------------------
test("registers the 6 named page routes (6 GETs)", () => {
  const { gets } = load();
  for (const [route, view] of Object.entries({
    "/": "home",
    "/projects": "projects",
    "/experience": "experience",
    "/writing": "writing",
    "/writing/wdws": "writing/wdws",
    "/contact": "contact",
  })) {
    const hit = gets.find((g) => g.route === route);
    assert.ok(hit, `missing GET ${route}`);
    const res = fakeRes();
    hit.handler({}, res);
    assert.deepStrictEqual(res.calls, [{ fn: "render", view, locals: undefined }]);
  }
});

test("registers the 4 legacy 301 redirects from the 2023 IA", () => {
  const { gets } = load();
  for (const [route, target] of Object.entries({
    "/engineering": "/experience",
    "/software": "/experience",
    "/blog": "/writing",
    "/blog/wdws": "/writing/wdws",
  })) {
    const hit = gets.find((g) => g.route === route);
    assert.ok(hit, `missing GET ${route}`);
    const res = fakeRes();
    hit.handler({}, res);
    assert.deepStrictEqual(res.calls, [{ fn: "redirect", code: 301, url: target }]);
  }
});

test("registers the /contactform POST (form target of views/contact.ejs)", () => {
  const { posts } = load();
  assert.strictEqual(posts.length, 1);
  assert.strictEqual(posts[0].route, "/contactform");
  assert.strictEqual(typeof posts[0].handler, "function");
});

test("catch-all is registered via app.use AFTER every get/post", () => {
  const { order } = load();
  assert.strictEqual(order[order.length - 1].kind, "use");
  assert.ok(order.slice(0, -1).every((r) => r.kind === "get" || r.kind === "post"));
});

test("catch-all responds 404 by rendering the styled page", () => {
  const { uses } = load();
  const res = fakeRes();
  uses[0].handler({ method: "GET", url: "/nope" }, res, () => {});
  assert.deepStrictEqual(res.calls, [{ fn: "status", code: 404 }, { fn: "render", view: "404", locals: undefined }]);
});
