//var mongoose = require('mongoose');
var mdPost = require('./models/posts');
var mdProduct = require('./models/productsInfo');
var express  = require('express');
var router = express.Router();

module.exports = function(app, passport) {

  router.get('/:type(news|posts|products)', function(req, res) {
    res.render('index.html');
  });
  
  // normal routes ===============================================================
	router.post('/wsGetPosts',function(req,res){
    var pageNumber = req.body.Page;
    var postsPerPage = req.body.PostsPerPage;
		mdPost.find().sort({_id:-1}).skip((pageNumber-1)*postsPerPage).limit(postsPerPage).exec(function(err, posts){
    		if(err){ return next(err); }
    		res.json(posts);
  		});
	});

	router.post('/wsCreatePost', function(req, res, next) {
    var newPost = new mdPost(req.body);
    newPost.save(function(err, newPost){
      if(err){ 
        return next(err); 
      }
    	res.json(newPost);
  	});
	});

  router.get('/wsGetPostsCount', function(req, res, next) {
    mdPost.count({},function(err, postsCount){
      if(err){
        return next(err);
      }
      res.json(postsCount);
    });
  });

	router.get('/wsGetProductsInfo',function(req,res){
		console.log("/wsGetProductsInfo");
		mdProduct.find().exec(function(err, products_info){
    		if(err){ 
          return next(err); 
        }
    		res.json(products_info);
  		});
	});

  var email = require('./controllers/emails');
  router.post('/email/contact', email.contact, function(err, data){
    console.log("send email success");
  });

  var auth = require('../config/auth');
  var session = require('./controllers/session');
  router.get('/auth/session', auth.ensureAuthenticated, session.session);
  router.post('/auth/session', session.login);
  router.delete('/auth/session', session.logout);

  // User Routes
  var users = require('./controllers/users');
  router.post('/auth/users', users.create);
  router.get('/auth/users/:userId', users.show);
  router.put('/auth/users', users.rstpwd);

	// LOGOUT ==============================
	router.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

  //Defaul routing
  router.all('*', function(req, res, next){
    res.send(404);
    //next();
  });

  return router;
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
