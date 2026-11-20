// Contact form delivery (nodemailer + env seams).
// No SMTP credentials live in git. On the server, a .env next to server.js
// provides: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO
// (and optionally SMTP_FROM). With no config the handler says so honestly
// instead of faking a "sent" — and the page always offers mailto as the
// fallback. This restores what the 2023 site had (commit ad41f13) minus the
// credentials-in-source-tree risk that made the original fragile.
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");

const LIMITS = { name: 120, email: 160, phone: 40, message: 4000 };

// POST /contactform had ZERO rate limiting (2026-11-20): 5 per IP per 15 min.
// middleware.js enables trust proxy and nginx sets X-Forwarded-For, so req.ip
// is the real client behind the vhost.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // express-rate-limit v7 refuses to run under permissive trust proxy (the
  // middleware's app.enable("trust proxy") is locked by middleware.test.js).
  // nginx is the only proxy in front (LAN-only vhost) and sets X-Forwarded-For
  // itself, so skip the v7 proxy validation instead of touching that contract.
  validate: { trustProxy: false },
  handler: (req, res) => {
    res.status(429).render("contact", {
      errors: [
        "Too many messages from this network -- try again in a few minutes, or email me directly at noah@noaha.tech.",
      ],
      values: req.body || {},
    });
  },
});

function validate(body) {
  const errors = [];
  const field = (key) => String(body[key] || "").trim();
  if (!field("contactname")) errors.push("Please include your name.");
  else if (field("contactname").length > LIMITS.name) errors.push("Name is too long.");
  if (!field("contactemail")) errors.push("Please include your email.");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field("contactemail")))
    errors.push("That email address doesn't look valid.");
  else if (field("contactemail").length > LIMITS.email) errors.push("Email is too long.");
  if (field("contactphone").length > LIMITS.phone) errors.push("Phone is too long.");
  if (!field("contactmessage")) errors.push("Please include a message.");
  else if (field("contactmessage").length > LIMITS.message) errors.push("Message is too long.");
  return errors;
}

function configured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.CONTACT_TO
  );
}

function handler(req, res) {
  const body = req.body || {};
  // Honeypot: #hp_website is off-screen in main.css and aria-hidden, so real
  // visitors never fill it. Anything that does is a bot -- answer the friendly
  // lie, deliver nothing. Checked before validate so bots get no signal.
  if (String(body.hp_website || "").trim()) {
    return res.render("contact", { sent: true, values: {} });
  }
  const errors = validate(body);
  if (errors.length) {
    return res.status(400).render("contact", { errors, values: body });
  }
  if (!configured()) {
    return res.status(503).render("contact", {
      errors: [
        "Message delivery isn't wired up on this server yet — email me directly at noah@noaha.tech and I'll reply just the same.",
      ],
      values: body,
    });
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const phone = String(body.contactphone || "").trim();
  transporter
    .sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_TO,
      replyTo: String(body.contactemail).trim(),
      subject: `[noaha.tech] Message from ${String(body.contactname).trim()}`,
      text:
        `${String(body.contactmessage).trim()}\n\n` +
        `— ${String(body.contactname).trim()} <${String(body.contactemail).trim()}>` +
        (phone ? `\nphone: ${phone}` : ""),
    })
    .then(() => res.render("contact", { sent: true, values: {} }))
    .catch(() =>
      res
        .status(502)
        .render("contact", {
          errors: [
            "The mail relay didn't accept the message — email me at noah@noaha.tech and I'll still get it.",
          ],
          values: body,
        })
    );
}

module.exports = { handler, validate, configured, limiter };
