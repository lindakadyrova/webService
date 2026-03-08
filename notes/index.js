'use strict';
const {
  listAction,
  detailAction,
  createAction,
  updateAction,
  deleteAction,
} = require('./controller');

const router = require('express').Router();

// use HTTP request methods also often called HTTP verbs https://developer.mozilla.org/de/docs/Web/HTTP/Methods
router.get('/', listAction);
router.get('/:id', detailAction);
router.post('/', createAction);
router.put('/:id', updateAction);
router.delete('/:id', deleteAction);

module.exports = router;
