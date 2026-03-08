'use strict';
const { NODE_ENV } = require('../util/config');
const sqlite = require('sqlite3');
const db = new sqlite.Database('./notes.db');

// drop database only for developing purpose, restart server while development will cleanup current data
if (NODE_ENV === 'development') {
  db.run('DROP TABLE IF EXISTS notes');
}

db.run(
  `CREATE TABLE IF NOT EXISTS notes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT NOT NULL
);`,
  () => {
    // insert demo data while in development environment
    if (NODE_ENV === 'development') {
      const demoNotes = [
        { title: 'first', description: 'first note' },
        { title: 'learn rest', description: 'learn how rest works' },
      ];
      demoNotes.forEach((note) => {
        insert(note);
      });
    }
  }
);

// get all notes
function getAll() {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM notes';
    const stmt = db.prepare(query);
    stmt.all([], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

// get one note by it's id
function getOne(id) {
  return new Promise((resolve, reject) => {
    console.log('getOne', id);
    if (id == 666) {
      return reject(new Error('number of the beast'));
    }
    const query = 'SELECT * FROM notes WHERE id = ?';
    const stmt = db.prepare(query);
    stmt.get([id], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

// insert a new note
function insert(note) {
  return new Promise((resolve, reject) => {
    console.log('insert new note:', JSON.stringify(note));
    const query = 'INSERT INTO notes (title, description) VALUES (?, ?)';
    const stmt = db.prepare(query);
    stmt.run([note.title, note.description], function (err) {
      if (err) {
        return reject(err);
      }
      note.id = this.lastID; // to access 'lastID', we need to use a regular `function()` instead of an Arrow-function, for more information take a look here: https://levelup.gitconnected.com/arrow-function-vs-regular-function-in-javascript-b6337fb87032#ab92
      resolve(note);
    });
  });
}

// update an existing note
function update(note) {
  return new Promise((resolve, reject) => {
    console.log('update note:', JSON.stringify(note));
    const query = 'UPDATE notes SET title = ?, description = ? WHERE id = ?';
    const stmt = db.prepare(query);
    stmt.run([note.title, note.description, note.id], (err) => {
      if (err) {
        return reject(err);
      }
      resolve(note);
    });
  });
}

// delete a note
function remove(id) {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM notes WHERE id = ?';
    const stmt = db.prepare(query);
    stmt.run([id], (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

module.exports = {
  get(id) {
    if (!id) {
      return getAll();
    } else {
      return getOne(id);
    }
  },
  save(note) {
    if (!note.id) {
      return insert(note);
    } else {
      return update(note);
    }
  },
  delete(id) {
    return remove(id);
  },
};
