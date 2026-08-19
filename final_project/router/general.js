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
    // const response = await axios.get({books});
    let response = await Promise.resolve(books);
    res.send(JSON.stringify({ response }, null, 4));
  } catch (error) {
    res.status(500).send(JSON.stringify({ error: "Could not fetch books" }, null, 4));
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Retrieve the isbn parameter from the request URL and send the corresponding book's details
  const isbn = req.params.isbn;
  res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let foundByAuthor = [];
  const keys = Object.keys(books);
  for(const key of keys) {
    if(books[key].author === author)
      foundByAuthor.push(books[key]);
  }

  if(foundByAuthor.length > 0)
    res.send(foundByAuthor);
  else
    res.send("There is no such author.");
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const keys = Object.keys(books);
  for(const key of keys) {
    if(books[key].title === title)
      return res.send(books[key]);
  }
  res.send("There is no such title.");
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;
