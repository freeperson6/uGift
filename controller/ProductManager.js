/*-------------------------------------------------------
GLobal variables for db and auto increment
--------------------------------------------------------*/
var debug = require('debug')('TripManager.js');
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

var ProductSchema, Product;

/*-------------------------------------------------------
Implement basic manager functions, including trip database
--------------------------------------------------------*/
//Get in where the database is mongodb://localhost/
function TripManager(url){
	mongoose.createConnection(url);
	this.db = mongoose.connection;
	autoIncrement.initialize(this.db);
	this.db.on('error', console.error.bind(console, 'connection error:'));
	this.db.once('open', function (callback) {
		debug("Connected to mongodb");
	});

	ProductSchema = require('./ProductSchema.js').ProductSchema;
	Product = mongoose.model('Product',ProductSchema);
}

/*-------------------------------------------------------
Export for usage
--------------------------------------------------------*/
module.exports = TripManager;