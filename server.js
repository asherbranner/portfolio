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

app.get('/software/matlab', (req, res) => {
  res.render('matlab');
});

app.get('/software/python', (req, res) => {
  res.render('python');
});

app.get('/software/labview', (req, res) => {
  res.render('labview');
});

app.get('/software/c', (req, res) => {
  res.render('c');
});

app.get('/software/html5', (req, res) => {
  res.render('html5');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});