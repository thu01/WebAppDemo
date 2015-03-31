var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
	post_author: String,
	post_date: String,
	post_date_time: String,
	post_content: String
});

module.exports = mongoose.model('posts', postSchema);
