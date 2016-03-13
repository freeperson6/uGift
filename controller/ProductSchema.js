var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

ProductSchema = mongoose.Schema({
	name: String,
	url: String,
	createdDate: String,
	tag: [String],
	rating: Number,
	price: String,
	review: [String],
	ID: String
});

ProductSchema.plugin(autoIncrement.plugin, 'Product');
module.exports.ProductSchema = ProductSchema;
