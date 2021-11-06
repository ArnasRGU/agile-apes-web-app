// Requiring modules
var express = require("express");
var session = require('express-session');
var MongoClient = require('mongodb').MongoClient;

// Initialising express
var app = express();

// Initialising mongodb and connecting
var mongoUrl = 'mongodb://localhost:27017/'; // Database is called agile-apes
var db;

MongoClient.connect(mongoUrl, function (err, database) {
    if (err) throw err;

    //db = database;
    db = database.db("agileApes");

    //Creating the profiles collection
    db.createCollection("profiles", function (err2, res) {
        // If the collection is already created
        if (err2) { console.log("\n-- Profiles collection already created --") };
    });

    // Setting the web server to listen in on 8080
    app.listen(8080);
    console.log('Server started at http://localhost:' + 8080);
});


// Initialising body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static("public"));

// Setting up the session
app.use(session({ secret: 'agileApesSecret', resave: false, saveUninitialized: false}));

// Serving html page
app.get("/", function (req, res) {
    res.sendFile("public/html/login.html", { root: __dirname });
});

// Create account routes
app.get("/createAccount", function (req, res) {
    res.sendFile("public/html/create_account.html", { root: __dirname })
});

app.post("/createAccountSubmit", function (req, res) {
    // Receiving inputs from the form
    var email = req.body.email;
    var password = req.body.password;
    var name = req.body.name;
    var dateOfBirth = req.body.dateOfBirth;
    var gender = req.body.gender;
    var emergencyContact = req.body.emergencyContacts;
    var postcode = req.body.postcode;
    var photoConsent = req.body.photoConsent;

    // Handling photo concent
    if (photoConsent == "on") {
        photoConsent = true;
    } else if (photoConsent == undefined) {
        photoConsent = false;
    };

    console.log(
        "--- create account received ---" + "\n",
        "Email: " + email + "\n",
        "Password: " + password + "\n",
        "Name: " + name + "\n",
        "Date of Birth: " + dateOfBirth + "\n",
        "Gender: " + gender + "\n",
        "Emergency Contact: " + emergencyContact + "\n",
        "Postcode: " + postcode + "\n",
        "Photo Consent: " + photoConsent
    );

    // Adding the account to the database
    db.collection('profiles').findOne({ email: email }, function (err, result) {
        // Handle error
        if (err) throw err;

        // Checking if the profile exists already
        if (!result) {
            // Adding the account to the database
            db.collection('profiles').insertOne({
                email: email,
                password: password,
                name: name,
                dateOfBirth: dateOfBirth,
                gender: gender,
                emergencyContact: emergencyContact,
                postcode: postcode,
                photoConsent: photoConsent
            }, function (err2, result2) {
                // Handle error
                if (err2) throw err2;
            });

            console.log("-- Added new user to the database --")
        } else {
            console.log("-- Account already created! --");
        };
    });

    res.redirect("/createAccount");
});

// Login page routes
app.get("/login", function (req, res) {
    res.sendFile("public/html/login.html", { root: __dirname });
});

app.post("/loginSubmit", function (req, res) {

    // Receiving inputs from the form
    var email = req.body.email;
    var password = req.body.password;

    db.collection("profiles").findOne({ email: email }, function (err, result) {
        // Handle error
        if (err) throw err;

        // If a profile isn't found
        if (!result) {
            res.redirect("/login");
            return;
        };

        // Check the password
        if (result.password == password) {
            req.session.loggedin = true;
            req.session.username = email;

            res.redirect("/participantSession");
        } else {
            res.redirect("/login");
        };
    });
});

// Participant session page route
app.get("/participantSession", function (req, res) {
    res.sendFile("public/html/session_page.html", { root: __dirname });
});

// Logout route
app.post("/logout", function(req, res) {
    req.session.loggedin = false;
    res.redirect("/login");
});

app.get("/createsession", function (req, res) {
    res.sendFile("public/html/create_session.html", { root: __dirname });
});

app.get("/editaccount", function (req, res) {
    res.sendFile("public/html/edit_account.html", { root: __dirname });
});

app.get("/editsession", function (req, res) {
    res.sendFile("public/html/edit_session.html", { root: __dirname });
});

app.get("/navpage", function (req, res) {
    res.sendFile("public/html/navigation_page.html", { root: __dirname });
});

app.get("/sessionadmin", function (req, res) {
    res.sendFile("public/html/session_admin.html", { root: __dirname });
});

app.get("/viewprofiles", function (req, res) {
    res.sendFile("public/html/view_profiles.html", { root: __dirname });
});