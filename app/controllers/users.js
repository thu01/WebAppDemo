'use strict';

var mongoose = require('mongoose'),
  User = mongoose.model('user_info'),
  passport = require('passport'),
  ObjectId = mongoose.Types.ObjectId,
  emailer = require('../controllers/emails');

/**
 * Create user
 * requires: {username, password, email}
 * returns: {email, password}
 */
exports.create = function (req, res, next) {
  console.log("Users; req = " + req.body);
  console.dir(req.body);
  var newUser = new User(req.body);
  newUser.provider = 'local';

  newUser.save(function(err) {
    if (err) {
      return res.json(400, err);
    }

    req.logIn(newUser, function(err) {
      if (err) return next(err);
      return res.json(newUser.user_info);
    });
  });
};

/**
 *  Show profile
 *  returns {username, profile}
 */
exports.show = function (req, res, next) {
  var userId = req.params.userId;

  User.findById(ObjectId(userId), function (err, user) {
    if (err) {
      return next(new Error('Failed to load User'));
    }
    if (user) {
      res.send({username: user.username, profile: user.profile });
    } else {
      res.send(404, 'USER_NOT_FOUND')
    }
  });
};

/**
 *  Username exists
 *  returns {exists}
 */
exports.exists = function (req, res, next) {
  var username = req.params.username;
  User.findOne({ username : username }, function (err, user) {
    if (err) {
      return next(new Error('Failed to load User ' + username));
    }

    if(user) {
      res.json({exists: true});
    } else {
      res.json({exists: false});
    }
  });
}

/**
 *  Reset User Password base on email address
 *  requires: {email, password}
 *  returns: {200}
 */
exports.rstpwd = function (req, res) {
  console.log(req.body);
  var user_email = req.body.user_email;
  // suggested way of generating password
  var user_password = Math.random().toString(36).slice(-8);
  User.findOneAndUpdate(
      { user_email : user_email },
      { user_password: user_password},
      function (err, user) {
        if (err) {
          return next(new Error('Failed to load User ' + user_email));
        };

        if(user) {
            emailer.send({user_email: user_email, user_password: user_password},
            function(err) {
              if (err) {
                console.log(err);
                return res.json(400, err);
              };
              console.log('reset password success.');
              res.status(200).json({exists: true});
            });
        } else {
        res.json({exists: false});
      };
    });
}
