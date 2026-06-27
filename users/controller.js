"use strict";
const model = require("./model");
// const { body, validaationResult } = require("express-validator");

function listAction(req, res) {
  console.log("list overview");
  model
    .getAll()
    .then((users) => {
      console.log(users);
      res.json(users);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
}

function detailAction(req, res) {
  console.log("details");
  model
    .get(req.params.id)
    .then((users) => {
      if (users) {
        res.json(users);
      } else {
        res
          .status(404)
          .json({ error: `could not find note with id [${req.params.id}]` });
      }
    })

    .catch((err) => handleError(err, req, res));
}

function createAction(req, res) {
    if (!req.is('application/json')) {
        return res.status(415).json({ error: "content type must be json" });
    }
    console.log("created");
    const { name } = req.body;
    model
    .save({ name })
    .then((user) => {
        console.log("CREATED", JSON.stringify(user));
        res.status(201).location(`localhost:8080/users/${user.id}`).json(user);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
}

function updateAction(req, res) {
    if (!req.is('application/json')) {
        return res.status(415).json({ error: "content must be json" });
    }
    console.log("update");
    const users = {
        id: req.params.id,
        name: req.body.name,
    };
    model.save(users)
    .then((users) => {
        res.json(users);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
}

function deleteAction(req, res) {
const id= req.params.id;
model
.delete(id)
.then(() => res.status(204).send())
.catch((err) => handleError(err,req,res));

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


module.exports = { listAction, detailAction, createAction, updateAction, deleteAction };
