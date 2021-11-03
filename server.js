// Requiring modules
var express = require("express");
var session = require('express-session');
var MongoClient = require('mongodb').MongoClient;

// Initialising express
var app = express();

// Initialising body parser
app.use(express.urlencoded({extended: true})); 
app.use(express.json());   

// Static files
app.use(express.static("public"));

// Serving html page
app.get("/", function(req, res) {
    res.sendFile("public/html/create_account.html", { root: __dirname });
});

// Create account routes
app.post("/createAccountSubmit", function(req, res) {

    var email = req.body.email;
    var password = req.body.passowrd;
    var name = req.body.name;
    var dateOfBirth = req.body.dateOfBirth;
    var gender = req.body.gender;
    var emergencyContact = req.body.emergencyContacts;
    var address = req.body.address;
    var photoConsent = req.body.photoConsent;

    console.log(
        "--- create account received ---" + "\n",
        "Email: " + email + "\n",
        "Password: " + password + "\n",
        "Name: " + name + "\n",
        "Date of Birth: " + dateOfBirth + "\n",
        "Gender: " + gender + "\n",
        "Emergency Contact: " + emergencyContact + "\n",
        "Address: " + address + "\n",
        "Photo Consent: " + photoConsent
    );

    res.redirect("/login");
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