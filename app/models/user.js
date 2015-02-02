// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        user_email        : String,
        user_password     : String,
    }
});

// define the schema for our user model

var localSchema = mongoose.Schema({
    user_email        : String,
    user_name     : String,
    user_password     : String,
});

/**
 * Virtuals
 */
localSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    //this.salt = this.makeSalt();
    //this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

localSchema
  .virtual('user_profile')
  .get(function () {
    return { '_id': this._id, 'user_name': this.user_name, 'user_email': this.user_email };
  });

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// generating a hash
localSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
//TODO: use hashed password
localSchema.methods.authenticate = function(password) {
    return password==this.user_password;
};


// create the model for users and expose it to our app
module.exports = mongoose.model('user_info', localSchema, 'user_info');
