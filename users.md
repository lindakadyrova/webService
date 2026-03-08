# New REST Endpoint
## **Step-by-Step Guide: Creating a New `/users` Endpoint in Express.js**

This guide explains how to **add a new RESTful endpoint (`/users`)** using the same structure as the existing **`/notes`** folder. The new endpoint will follow a **MVC (Model-View-Controller) structure**, where:

- `model.js` handles database interactions
- `controller.js` contains business logic
- `index.js` manages routes
- `server.js` registers the endpoint


### **1. Create the `/users` Directory**
Inside your project root, create a new directory for the users module:

```bash
mkdir users
cd users
touch model.js controller.js index.js
```

### **2. Define the Database Model (`users/model.js`)**
This file handles database interactions, similar to `notes/model.js`.

```javascript
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// Create users table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstname TEXT NOT NULL,
      lastname TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    )
  `);
});

// Function to fetch all users
const getAllUsers = (callback) => {
// TO IMPLEMENT ...
};

// Function to fetch a single user by ID
const getUserById = (id, callback) => {
// TO IMPLEMENT ...
};

// Function to create a new user
const createUser = (user, callback) => {
// TO IMPLEMENT ...
};

// Function to update an existing user
const updateUser = (id, user, callback) => {
// TO IMPLEMENT ...
};

// Function to delete a user
const deleteUser = (id, callback) => {
// TO IMPLEMENT ...
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
```

### **3. Implement Business Logic (`users/controller.js`)**
This file contains the logic for handling requests.

```javascript
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require("./model");
const { body, validationResult } = require("express-validator");

// Fetch all users
const listUsers = (req, res) => {
// TO IMPLEMENT ...
};

// Fetch a single user
const getUser = (req, res) => {
// TO IMPLEMENT ...
};

// Validation Middleware
const validateUser = [
// TO IMPLEMENT ...
];

// Create a new user
const addUser = (req, res) => {
// TO IMPLEMENT ...
};

// Update a user
const editUser = (req, res) => {
// TO IMPLEMENT ...
};

// Delete a user
const removeUser = (req, res) => {
// TO IMPLEMENT ...
};

module.exports = { listUsers, getUser, addUser, editUser, removeUser, validateUser };
```


### **4. Define the Routes (`users/index.js`)**
This file connects the `controller.js` functions to their respective routes.

```javascript
const express = require("express");
const router = express.Router();
const { listUsers, getUser, addUser, editUser, removeUser, validateUser } = require("./controller");

// Define Routes
// TO IMPLEMENT ...

module.exports = router;
```

### **5. Register the `/users` Route in `server.js`**
Modify `server.js` to include the new users module.

```javascript
const express = require("express");
const app = express();
const usersRoutes = require("./users");
const notesRoutes = require("./notes");

app.use(express.json());

// Register routes
app.use("/users", usersRoutes);
app.use("/notes", notesRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### **6. Test the API Using cURL or Postman**
#### **Create a New User**
```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"firstname": "John", "lastname": "Doe", "email": "john.doe@example.com"}'
```

#### **Retrieve All Users**
```bash
curl -X GET http://localhost:8080/users
```

#### **Retrieve a Single User**
```bash
curl -X GET http://localhost:8080/users/1
```

#### **Update an Existing User**
```bash
curl -X PUT http://localhost:8080/users/1 \
  -H "Content-Type: application/json" \
  -d '{"firstname": "Jane", "lastname": "Smith", "email": "jane.smith@example.com"}'
```

#### **Delete a User**
```bash
curl -X DELETE http://localhost:8080/users/1
```

## **Summary**
- Created a new `/users` endpoint using MVC structure.
- Implemented CRUD operations in separate model, controller, and route files.
- Used express-validator for input validation.
- Registered the route in `server.js` and tested it with cURL/Postman.


# Working with nested objects /users/<id>/address

The goal is to **properly structure the `address` field as a nested object** within the user JSON response and allow interactions with it through `/users/<id>/address`. The following changes will ensure that the `address` data is always correctly represented as a sub-object inside the `user` object.

## **1️. Update the Database Model (`users/model.js`)**
Modify the `getUserById` and `getAllUsers` functions to structure `address` properly as an object.

```javascript
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

// Create users table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      street TEXT NOT NULL,
      number TEXT NOT NULL,
      zip INTEGER NOT NULL,
      city TEXT NOT NULL
    )
  `);
});

// Fetch all users and structure address as a nested object
const getAllUsers = (callback) => {
  db.all("SELECT id, name, street, number, zip, city FROM users", [], (err, rows) => {
    if (err) {
      callback(err, null);
      return;
    }

    const users = rows.map(user => ({
      id: user.id,
      name: user.name,
      address: {
        street: user.street,
        number: user.number,
        zip: user.zip,
        city: user.city
      }
    }));

    callback(null, users);
  });
};

// Fetch a single user by ID and return address as an object
const getUserById = (id, callback) => {
  db.get("SELECT id, name, street, number, zip, city FROM users WHERE id = ?", [id], (err, user) => {
    if (err || !user) {
      callback(err, null);
      return;
    }

    const formattedUser = {
      id: user.id,
      name: user.name,
      address: {
        street: user.street,
        number: user.number,
        zip: user.zip,
        city: user.city
      }
    };

    callback(null, formattedUser);
  });
};

// Fetch only the address of a user
const getUserAddressById = (id, callback) => {
  db.get("SELECT street, number, zip, city FROM users WHERE id = ?", [id], (err, address) => {
    callback(err, address);
  });
};

// Insert new user with address fields
const createUser = (user, callback) => {
  const { name, address } = user;
  db.run(
    "INSERT INTO users (name, street, number, zip, city) VALUES (?, ?, ?, ?, ?)",
    [name, address.street, address.number, address.zip, address.city],
    function (err) {
      callback(err, { id: this.lastID, name, address });
    }
  );
};

// Update the address of an existing user
const updateUserAddress = (id, address, callback) => {
  db.run(
    "UPDATE users SET street = ?, number = ?, zip = ?, city = ? WHERE id = ?",
    [address.street, address.number, address.zip, address.city, id],
    function (err) {
      callback(err, { id, address });
    }
  );
};

module.exports = { getAllUsers, getUserById, getUserAddressById, createUser, updateUserAddress };
```

## **2️. Update Business Logic (`users/controller.js`)**
Ensure all responses return `address` as an object.

```javascript
const { getAllUsers, getUserById, getUserAddressById, createUser, updateUserAddress } = require("./model");
const { body, validationResult } = require("express-validator");

// Fetch all users
const listUsers = (req, res) => {
  getAllUsers((err, users) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(users);
  });
};

// Fetch a single user
const getUser = (req, res) => {
  getUserById(req.params.id, (err, user) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  });
};

// Fetch only the user's address
const getUserAddress = (req, res) => {
  getUserAddressById(req.params.id, (err, address) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!address) return res.status(404).json({ error: "User not found" });
    res.json(address);
  });
};

// Validation Middleware
const validateUser = [
  body("name").isString().isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
  body("address").isObject().withMessage("Address must be an object."),
  body("address.street").isString().withMessage("Street must be a string."),
    
    // ...
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Create a new user
const addUser = (req, res) => {
  createUser(req.body, (err, newUser) => {
    if (err) return res.status(500).json({ error: "Failed to create user" });
    res.status(201).json(newUser);
  });
};

// Update a user's address
const editUserAddress = (req, res) => {
  updateUserAddress(req.params.id, req.body, (err, updatedAddress) => {
    if (err) return res.status(500).json({ error: "Failed to update address" });
    res.json(updatedAddress);
  });
};

module.exports = { listUsers, getUser, getUserAddress, addUser, editUserAddress, validateUser };
```



## **3️. Define the Routes (`users/index.js`)**
```javascript
const express = require("express");
const router = express.Router();
const { listUsers, getUser, getUserAddress, addUser, editUserAddress, validateUser } = require("./controller");

router.get("/", listUsers);
router.get("/:id", getUser);
router.get("/:id/address", getUserAddress);
router.post("/", validateUser, addUser);
router.put("/:id/address", editUserAddress);

module.exports = router;
```

## **4️. Update the Server (`server.js`)**
```javascript
const express = require("express");
const app = express();
const usersRoutes = require("./users");
const notesRoutes = require("./notes");

app.use(express.json());

app.use("/users", usersRoutes);
app.use("/notes", notesRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## **5️. Test the API**
#### **Create a New User**
```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "address": {
      "street": "Main Street",
      "number": "42A",
      "zip": 12345,
      "city": "New York"
    }
  }'
```

#### **Retrieve All Users**
```bash
curl -X GET http://localhost:8080/users
```

#### **Retrieve a Single User**
```bash
curl -X GET http://localhost:8080/users/1
```

#### **Retrieve Only the Address**
```bash
curl -X GET http://localhost:8080/users/1/address
```

#### **Update a User’s Address**
```bash
curl -X PUT http://localhost:8080/users/1/address \
  -H "Content-Type: application/json" \
  -d '{
    "street": "Updated Street",
    "number": "99B",
    "zip": 54321,
    "city": "Los Angeles"
  }'
```

## **Summary**
- Ensured `address` is always stored and returned as a nested object.
- Allowed retrieving only the `address` using `/users/<id>/address`.
- Updated validation to check for correct data structure.

This API now correctly represents the `address` as a nested object inside `user`.