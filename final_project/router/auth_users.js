const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  // Retrieve 'username' and 'password' from the request body
  const { username, password } = req.body;

  // Check if 'username' and 'password' are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required for login" });
  }

  // Check if the username is valid (exists in 'users' array)
  if (!isValid(username)) {
    return res.status(403).json({ message: "Invalid username" });
  }

  // Check if the provided username and password match a user in 'users' array
  if (authenticatedUser(username, password)) {
    // If the credentials are valid, create a JWT for the user
    const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

    // Save the JWT in the session
    req.session.authorization = { accessToken };

    // Return a successful login response
    return res.status(200).json({ message: "Login successful", user: { username }, accessToken });
  } else {
    // If the credentials are invalid, return a 403 Forbidden response
    return res.status(403).json({ message: "Invalid credentials" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Retrieve the ISBN and review from the request parameters and query
  const isbn = req.params.isbn;
  const reviewText = req.query.review;
  
  // Check if the user is logged in
  if (!req.session.authorization || !req.session.authorization.accessToken) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // Decode the JWT to get the username
  const decodedToken = jwt.decode(req.session.authorization.accessToken);
  const username = decodedToken.username;

  // Check if the username is valid (exists in 'users' array)
  if (!isValid(username)) {
    return res.status(403).json({ message: "Invalid username" });
  }

  // Check if the book with the given ISBN exists in the 'books' database
  if (books[isbn]) {
    // Check if the user has already posted a review for the same ISBN
    if (books[isbn].reviews[username]) {
      // If the user has already posted a review, modify the existing review
      books[isbn].reviews[username] = reviewText;
    } else {
      // If the user has not posted a review, add a new review
      books[isbn].reviews[username] = reviewText;
    }

    // Return a successful review posting response
    return res.status(200).json({ message: "Review posted successfully", review: reviewText, username });
  } else {
    // If the book with the given ISBN is not found, return a 404 Not Found response
    return res.status(404).json({ message: "Book not found" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) =>{
    // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if the user is logged in
  if (!req.session.authorization || !req.session.authorization.accessToken) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // Decode the JWT to get the username
  const decodedToken = jwt.decode(req.session.authorization.accessToken);
  const username = decodedToken.username;

  // Check if the username is valid (exists in 'users' array)
  if (!isValid(username)) {
    return res.status(403).json({ message: "Invalid username" });
  }

  // Check if the book with the given ISBN exists in the 'books' database
  if (books[isbn]) {
    // Check if the user has posted a review for the same ISBN
    if (books[isbn].reviews[username]) {
      // Delete the user's review for the given ISBN
      delete books[isbn].reviews[username];

      // Return a successful review deletion response
      return res.status(200).json({ message: "Review deleted successfully", username });
    } else {
      // If the user has not posted a review for the given ISBN, return a 404 Not Found response
      return res.status(404).json({ message: "Review not found for the given ISBN" });
    }
  } else {
    // If the book with the given ISBN is not found, return a 404 Not Found response
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
