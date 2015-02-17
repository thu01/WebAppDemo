var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');
/**
 * Send email
 * requires: json:
 {
   text:    "i hope this works", 
   from:    "you <username@your-email.com>", 
   to:      "someone <someone@your-email.com>, another <another@your-email.com>",
   cc:      "else <else@your-email.com>",
   subject: "testing"
}
 * return: 200
 */
exports.send = function (req, cb) {

    // This is your API key that you retrieve from www.mailgun.com
    var auth = {
      auth: {
        api_key: 'key-22b0d42f46b79aa40eb9d109dca7ad8c',
        domain: 'sandbox785f2ccf9c5d4f4d917e99a2dc3bb9f7.mailgun.org'
      }
    };

    var nodemailerMailgun = nodemailer.createTransport(mg(auth));

    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails
    nodemailerMailgun.sendMail({
      from: 'rootndev@gmail.com',
      to: req.user_email, // An array if you have multiple recipients.
      subject: 'Hey you, awesome!',
      text: 'Test! This is your new password: ' + req.user_password,
    }, function (err, info) {
      if (err) {
        console.log('Error: ' + err);
      }
      else {
        console.log('Response: ' + info);
      }
    });
    cb();
}