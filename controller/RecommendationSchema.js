var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');

RecommendationSchema = mongoose.Schema({
	sender: {type: Number, ref: 'User'},
	receiver: String,
	receiverTags: [String],
	product: {type: Number, ref: 'Product'},
	rating: Number,
	date: String
});

RecommendationSchema.plugin(autoIncrement.plugin, 'Recommendation');
module.exports.RecommendationSchema = RecommendationSchema;
