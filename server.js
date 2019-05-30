// require dependencies
var express = require("express");
var mongoose = require("mongoose");
var expressHandlebars = require("express-handlebars");
var bodyParser = require("body-parser");

// set up our port to be either the host's or our local port 3000
var PORT = process.env.PORT || 3001;

// instantiate our express app
var app = express();

// set up an express router
var router = express.Router();

// require our routes file pass our router object
require("./config/routes")(router);

// designate public folder as a static directory
app.use(express.static(__dirname + '/public'));

// connect handlebars to our express app
app.engine("handlebars", expressHandlebars({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");

// use bodyparser in our app
app.use(bodyParser.urlencoded({
    extended: false
}));

// have every request go through our router middleware
app.use(router);
// If deployed, use deployed db else use local mongoHeadlines db
var db = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Connect mongoose to out database
mongoose.connect(db, function(error) {
    //Log any errors connecting with mongoose
    if (error) {
        console.log(error);
    }
    // or log a success message
    else {
        console.log("mongoose connection is successful");
    }
});

// listen on the port
app.listen(PORT, function() {
    console.log("Listening on port: " + PORT);
});