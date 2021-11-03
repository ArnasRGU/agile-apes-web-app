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

app.get("/createsession", function(req, res) {
    res.sendFile("public/html/create_session.html", { root: __dirname });
});

app.get("/editaccount", function(req, res) {
    res.sendFile("public/html/edit_account.html", { root: __dirname });
});

app.get("/editsession", function(req, res) {
    res.sendFile("public/html/edit_session.html", { root: __dirname });
});

app.get("/login", function(req, res) {
    res.sendFile("public/html/login.html", { root: __dirname });
});

app.get("/navpage", function(req, res) {
    res.sendFile("public/html/navigation_page.html", { root: __dirname });
});

app.get("/sessionadmin", function(req, res) {
    res.sendFile("public/html/session_admin.html", { root: __dirname });
});

app.get("/sessionpages", function(req, res) {
    res.sendFile("public/html/session_pages.html", { root: __dirname });
});

app.get("/viewprofiles", function(req, res) {
    res.sendFile("public/html/view_profiles.html", { root: __dirname });
});

app.listen(8080);
console.log('Server started at http://localhost:' + 8080);