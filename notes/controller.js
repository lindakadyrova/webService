"use strict";
const model = require("./model");
const { body, validationResult } = require("express-validator");

const validateNote = [
  body("title")
    .isString()
    .withMessage("Title must be a string.")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long."),
  body("description")
    .isString()
    .withMessage("Description must be a string.")
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters long."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

function listAction(req, res) {
  console.log("list overview");
  model
    .get()
    .then((notes) => {
      console.log(notes);
      res.json(notes);
    })
    .catch((err) => handleError(err, req, res));
}

function detailAction(req, res) {
  console.log("detail:", req.params.id);
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
  if (!req.is("application/json")) {
    return res
      .status(415)
      .json({ error: "Content-Type must be application/json" });
  }
  console.log("create");
  const { title, description } = req.body;
  model
    .save({ title, description })
    .then((note) => {
      console.log("created", JSON.stringify(note));
      res.status(201).location(`localhost:8080/notes/${note.id}`).json(note);
    })
    .catch((err) => handleError(err, req, res));
}

function updateAction(req, res) {
  console.log("update");

  const note = {
    id: req.params.id,
    title: req.body.title,
    description: req.body.description,
  };

  model
    .save(note)
    .then((updatedNote) => {
      if (!updatedNote) {
        return res
          .status(404)
          .json({ error: `could not find note with id [${req.params.id}]` });
      }

      res.json(updatedNote);
    })
    .catch((err) => handleError(err, req, res));
}

function deleteAction(req, res) {
  console.log("delete");
  const id = req.params.id;

  model
    .delete(id)
    .then((deleted) => {
      if (!deleted) {
        return res
          .status(404)
          .json({ error: `could not find note with id [${id}]` });
      }

      res.status(204).send();
    })
    .catch((err) => handleError(err, req, res));
}

function handleError(err, req, res) {
  if (typeof err === "object" && err.message) {
    err = { error: err.message };
  } else if (typeof err === "string") {
    err = { error: err };
  } else {
    err = { error: "unknown error occured" };
  }
  console.log(
    `ERROR on [${req.method}] via ${req.originalUrl}: [${err.error}]`,
  );
  res.status(500).json(err);
}

function getAllAction(req, res) {
  const rawLimit = req.query.limit;
  const rawOffset = req.query.offset;

  let limit = 10;
  let offset = 0;

  if (rawLimit !== undefined) {
    limit = Number(rawLimit);
  }

  if (rawOffset !== undefined) {
    offset = Number(rawOffset);
  }

  if (!Number.isInteger(limit) || limit < 1) {
    return res.status(400).json({
      error: "limit must be a positive integer",
    });
  }

  if (!Number.isInteger(offset) || offset < 0) {
    return res.status(400).json({
      error: "offset must be a non-negative integer",
    });
  }

  if (limit > 100) {
    limit = 100;
  }

  const options = {
    title: req.query.title,
    description: req.query.description,
    limit,
    offset,
  };

  model
    .get(options)
    .then((notes) => res.json(notes))
    .catch((err) => handleError(err, req, res));
}

module.exports = {
  listAction,
  detailAction,
  createAction,
  updateAction,
  deleteAction,
  getAllAction,
};
