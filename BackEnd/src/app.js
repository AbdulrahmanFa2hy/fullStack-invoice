const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React frontend app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../FrontEnd/build')));

  // Anything that doesn't match the above, send back index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../FrontEnd/build/index.html'));
  });
}

// Basic route for testing
app.get('/api', (req, res) => {
  res.json({ message: 'Server is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 