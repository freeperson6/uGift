var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

ProductSchema = mongoose.Schema({
	name: String,
	date: String,
	price: Number,
	productTags: [String] 
});

ProductSchema.plugin(autoIncrement.plugin, 'Product');
module.exports.ProductSchema = ProductSchema;
