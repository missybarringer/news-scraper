var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var headlineSchema = new Schema({
    headline: {
        type: String,
        required: true,
        unique: true
    },
    url: {
        type: String,
        required: true
    },
    summary: {
        type: String
    },
    date: String,
    saved: {
        type: Boolean,
        default: false
    }
});

var Headline = mongoose.model("Headline", headlineSchema);

module.exports = Headline;
