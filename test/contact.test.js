// node:test suite for contact.js — validation rules and the no-SMTP env seam.
// The SMTP network path is not exercised here (that would be a live send);
// what IS locked: invalid input never reaches a transport, and an
// unconfigured server answers honestly (503 + render) instead of faking "sent".
const test = require("node:test");
const assert = require("node:assert");
const contact = require("../contact");

function fakeRes() {
  const res = { calls: [] };
  res.status = (code) => { res.calls.push({ fn: "status", code }); return res; };
  res.render = (view, locals) => { res.calls.push({ fn: "render", view, locals }); return res; };
  return res;
}

test("validate rejects missing name, missing/invalid email, missing message", () => {
  const errors = contact.validate({ contactname: "", contactemail: "nope", contactmessage: "  " });
  assert.ok(errors.some((e) => /name/i.test(e)));
  assert.ok(errors.some((e) => /email/i.test(e)));
  assert.ok(errors.some((e) => /message/i.test(e)));
});

test("validate accepts a complete, well-formed submission", () => {
  assert.deepStrictEqual(
    contact.validate({
      contactname: "Ada Lovelace",
      contactemail: "ada@example.com",
      contactphone: "555-0100",
      contactmessage: "Hello there.",
    }),
    []
  );
});

test("validate enforces length limits", () => {
  const errors = contact.validate({
    contactname: "n".repeat(121),
    contactemail: "a".repeat(155) + "@example.com",
    contactmessage: "m".repeat(4001),
  });
  assert.ok(errors.some((e) => /name/i.test(e) && /long/i.test(e)));
  assert.ok(errors.some((e) => /email/i.test(e) && /long/i.test(e)));
  assert.ok(errors.some((e) => /message/i.test(e) && /long/i.test(e)));
});

test("handler: invalid body -> 400 + render contact, before any transport", () => {
  const res = fakeRes();
  contact.handler({ body: { contactname: "", contactemail: "bad", contactmessage: "" } }, res);
  assert.strictEqual(res.calls[0].fn, "status");
  assert.strictEqual(res.calls[0].code, 400);
  assert.strictEqual(res.calls[1].fn, "render");
  assert.strictEqual(res.calls[1].view, "contact");
  assert.ok(Array.isArray(res.calls[1].locals.errors) && res.calls[1].locals.errors.length > 0);
});

test("handler: valid body with no SMTP env -> honest 503 + render", (t) => {
  // The dev/CI box has no SMTP config — that IS the seam under test.
  if (contact.configured()) t.skip("SMTP env present in this environment");
  const res = fakeRes();
  contact.handler(
    { body: { contactname: "Ada", contactemail: "ada@example.com", contactmessage: "Hi" } },
    res
  );
  assert.strictEqual(res.calls[0].fn, "status");
  assert.strictEqual(res.calls[0].code, 503);
  assert.strictEqual(res.calls[1].fn, "render");
  assert.strictEqual(res.calls[1].view, "contact");
  assert.ok(/noah@noaha\.tech/.test(res.calls[1].locals.errors.join(" ")),
    "503 message must point at the direct email fallback");
});
