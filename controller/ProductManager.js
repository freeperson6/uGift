/*-------------------------------------------------------
GLobal variables for db and auto increment
--------------------------------------------------------*/
var debug = require('debug')('ProductManager.js');
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

var ProductSchema, Product;

var MONGODB_URL = 'mongodb://localhost/';
var RecommendationManager = require('./RecommendationManager.js');
var recommendationManager = new RecommendationManager(MONGODB_URL);
/*-------------------------------------------------------
Implement basic manager functions, including trip database
--------------------------------------------------------*/
//Get in where the database is mongodb://localhost/
function ProductManager(url){
	mongoose.createConnection(url);
	this.db = mongoose.connection;
	autoIncrement.initialize(this.db);
	this.db.on('error', console.error.bind(console, 'connection error:'));
	this.db.once('open', function (callback) {
		debug("Connected to mongodb");
	});

	ProductSchema = require('./ProductSchema.js').ProductSchema;
	Product = mongoose.model('Product',ProductSchema, 'Product');
}

ProductManager.prototype.findProduct = function(recommendation, callback){
	//console.log(recommendation);
	Product.find({tag: {$in: recommendation.receiverTags}},function(err,products){
		if(err){
    		console.log("[ERROR]: fail to find one product for the tags given");
        	callback(false,"Internal Server Error");
        	return;
		}
		else{
			if(products != []){
				recommendationManager.updateRecommendation(recommendation,products,function(success){
					if (!success){
						console.log("Error in update recommedantion");
					}
				});
			}
			callback(true, products);
			return;
		}
	});
	/*Product.find({}, function(err, products){
		if(err) {
			throw err;
		} else {
			callback(products);
		}		
	});*/
}
/*-------------------------------------------------------
Export for usage
--------------------------------------------------------*/
module.exports = ProductManager;
