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
        if (err2) { console.log("\nProfiles collection already created moving on...") };
    });

    // Creating the sessions collection
    db.createCollection("sessions", function (err3, res2) {
        // If the collection is already created
        if (err3) { console.log("Sessions collection already created, its ok I didn't want to make it anyway ;( moving on...")};
    });

    // Setting the web server to listen in on 8080
    app.listen(8080);
    console.log('Server started at http://localhost:' + 8080);
});

//Setting up ejs
app.set('view engine', 'ejs');

// Initialising body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static("public"));

// Setting up the session
app.use(session({ secret: 'agileApesSecret', resave: false, saveUninitialized: false}));

// Serving html page
app.get("/", function (req, res) {
    res.render('pages/login', {title: 'Log In'});
});

// Create account routes
app.get("/createAccount", function (req, res) {
    res.render('pages/create_account', {title: 'Create Account'});
});

app.post("/createAccountSubmit", function (req, res) {
    // Admin account email
    var adminEmail = "admin@mail.com";

    // Receiving inputs from the form
    var email = req.body.email;
    var password = req.body.password;
    var name = req.body.name;
    var dateOfBirth = req.body.dateOfBirth;
    var gender = req.body.gender;
    var emergencyContactName = req.body.emergencyContactName;
    var emergencyContactNumber = req.body.emergencyContactNumber;
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
        "Emergency Contact Name: " + emergencyContactName + "\n",
        "Emergency Contact Number: " + emergencyContactNumber + "\n",
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
            db.collection("profiles").countDocuments(function(err2, result2) {
                // Handle error
                if (err2) throw err2;

                if (result2 == 0) {
                    // Make the admin account
                    db.collection('profiles').insertOne({
                        email: email,
                        password: password,
                        name: name,
                        dateOfBirth: dateOfBirth,
                        gender: gender,
                        emergencyContactName: emergencyContactName,
                        emergencyContactNumber: emergencyContactNumber,
                        postcode: postcode,
                        photoConsent: photoConsent,
                        admin: true
                    }, function (err3, result3) {
                        // Handle error
                        if (err3) throw err3;
                    });

                } else {
                    // Make a user account
                    db.collection('profiles').insertOne({
                        email: email,
                        password: password,
                        name: name,
                        dateOfBirth: dateOfBirth,
                        gender: gender,
                        emergencyContactName: emergencyContactName,
                        emergencyContactNumber: emergencyContactNumber,
                        postcode: postcode,
                        photoConsent: photoConsent,
                        admin: false
                    }, function (err3, result3) {
                        // Handle error
                        if (err3) throw err3;
                    });
                };
            });

            console.log("Added new user to the database...")
        } else {
            console.log("Account already created...");
        };
    });

    res.redirect("/login");
});

// Login page routes
app.get("/login", function (req, res) {
    //res.sendFile("public/html/login.html", { root: __dirname });
    res.render('pages/login', {title: 'Log In'});
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
            req.session.email = email;
        } else {
            res.redirect("/login");
        };

        // Redirecting the user
        if (result.admin) {
            // User is an admin
            res.render("pages/navigation_page", {title: "Navigation Page"})

        } else {
            // User is not an admin
            db.collection("sessions").find().toArray(function (err,result){
                res.render('pages/session_participant', {title: 'View Sessions',sessions:result});
            })
        };
        
    });
});

// Lets you get user info. remove or edit this after development so that anyone cant just muck about.
app.get("/getUser",function (req,res) {
    let email = req.query.email;
    db.collection("profiles").findOne({email:email},function (err,res2) {
        if (err) throw err;
        res.send(JSON.stringify(res2));
    })
})

// Participant edit account routes
app.get("/editaccount", function (req, res) {
    // Checking if they are logged in or not
    if (!req.session.loggedin) {
        res.redirect("/login");
        return;

    } else {
        // Getting logged in users email
        let query = {email:req.session.email};

        db.collection("profiles").findOne(query,function (err,result) {
            if (err) throw err;
            
            info = {
                email:result.email,
                password:result.password,
                name: result.name,
                dateOfBirth: result.dateOfBirth,
                gender: result.gender,
                emergencyContactName: result.emergencyContactName,
                emergencyContactNumber: result.emergencyContactNumber,
                postcode: result.postcode,
                photoConsent: result.photoConsent?"checked":"",
                title: "Edit Account"
            }

            res.render("pages/edit_account",info)
        })
    }
    //res.sendFile("public/html/edit_account.html", { root: __dirname });
});

app.post("/editAccountSubmit", function(req, res) {
    
    let query = {email:req.session.email}
    newVals = {$set:{}}

    if (req.body.email != "") newVals.$set.email = req.body.email
    if (req.body.password != "") newVals.$set.password = req.body.password
    if (req.body.name != "") newVals.$set.name = req.body.name
    if (req.body.dateOfBirth != "") newVals.$set.dateOfBirth = req.body.dateOfBirth
    if (req.body.gender != "") newVals.$set.gender = req.body.gender
    if (req.body.emergencyContactName != "") newVals.$set.emergencyContactName = req.body.emergencyContactName
    if (req.body.emergencyContactNumber != "") newVals.$set.emergencyContactNumber = req.body.emergencyContactNumber
    if (req.body.postcode != "") newVals.$set.postcode = req.body.postcode
    
    db.collection("profiles").updateOne(query, newVals, function (err,res) {
        if (err) throw err;

        console.log(req.session.email + " details have been updated");
        req.session.email = req.body.email;
    })

    // Check if the user is an admin or not
    db.collection("profiles").findOne(query,function (err,result) {
        if (err) throw err;

        // Redirect the user depending on wether they are an admin or not
        if (result.admin) {
            res.redirect('/navPage');
        } else {
            res.redirect("/sessionparticipant")
        }; 
    });
});


//lets you get user info. remove or edit this after development so that anyone cant just muck about
app.get("/getUser",function (req,res) {
    let email = req.query.email;
    db.collection("profiles").findOne({email:email},function (err,res2) {
        if (err) throw err;
        res.send(JSON.stringify(res2));
    })
})

// Participant session page routes
app.get("/sessionparticipant", function (req, res) {
    db.collection("sessions").find().toArray(function (err,result){
        if(err) throw err;
        console.log(result)
        res.render('pages/session_participant', {title: 'View Sessions',sessions:result});
    })
});

app.get("/participantAttend", function(req,res){
    db.collection("sessions").update(
      { name:req.query.name}, { $push: { participants: req.session.email } }
    );

    res.redirect("/sessionparticipant");
})

// Admin session routes
app.get("/sessionadmin", function (req, res) {
    db.collection("sessions").find().toArray(function (err, result) {
        if (err) throw err;
        
        res.render("pages/session_admin", {title: "View Sessions", sessions:result});
    }); 
});

app.get("/createSession", function (req, res) {
    res.render('pages/create_session', {title: 'Create Session'});
});

app.post("/createSessionSubmit",function(req,res) {
    // Creating a one off session
    db.collection('sessions').insertOne({
        name:req.body.name,
        details:req.body.details,
        location:req.body.location,
        startTime:req.body.startTime,
        endTime:req.body.endTime,
        day:req.body.day
    },function (err,result) {
        if (err) throw err;
        res.render("pages/session_admin", {title: "View Sessions", sessions:result});
    });
});

app.get("/editSessionAdmin", function(req, res) {
    db.collection("sessions").findOne({name:req.query.name}, function(err, result) {
        if (err) throw err;
        console.log(result)
        res.render("pages/edit_session", {title: "Edit Session", oldNameSession: req.query.name, session:result})
    });
});

app.post("/editSessionAdminSubmit", function(req, res) {
    query = {name:req.body.oldName}
    newVals = {$set:{
        name:req.body.name,
        details:req.body.details,
        location:req.body.location,
        startTime:req.body.startTime,
        endTime:req.body.endTime,
        day:req.body.day
    }}
    console.log(query);
    db.collection("sessions").updateOne(query,newVals,function (err,result) {
        if (err) throw err;
        console.log("admin updated user details")
    })
    res.redirect("/navpage");
});

// Routes for admin editting profiles accounts
app.get("/viewprofiles", function (req, res) {
    db.collection("profiles").find().toArray(function (err,result) {
        if (err) throw err;
        //console.log(result)
        res.render('pages/view_profiles', {title: 'View Profiles',profiles:result});
    });
});

app.get("/editAccountAdmin",function (req,res) {
    if (!req.session.loggedin) {
        res.redirect("/");
        return;
    }
    db.collection("profiles").findOne({email:req.session.email},function(err,result) {
        if (err) throw err;
        if (!result.admin) {
            res.redirect("/");
            return;
        }
        db.collection("profiles").findOne({email:req.query.email}, function (err,result) {
            if (result) {
                result.title = "Edit Account"
                res.render("pages/edit_account_admin.ejs",result);
            } else {
                res.redirect("/");
            }
        })
    })
})

app.post("/editAccountAdminSubmit", function (req,res) {
    query = {email:req.body.oldEmail}
    //console.log(req)
    newVals = {$set:{
        email:req.body.email,
        password:req.body.password,
        name:req.body.name,
        dateOfBirth:req.body.dateOfBirth,
        gender:req.body.gender,
        emergencyContactName:req.body.emergencyContactName,
        emergencyContactNumber:req.body.emergencyContactNumber,
        postcode:req.body.postcode,
        photoConsent: req.body.photoConsent
    }}
    db.collection("profiles").updateOne(query,newVals,function (err,result) {
        if (err) throw err;
        console.log("admin updated user details")
    })
    res.redirect("/navpage");
})

// Logout route
app.get("/logout", function(req, res) {
    req.session.loggedin = false;
    res.redirect("/login");
});

// Nav page route
app.get("/navPage", function (req, res) {
    res.render('pages/navigation_page', {title: 'Admin Navigation'});
});