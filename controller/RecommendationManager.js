var debug = require('debug')('FeedbackManager.js');
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var xssFilters = require('xss-filters');

var RecommendationSchema, Recommendation;

/*
* constructor that create the FeedbackManager that control the
* database
* params: the url and port that the database manager listens to
*/
function FeedbackManager(url){
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


//export the module as a library
module.exports = FeedbackManager;
