"use strict";

const { NODE_ENV } = require("../util/config");
const sqlite = require("sqlite3");
const db = new sqlite.Database("./users.db");

if (NODE_ENV == "development") {
  db.run("DROP TABLE IF EXISTS users");
}

function insert(user) {
  const query = "INSERT INTO users (name) VALUES (?)";
  const stat = db.prepare(query);
  stat.run([user.name], (err) => {
    if (err) console.error(err);
    else console.log("insert new user:", JSON.stringify(user));
  });
}

db.run(
  `CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL
);`,
  () => {
    // insert demo data while in development environment
    if (NODE_ENV === "development") {
      const demoUsers = [{ name: "John Doe" }, { name: "Jane Smith" }];
      demoUsers.forEach((user) => {
        insert(user);
      });
    }
  },
);

function getAll() {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users";
    const stat = db.prepare(query);
    stat.all([], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

function getOne(id) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM users WHERE id = ?";
    const stat = db.prepare(query);
    stat.get([id], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
}

function save(user) {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO users (name) VALUES (?)";
    const stat = db.prepare(query);
    stat.run([user.name], function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, ...user });
    });
  });
}

function update(users) {
  return new Promise((resolve, reject) => {
    const query = "UPDATE users SET name = ?";
    const stat = db.prepare(query);
    stat.run([users.name, users.id], (err) => {
      if (err) {
        return reject(err);
      }
      resolve(users);
    });
  });
}

function remove(id) {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM users WHERE id = ?";
    const stat = db.prepare(query);
    stat.run([id], (err) => {
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
  save,
  delete(id) {
    return remove(id);
  },
};
