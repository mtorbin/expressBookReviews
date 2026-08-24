const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!isValid(username)) {
        // Add the new user to the users array
        users.push({"username": username, "password": password});
        return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
        return res.status(404).json({message: "User already exists!"});
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Username or password are not provided. Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    // const response = await axios.get('http://localhost:5000');
    let response = await Promise.resolve(books);
    res.send(JSON.stringify({ response }, null, 4));
  } catch (error) {
    res.status(500).send(JSON.stringify({ error: "Could not fetch books" }, null, 4));
  }
});

// Get book details based on ISBN - synchronous and 2 async methods

// public_users.get('/isbn/:isbn', function (req, res) {
//   // Retrieve the isbn parameter from the request URL and send the corresponding book's details
//   const isbn = req.params.isbn;
//   res.send(books[isbn]);
// });

// public_users.get('/isbn/:isbn', async function (req, res) {
//   try {
//     // Retrieve the isbn parameter from the request URL and send the corresponding book's details
//     const isbn = req.params.isbn;
//     let response = await Promise.resolve(books[isbn]);
//     res.send(JSON.stringify({ response }, null, 4));
//   } catch (error) {
//     res.status(500).send(JSON.stringify({ error: "Could not fetch the book" }, null, 4));
//   }
// });

public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = () => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      resolve(book);
    });
  };

  try {
    const book = await getBookByISBN();
    if (book)
      res.send(book);
    else
      res.send("There is no such book for this ISBN.");
  } catch (err) {
    res.status(500).send("Something went wrong.");
  }
});
  
// Get book details based on author

// public_users.get('/author/:author',function (req, res) {
//   const author = req.params.author;
//   let foundByAuthor = [];
//   const keys = Object.keys(books);
//   for(const key of keys) {
//     if(books[key].author === author)
//       foundByAuthor.push(books[key]);
//   }

//   if(foundByAuthor.length > 0)
//     res.send(foundByAuthor);
//   else
//     res.send("There is no such author.");
// });

public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  const getBooksByAuthor = () => {
    return new Promise((resolve, reject) => {
      const keys = Object.keys(books);
      const foundByAuthor = keys
        .filter(key => books[key].author === author)
        .map(key => books[key]);
      resolve(foundByAuthor);
    });
  };

  try {
    const foundByAuthor = await getBooksByAuthor();
    if (foundByAuthor.length > 0)
      res.send(foundByAuthor);
    else
      res.send("There is no such author.");
  } catch (err) {
    res.status(500).send("Something went wrong.");
  }
});

// Get all books based on title

// public_users.get('/title/:title',function (req, res) {
//   const title = req.params.title;
//   const keys = Object.keys(books);
//   for(const key of keys) {
//     if(books[key].title === title)
//       return res.send(books[key]);
//   }
//   res.send("There is no such title.");
// });

public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  const getBookByTitle = () => {
    return new Promise((resolve, reject) => {
      const keys = Object.keys(books);
      const found = keys.find(key => books[key].title === title);
      resolve(found ? books[found] : null);
    });
  };

  try {
    const book = await getBookByTitle();
    if (book)
      res.send(book);
    else
      res.send("There is no such title.");
  } catch (err) {
    res.status(500).send("Something went wrong.");
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if(isbn)
    res.send(books[isbn].reviews);
  else
    res.send("There is no such ISBN.");
});

module.exports.general = public_users;
