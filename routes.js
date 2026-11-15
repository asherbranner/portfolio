// Routes: 2026 IA, 301s for every 2023 URL the Wayback Machine and old
// bookmarks know, the contact form, and a real 404 page.
// The 2023 build lost its /contact route and its /contactform POST at some
// point (the view outlived them) — the routes test locks the pair back in.
const contact = require("./contact");

module.exports = function (app) {
  // Moved pages keep their old addresses (Wayback 2023 captures included).
  const redirects = {
    "/engineering": "/experience",
    "/software": "/experience",
    "/blog": "/writing",
    "/blog/wdws": "/writing/wdws",
  };
  Object.keys(redirects).forEach((route) => {
    app.get(route, (req, res) => res.redirect(301, redirects[route]));
  });

  const pages = {
    "/": "home",
    "/projects": "projects",
    "/experience": "experience",
    "/writing": "writing",
    "/writing/wdws": "writing/wdws",
    "/contact": "contact",
  };
  Object.keys(pages).forEach((route) => {
    app.get(route, (req, res) => res.render(pages[route]));
  });

  // Form target from views/contact.ejs (the 2023 form posted here while the
  // route was missing — restored and tested now).
  app.post("/contactform", contact.handler);

  // Catch-all — registered last so it catches everything above it. Renders a
  // real styled page instead of shipping raw EJS source as a string body.
  app.use((req, res) => {
    res.status(404).render("404");
  });
};
