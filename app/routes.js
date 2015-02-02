//var mongoose = require('mongoose');
var Post = require('./models/posts');
var Products_info = require('./models/productsInfo');

module.exports = function(app, passport) {

// normal routes ===============================================================

	// show the home page (will also have our login links)
	/*
	app.get('/', function(req, res) {
		res.render('index.html');
	});

	// show the home page for index
	app.get('/index', function(req, res) {
		res.render('index.html');
	});
*/

	app.get('/posts',function(req,res){
		Post.find({}).sort({post_date:-1, post_date_time:-1}).exec(function(err, posts){
    		if(err){ return next(err); }
    		res.json(posts);
  		});
	});

	app.post('/posts', function(req, res, next) {
  		var post = new Post(req.body);
  		post.save(function(err, post){
    		if(err){ return next(err); }
    	res.json(post);
  		});
	});

	app.get('/productsinfo',function(req,res){
		console.log("/productsinfo");
		Products_info.find(function(err, products_info){
    		if(err){ return next(err); }
    		//console.log(products_info);
    		res.json(products_info);
  		});
	});

    
    var auth = require('../config/auth');
    var session = require('./controllers/session');
    app.get('/auth/session', auth.ensureAuthenticated, session.session);
    app.post('/auth/session', session.login);
    app.del('/auth/session', session.logout);



	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

	// locally --------------------------------
		// LOGIN ===============================
		// show the login form
		app.get('/login', function(req, res) {
			res.render('login.ejs', { message: req.flash('loginMessage') });
		});

		// process the login form
		app.post('/login', passport.authenticate('local-login', {
			successRedirect : '/', // redirect to the secure profile section
			failureRedirect : '/index', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));

        // SIGNUP =================================
		// show the signup form
		app.get('/signup', function(req, res) {
			res.render('register.ejs', { message: req.flash('signupMessage') });
		});

		// process the signup form
		app.post('/signup', passport.authenticate('local-signup', {
			successRedirect : '/moments', // redirect to the secure profile section
			//TODO: redirect to signup if fails
			failureRedirect : '/index', // redirect back to the signup page if there is an error
			failureFlash : true // allow flash messages
		}));
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
