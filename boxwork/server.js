/**
 * Express server to server both client and api folders
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// enable cors
app.use(cors());

// expose json data

// server index.html from the client folder
app.use(express.static(path.join(__dirname, 'client')));

// index.html is default
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// server api from the api folder
app.use('/api', express.static(path.join(__dirname, 'api')));

// start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
