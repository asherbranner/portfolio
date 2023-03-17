// Require necessary modules
const express = require('express');

// Create a new instance of Express
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files from the public directory
app.use(express.static('public'));


// Define routes
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/projects', (req, res) => {
  res.render('projects');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/engineering', (req, res) => {
  res.render('engineering');
});

app.get('/software', (req, res) => {
  res.render('software');
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});