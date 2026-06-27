"use strict";
const model = require("./model");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");

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

function createEtag(value) {
  return crypto.createHash("sha1").update(JSON.stringify(value)).digest("hex");
}

function clearNotesCache() {
  getAllAction.cache = {};
}

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

function getOneAction(req, res) {
  model
    .get({ id: req.params.id })
    .then((note) => {
      if (!note) {
        return res.status(404).json({
          error: `could not find note with id [${req.params.id}]`,
        });
      }

      const etag = createEtag(note);
      res.set("ETag", etag);
      res.set("Cache-Control", "no-cache");

      if (req.headers["if-none-match"] === etag) {
        return res.status(304).send();
      }

      res.json(note);
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
      clearNotesCache();
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
      clearNotesCache();
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
      clearNotesCache();
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
    return res.status(400).json({ error: "limit must be a positive integer" });
  }

  if (!Number.isInteger(offset) || offset < 0) {
    return res.status(400).json({ error: "offset must be a non-negative integer" });
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

  const cacheKey = JSON.stringify(options);
  const now = Date.now();

  if (!getAllAction.cache) {
    getAllAction.cache = {};
  }

  const entry = getAllAction.cache[cacheKey];

  if (entry && now - entry.timestamp < 30000) {
    res.set("Cache-Control", "no-store");
    return res.json(entry.data);
  }

  model
    .get(options)
    .then((notes) => {
      getAllAction.cache[cacheKey] = {
        data: notes,
        timestamp: now,
      };
      res.set("Cache-Control", "no-store");
      res.json(notes);
    })
    .catch((err) => handleError(err, req, res));
}

module.exports = {
  listAction,
  getOneAction,
  createAction,
  updateAction,
  deleteAction,
  getAllAction,
};