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
  password: '#jimmypage8877#',
  database: 'libman'
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

app.post('/', function (req, res, next) {
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
  let selectQuery =
    "SELECT * FROM Book WHERE (?? = ? ) OR (?? = ?) OR (?? = ? ) OR (?? = ?) OR (?? = ?) OR (?? = ?)";
  let query = mysql.format(selectQuery, [
    "Title", req.body.Title,
    "ISBN", req.body.ISBN,
    "Author", req.body.Author,
    "BookEdition", req.body.Edition,
    "PublicationDate", req.body.Published_date,
    "issue_status", req.body.toggle_option
  ]);
  con.query(query,
    function (err, rows) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(rows);

      res.render('queryresults', {
        data: rows
      });

    }
  );

});


// Displaying Query Route
app.get('/query_results', function (req, res) {
  res.render('queryresults');
});

// Logout
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});

// Start Server
app.listen(5000, function () {
  console.log('Server started on port 8000');
});
