const express = require('express');
const axios = require('axios')
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

//registering a user
public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required for registration" });
    }

    if (users.some(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists. Please choose a different username." });
    }

    users.push({ username, password });

    return res.status(200).json({ message: "User successfully registered", user: { username } });
});

// Get the list of all books available in the shop using async-await
public_users.get('/', async function (req, res) {
    try {
      const response = await axios.get('https://dhruvasandu-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/');
      const shopBooks = response.data;
  
      return res.status(200).json({ books: shopBooks });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get book details based on ISBN using promise callback
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
  
    axios.get(`https://dhruvasandu-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/${isbn}`)
      .then(response => {
        const bookDetails = response.data;
        return res.status(200).json({ book: bookDetails });
      })
      .catch(error => {
        console.error(error);
        return res.status(404).json({ message: "Book not found" });
      });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
      const bookDetails = books[isbn];
      return res.status(200).json({ book: bookDetails });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on author using async-await
public_users.get('/author/:author', async function (req, res) {
    try {
      const requestedAuthor = req.params.author;
      const response = await axios.get(`https://dhruvasandu-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/author/${requestedAuthor}`);
      const matchingBooks = response.data;
  
      if (matchingBooks.length > 0) {
        return res.status(200).json({ books: matchingBooks });
      } else {
        return res.status(404).json({ message: "No books found for the provided author" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const requestedAuthor = req.params.author;
    const matchingBooks = Object.keys(books).reduce((result, isbn) => {
    const book = books[isbn];
    if (book.author === requestedAuthor) {
        result[isbn] = book;
    }
    return result;
    }, {});

    if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).json({ books: matchingBooks });
    } else {
    return res.status(404).json({ message: "No books found for the provided author" });
    }
});

// Get book details based on title using async-await
public_users.get('/title/:title', async function (req, res) {
    try {
      const requestedTitle = req.params.title;
      const response = await axios.get(`https://dhruvasandu-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/title/${requestedTitle}`);
      const matchingBooks = response.data;
      
      if (matchingBooks.length > 0) {
        return res.status(200).json({ books: matchingBooks });
      } else {
        return res.status(404).json({ message: "No books found for the provided title" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
   const requestedTitle = req.params.title;
   const matchingBooks = Object.keys(books).reduce((result, isbn) => {
     const book = books[isbn];
     if (book.title.toLowerCase() === requestedTitle.toLowerCase()) {
       result[isbn] = book;
     }
     return result;
   }, {});
 
   if (Object.keys(matchingBooks).length > 0) { 
     return res.status(200).json({ books: matchingBooks });
   } else {
     return res.status(404).json({ message: "No books found for the provided title" });
   }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    const bookReviews = books[isbn].reviews;
    return res.status(200).json({ reviews: bookReviews });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
