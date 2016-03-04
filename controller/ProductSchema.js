var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

ProductSchema = mongoose.Schema({
	name: String,
	url: String,
	createdDate: String,
	tag: [String]
});

ProductSchema.plugin(autoIncrement.plugin, 'Product');
module.exports.ProductSchema = ProductSchema;
