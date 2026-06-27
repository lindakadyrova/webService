'use strict';
const { body, validationResult } = require("express-validator");
const {
  getAllAction,
  getOneAction,
  createAction,
  updateAction,
  deleteAction,
} = require('./controller');

const router = require('express').Router();

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

router.get('/', getAllAction);
router.get('/:id', getOneAction);
router.post('/', validateNote, createAction);
router.put('/:id', validateNote, updateAction);
router.delete('/:id', deleteAction);

module.exports = router;
