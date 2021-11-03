// Requiring modules
var express = require("express");
var session = require('express-session');
var MongoClient = require('mongodb').MongoClient;

// Initialising express
var app = express();

// Static files
app.use(express.static("public"));

// Serving html page
app.get("/", function(req, res) {
    res.sendFile("public/html/create_account.html", { root: __dirname });
});

app.listen(8080);
console.log('Server started at http://localhost:' + 8080);