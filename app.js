const express = require('express');
const mysql = require('mysql');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcryptjs');
var path = require('path');

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'LibMan'
});

con.connect(function (err) {
  if (!err) {
    console.log("Database is connected");
  } else {
    console.log("Error while connecting with database");
  }
});


// Init App
const app = express();

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Body parser middleware
app.use(bodyParser.json({
  type: 'application/json'
}));
app.use(bodyParser.urlencoded({
  extended: true
}));

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// Initial Route (Login page)
app.get('/', function (req, res) {
  res.render('login');
});

app.post('/login', function (req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/query',
    failureRedirect: '/',
    failureFlash: true
  })(req, res, next);
});

// Query Route
app.get('/query', function (req, res) {
  res.render('query');
});

app.post('/query', function (req, res) {
  console.log(req.body);
  let selectQuery =
    "SELECT * FROM Book WHERE (?? = ? OR ?? LIKE '%?') AND (?? = ?) AND (?? = ? OR ?? LIKE '%?') AND (?? = ?) AND (?? = ?) AND (?? = ?)1";
  let query = mysql.format(selectQuery, [
    "title", req.body.Title,
    "ISBN", req.body.ISBN,
    "author", req.body.Author,
    "edition", req.body.Edition,
    "pubDate", req.body.Published_date,
    "issueStatus", req.body.toggle_option
  ]);
  con.query(query,
    function (err, rows) {
      if (err) {
        console.error(err);
        return;
      }
      console.log(rows);
    }
  );
  res.render('queryresults', {
    data: req.body
  });
});


// Displaying Query Route
app.get('/query_results', function (req, res) {
  res.render('queryresults');
});

app.post('/query_results', function (req, res) {
  con.query(
    // Add mySQL query here!
  )
});


// Logout
app.get('/logout', function (req, res) {
  res.logout();
  req.session.destroy();
  res.redirect('/');
});

// Start Server
app.listen(8000, function () {
  console.log('Server started on port 8000');
});