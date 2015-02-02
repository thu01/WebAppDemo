var mongoose = require('mongoose');

var productsInfoSchema = new mongoose.Schema({
	product_name: String,
    product_type: String,
    product_price: Number,
	product_description: String
});

module.exports = mongoose.model('products_info', productsInfoSchema, 'products_info');
