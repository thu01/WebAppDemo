//var mongoose = require('mongoose');
var mdPost = require('./models/posts');
var Products_info = require('./models/productsInfo');

module.exports = function(app, passport) {

// normal routes ===============================================================
	app.post('/wsGetPosts',function(req,res){
    var pageNumber = req.body.Page;
    var postsPerPage = req.body.PostsPerPage;
		mdPost.find().sort({_id:-1}).skip((pageNumber-1)*postsPerPage).limit(postsPerPage).exec(function(err, posts){
    		if(err){ return next(err); }
    		res.json(posts);
  		});
	});

	app.post('/wsCreatePost', function(req, res, next) {
    var newPost = new mdPost(req.body);
    newPost.save(function(err, newPost){
      if(err){ 
        return next(err); 
      }
    	res.json(newPost);
  	});
	});

  app.get('/wsGetPostsCount', function(req, res, next) {
    mdPost.count({},function(err, postsCount){
      if(err){
        return next(err);
      }
      res.json(postsCount);
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

  //Defaul routing
  app.all('*', function(req, res, next){
    res.redirect('/');
  });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
