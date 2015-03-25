//var mongoose = require('mongoose');
var Post = require('./models/posts');
var Products_info = require('./models/productsInfo');

module.exports = function(app, passport) {

// normal routes ===============================================================
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

  var email = require('./controllers/emails');
  app.post('/email/contact', email.contact, function(err, data){
    console.log("send email success");
  });

    var auth = require('../config/auth');
    var session = require('./controllers/session');
    app.get('/auth/session', auth.ensureAuthenticated, session.session);
    app.post('/auth/session', session.login);
    app.del('/auth/session', session.logout);

    // User Routes
    var users = require('./controllers/users');
    app.post('/auth/users', users.create);
    app.get('/auth/users/:userId', users.show);
    app.put('/auth/users', users.rstpwd);

	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
