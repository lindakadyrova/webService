"use strict";
const model = require("./model");
const { body, validationResult } = require("express-validator");

const validateNote = [
  body("title")
    .isString().withMessage("Title must be a string.")
    .isLength({ min: 3 }).withMessage("Title must be at least 3 characters long."),
  body("description")
    .isString().withMessage("Description must be a string.")
    .isLength({ min: 5 }).withMessage("Description must be at least 5 characters long."),
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
  // const { title, description } = req.body;

  // if (!title || typeof title !== "string" || title.length < 3) {
  //   return res
  //     .status(400)
  //     .json({ error: "Title must be at least 3 characters long" });
  // }

  // if (
  //   !description ||
  //   typeof description !== "string" ||
  //   description.length < 5
  // ) {
  //   return res
  //     .status(400)
  //     .json({ error: "Description must be at least 5 characters long" });
  // }
  

  console.log("create");
  const newNote = {
    title: req.body.title,
    description: req.body.description,
  };
  model
    .save({ title, description })
    .then((note) => {
      console.log("created", JSON.stringify(note));
      res.status(201).json(note);
    })
    .catch((err) => handleError(err, req, res));
}

function updateAction(req, res) {
  // const { title, description } = req.body;
  // console.log("update");

  // if (!title || typeof title !== "string" || title.length < 3) {
  //   return res
  //     .status(400)
  //     .json({ error: "Title must be at least 3 characters long" });
  // }

  // if (
  //   !description ||
  //   typeof description !== "string" ||
  //   description.length < 5
  // ) {
  //   return res
  //     .status(400)
  //     .json({ error: "Description must be at least 5 characters long" });
  // }

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
  console.log("delete");
  const id = req.params.id;
  model
    .delete(id)
    .then(() => res.status(204).send())
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

module.exports = {
  listAction,
  detailAction,
  createAction,
  updateAction,
  deleteAction,
};
