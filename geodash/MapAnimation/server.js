/**
 * Server.js - Map Animation Server
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

// expose public directory
app.use(express.static(path.join(__dirname, 'public')));

// serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});