// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');


// define the schema for our user model
var userSchema = mongoose.Schema({
    user_email : {
        type: String,
        unique: true,
        required: true
        },
    user_name : {
        type: String,
        unique: true,
        required:true
        },
    user_password     : String,
});

/**
 * Virtuals
 */
userSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    //this.salt = this.makeSalt();
    //this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

userSchema
  .virtual('user_profile')
  .get(function () {
    return { '_id': this._id, 'user_name': this.user_name, 'user_email': this.user_email };
  });


/**
 * Validations
 */

var validatePresenceOf = function (value) {
  console.log("validatePresenceOf; value = " + value);
  return value && value.length;
};

userSchema.path('user_email').validate(function (user_email) {
  var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailRegex.test(user_email);
}, 'The specified email is invalid.');

userSchema.path('user_email').validate(function(value, respond) {
  mongoose.models["user_info"].findOne({user_email: value}, function(err, user) {
    if(err) throw err;
    if(user) return respond(false);
    respond(true);
  });
}, 'The specified email address is already in use.');

userSchema.path('user_name').validate(function(value, respond) {
  mongoose.models["user_info"].findOne({user_name: value}, function(err, user) {
    if(err) throw err;
    if(user) return respond(false);
    respond(true);
  });
}, 'The specified username is already in use.');

/**
 * Pre-save hook
 */

userSchema.pre('save', function(next) {

  if (!this.isNew) {
    return next();
  }
  if (!validatePresenceOf(this.user_password)) {
    next(new Error('Invalid password'));
  }
  else {
    next();
  }
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
//TODO: use hashed password
userSchema.methods.authenticate = function(password) {
    return password==this.user_password;
};


// create the model for users and expose it to our app
module.exports = mongoose.model('user_info', userSchema, 'user_info');
