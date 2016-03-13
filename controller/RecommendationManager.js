var debug = require('debug')('RecommendationManager.js');
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var xssFilters = require('xss-filters');

var RecommendationSchema, Recommendation;

/*
* constructor that create the FeedbackManager that control the
* database
* params: the url and port that the database manager listens to
*/
function RecommendationManager(url){
	//connect to the database
	mongoose.createConnection(url);
	this.db = mongoose.connection;
	this.db.on('error', console.error.bind(console, 'connection error:'));
	this.db.once('open', function (callback) {
		debug("Connected to mongodb");
	});
	autoIncrement.initialize(this.db);

	/*** Initialize Schema ***/
	RecommendationSchema = require('./RecommendationSchema.js').RecommendationSchema;
	Recommendation = mongoose.model('Recommendation', RecommendationSchema);
}

RecommendationManager.prototype.addRecommendation = function(recommendation, callback){
	var newRecommendation = new Recommendation(recommendation);
	newRecommendation.save(function(error,data){
		if(error){
    		console.log("[ERROR]: fail to add new recommendation to databae");
        	callback(false,"Internal Server Error");
        	return;
		}
		else{
			callback(true, data);
			return;
		}
	});
}

RecommendationManager.prototype.getRecommendationList = function(sender, callback){
	Recommendation.find({sender:sender}, function(err, recommendations){
		if(err) {
			callback(false, "Internal Server Error");
			return;
		} else {
			callback(true, recommendations);
		}
	});
}

RecommendationManager.prototype.getOneRecommendation = function(recommendationId, callback){
	Recommendation.findOne({_id:recommendationId}, function(err, recommendation){
		if(err) {
			callback(false, "Internal Server Error");
			return;
		} else {
			callback(true, recommendation);
		}
	});
}

RecommendationManager.prototype.updateRecommendation = function(recommendation, products, callback){
	//console.log(recommendation._id, products[0].name);
	var productID = [];
	for (var product in products){
		productID.push(products[product].ID);
	}
	Recommendation.update(
		{_id:recommendation._id}, 
		{$set: {productName:products[0].name, productID:productID}},
		function(err, results){
			if(!err){
				callback(true);
			}
		}
	);
}

//export the module as a library
module.exports = RecommendationManager;
