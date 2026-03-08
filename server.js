'use strict';
// import external modules
const express = require('express');
const { PORT } = require('./util/config');
const notesRouter = require('./notes');

// Optional. You will see this name in e.g. 'ps' or 'top' command
process.title = 'node-rest';

// create an express-instance
const app = express();

// setup express-app to use some predefined middleware
app.use(express.json()); // to parse JSON data from HTTP POST/PUT etc.
app.use('/client', express.static('public'));

// setup route for '/' that returns a simple text message.
app.get('/', (req, res) => {
  res.send('it work\'s');
});

// setup '/notes' route that handles our API
app.use('/notes', notesRouter);


app.listen(PORT, () => {
  console.log(`Server is up an running on http://localhost:${PORT}`);
});
