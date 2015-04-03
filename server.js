// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var path	 = require('path');

var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

// pass passport for configuration
require('./config/passport')(passport);

// connect to our database
var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs'); // set up ejs for templating
app.engine('html', require('ejs').renderFile);

// log every request to the console
app.use(logger('dev')); 
// get information from html forms
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
// read cookies (needed for auth)
app.use(cookieParser()); 

// required for passport
app.use(session({ secret: 'WebAppDemo' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//Served static files
app.use(express.static('public'));
app.use(express.static('views'));

var routes  = require('./app/routes.js')(app, passport); 
app.use('/', routes);

// launch ======================================================================
app.listen(port, function(){
  console.log('Express server listening on port %d in %s mode', port, app.get('env'));
});
