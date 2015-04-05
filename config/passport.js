// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;

// load up the user model
var User       = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // Use local strategy
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
      },
      function(email, password, done) {
        //console.log(email);
        //console.log(password);
        User.findOne({ 'user_email' : email }, function (err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false, {
              'errors': {
                'email': { type: 'Email is not registered.' }
              }
            });
          }
          if (!user.authenticate(password)) {
            return done(null, false, {
              'errors': {
                'password': { type: 'Password is incorrect.' }
              }
            });
          }
          //console.log(user);
          return done(null, user);
        });
      }
    ));


    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        nicknameField : 'username',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            // if the user is not already logged in:
            if (!req.user) {
                User.findOne({ 'user_email' :  email }, function(err, user) {
                    // if there are any errors, return the error
                    if (err){
                        console.log("error in find user_email");
                        return done(err);
                    }

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // create the user
                        console.log("Create new user");
                        var newUser            = new User();
                        newUser.user_email    = email;
                        //TODO:
                        //newUser.local.password = newUser.generateHash(password);
                        newUser.user_password = password;
                        newUser.user_nickname = req.param("username");
                        newUser.user_url = "";
                        newUser.user_registered_time = "";
                        newUser.user_activation_key="";
                        newUser.user_status="";
                        newUser.save(function(err) {
                            if (err)
                                return done(err);
                            console.log("5");
                            return done(null, newUser);
                        });
                    }

                });
            // if the user is logged in but has no local account...
            } else if ( !req.user_email ) {
                // ...presumably they're trying to connect a local account
                // BUT let's check if the email used to connect a local account is being used by another user
                User.findOne({ 'user_email' :  email }, function(err, user) {
                    if (err)
                        return done(err);
                    
                    if (user) {
                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                    } else {
                        var user = req.user;
                        user.user_email = email;                        
                        user.user_password = password;
                        user.user_nickname = req.params("username");
                        user.user_url = "";
                        user.user_registered_time = "";
                        user.user_activation_key="";
                        user.user_status="";
                        user.save(function (err) {
                            if (err)
                                return done(err);
                            
                            return done(null,user);
                        });
                    }
                });
            } else {
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }

        });

    }));

};
