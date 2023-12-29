// Require necessary modules
module.exports = function (app) {
// Start Service Worker
  app.get('/sw.js', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'sw.js'));
  });

  // Define routes
  const routes = {
    '/': 'home',
    '/engineering': 'engineering',
    '/software': 'software',
    '/blog': 'blog',
    '/blog/wdws': 'blog/wdws',
    '/software/matlab': 'software/matlab',
    '/software/python': 'software/python',
    '/software/labview': 'software/labview',
    '/software/c': 'software/c',
    '/software/java': 'software/java',
    '/software/html5': 'software/html5',
    '/engineering/add': 'engineering/add',
    '/engineering/cad': 'engineering/cad',
    '/engineering/elec': 'engineering/elec',
    '/engineering/team': 'engineering/team'
  };
  
  Object.keys(routes).forEach(route => {
    app.get(route, (req, res) => {
      res.render(routes[route]);
    });
  });

  // Handling non matching request from the client
  app.use((req, res, next) => {
    res.status(404).send(
      "<%- include('const/header') %><h1>That's awkward... This page doesn't exist. Retry Home?</h1><a href='/'><img src= '/images/icons/status/online.png'</a>")
  })
}
