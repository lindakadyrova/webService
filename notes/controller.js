'use strict';
const model = require('./model');

function listAction(req, res) {
  console.log('list overview');
  model
    .get()
    .then((notes) => {
      console.log(notes);
      res.json(notes);
    })
    .catch((err) => handleError(err, req, res));
}

function detailAction(req, res) {
  console.log('detail:', req.params.id);
  model
    .get(req.params.id)
    .then((note) => {
      if (note) {
        res.json(note);
      } else {
        res
          .status(404)
          .json({ error: `could not find note with id [${req.params.id}]` });
      }
    })
    .catch((err) => handleError(err, req, res));
}

function createAction(req, res) {
  console.log('create');
  const newNote = {
    title: req.body.title,
    description: req.body.description,
  };
  model
    .save(newNote)
    .then((note) => {
      console.log('created', JSON.stringify(note));
      res.status(201).json(note);
    })
    .catch((err) => handleError(err, req, res));
}

function updateAction(req, res) {
  console.log('update');
  const note = {
    id: req.params.id,
    title: req.body.title,
    description: req.body.description,
  };
  model
    .save(note)
    .then((note) => {
      res.json(note);
    })
    .catch((err) => handleError(err, req, res));
}

function deleteAction(req, res) {
  console.log('delete');
  const id = req.params.id;
  model
    .delete(id)
    .then(() => res.status(204).send())
    .catch((err) => handleError(err, req, res));
}

function handleError(err, req, res) {
  if (typeof err === 'object' && err.message) {
    err = { error: err.message };
  } else if (typeof err === 'string') {
    err = { error: err };
  } else {
    err = { error: 'unknown error occured' };
  }
  console.log(`ERROR on [${req.method}] via ${req.originalUrl}: [${err.error}]`);
  res.status(500).json(err);
}

module.exports = {
  listAction,
  detailAction,
  createAction,
  updateAction,
  deleteAction,
};
