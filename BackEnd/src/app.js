const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React frontend app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../FrontEnd/build')));

  // Anything that doesn't match the above, send back index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../FrontEnd/build/index.html'));
  });
} 