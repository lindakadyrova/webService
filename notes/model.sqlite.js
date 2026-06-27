"use strict";
const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("./notes.db");
const { NODE_ENV } = require("../util/config");

// drop database only for developing purpose, restart server while development will cleanup current data
if (NODE_ENV === "development") {
  db.run("DROP TABLE IF EXISTS notes");
}

db.run(
  `CREATE TABLE IF NOT EXISTS notes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT NOT NULL
);`,
  () => {
    // insert demo data while in development environment
    if (NODE_ENV === "development") {
      const demoNotes = [
        { title: "first", description: "first note" },
        { title: "learn rest", description: "learn how rest works" },
      ];
      demoNotes.forEach((note) => {
        insert(note);
      });
    }
  },
);

// get all notes
function getAll(filter = {}) {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM notes";
    const params = [];
    const conditions = [];

    if (filter.title) {
      conditions.push("title LIKE ?");
      params.push(`%${filter.title}%`);
    }

    if (filter.description) {
      conditions.push("description LIKE ?");
      params.push(`%${filter.description}%`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY id ASC";

    const stmt = db.prepare(query);
    stmt.all(params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

// get one note by it's id
function getOne(id) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM notes WHERE id = ?";
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
    console.log("insert new note:", JSON.stringify(note));
    const query = "INSERT INTO notes (title, description) VALUES (?, ?)";
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
    console.log("update note:", JSON.stringify(note));
    const query = "UPDATE notes SET title = ?, description = ? WHERE id = ?";
    const stmt = db.prepare(query);

    stmt.run([note.title, note.description, note.id], function (err) {
      if (err) {
        return reject(err);
      }

      if (this.changes === 0) {
        return resolve(null);
      }

      resolve(note);
    });
  });
}

// delete a note
function remove(id) {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM notes WHERE id = ?";
    const stmt = db.prepare(query);

    stmt.run([id], function (err) {
      if (err) {
        return reject(err);
      }

      resolve(this.changes > 0);
    });
  });
}

module.exports = {
  get(filter) {
    if (isNaN(filter)) {
      return getAll(filter);
    }
    return getOne(filter);
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
