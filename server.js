// *****************************************************************************
// Server.js - This file is the initial starting point for the Node/Express server.
//
// ******************************************************************************
// *** Dependencies
// =============================================================
var express = require('express')
var path = require('path')
var webpack = require('webpack')
var bodyParser = require("body-parser");
var passport = require("passport");
var session = require("express-session");
var morgan = require("morgan");
var cookieParser = require("cookie-parser");

// Sets up the Express App
// =============================================================
var app = express()
var PORT = process.env.PORT || 3000;

var webpackMiddleware = require("webpack-dev-middleware")
var webpackConfig = require('./webpack.config.js')

app.use(webpackMiddleware(
  webpack(webpackConfig),
  { publicPath: '/' }
))

// Requiring our models for syncing
var db = require("./models");

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));


// set morgan to log info about our requests for development use.
app.use(morgan('dev'));

// initialize cookie-parser to allow us access the cookies stored in the browser. 
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
  key: 'user_sid',
  secret: 'somerandomstuffs',
  resave: false, 
  saveUninitialized: false,
  cookie: {
  	expires: 600000
  }
}));



// Static directory
app.use(express.static("public"));

app.get('/dashboard', function(req, res){
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'))
});

app.get('/users', function(req, res){
  res.sendFile(path.join(__dirname, 'public', 'user-manager.html'))
});

app.get('/today', function(req, res){
  res.sendFile(path.join(__dirname, 'public', 'today.html'))
});

app.get('/med-list', function(req, res){
  res.sendFile(path.join(__dirname, 'public', 'med-list.html'))
});

app.get('/med-manager', function(req, res){
  res.sendFile(path.join(__dirname, 'public', 'med-manager.html'))
});

/*
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
});
*/

// Routes
// =============================================================
require("./routes/html-routes.js")(app);
require("./routes/user-api-routes.js")(app);
require("./routes/meds-api-routes.js")(app);
require("./routes/events-api-routes.js")(app);


// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
	if(req.cookies.user_sid && !req.session.user){
		res.clearCookie('user_sid');
	}
	next();
});

// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        res.redirect('/today');
    } else {
        next();
    }    
};

// rou// route for Home-Page
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});

// route for user signup
app.route('/signup')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/user-manager.html');
    })
    .post((req, res) => {
        db.User.create({
        	  name: req.body.username,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
        .then(user => {
            req.session.user = user.dataValues;
            res.redirect('/today');
        })
        .catch(error => {
            res.redirect('/signup');
        });
    });


// route for user Login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/login.html');
    })
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;

        db.User.findOne({ where: { username: username } }).then(function (user) {
            if (!user) {
                console.log("That is not a valid Username");
                res.send('invalid username');
            } else if (!user.validPassword(password)) {
                console.log("That is not a valid Password");
                res.send('invalid password');
            } else {
                console.log(" USER DATAVALUES "+  JSON.stringify(user.dataValues));
                req.session.user = user.dataValues;
                console.log(" REQ SESSION USER"+JSON.stringify(req.session.user));
                console.log("USER ID: "+ user.dataValues.id);
                var responseObj = {status: "success", userid: user.dataValues.id};
                res.send(responseObj);
            }
        });
    });


// route for user's dashboard
app.get('/today', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.sendFile(__dirname + '/public/today.html');
    } else {
        res.redirect('/login');
    }
});


// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/');
    }
});


// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});
// Syncing our sequelize models and then starting our Express app
// =============================================================
db.sequelize.sync({ force: false }).then(function() {
  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });
});