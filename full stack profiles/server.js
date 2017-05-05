mongoose = require("mongoose");
express = require("express");
router = express.Router();
app = express();
qs = require("querystring");
url = require("url");

//Get the CWD to use as static directory
var staticDir = __dirname;
app.use(express.static(staticDir));
//app.use(express.json());
mongoose.connect("mongodb://localhost/a4");

var db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error"));
db.once('open', function (callback) {
	console.log("Successful connection to Mongodb");
});

var userSchema = mongoose.Schema({
	email: String,
	password: String,
	description: String,
	image: String,
	displayName: String,
	type: String
});

var User = mongoose.model("User", userSchema);

//Serve up the pages
app.get("/", function(req, res) {
	res.status(200).sendFile(__dirname + "/" + "index.html");
});
app.get("/login.css", function(req, res) {
	res.status(200).sendFile(__dirname + "/" + "login.css");
});
app.get("/main.html", function(req, res) {
	res.status(200).sendFile(__dirname + "/" + "main.html");
});
app.get("/main.css", function(req, res) {
	res.status(200).sendFile(__dirname + "/" + "main.css");
});
app.get("/userinfo.html", function(req, res) {
	res.status(200).sendFile(__dirname + "/" + "userinfo.html");
});
app.get("/editprofile.html", function(req, res) {
	res.status(200).sendFile(__dirname + "/" + "editprofile.html");
});
//Serve up the client side JS and jquery
app.get("/jquery-2.1.4.js", function(req, res) {
	res.status(200).sendFile(__dirname + "/" + "jquery-2.1.4.js");
});
app.get("/client.js", function(req, res) {
	res.status(200).sendFile(__dirname + "/" + "client.js");
});
app.get("/main.js", function(req, res) {
	res.status(200).sendFile(__dirname + "/" + "main.js");
});
app.get("/userinfo.js", function(req, res) {
	res.status(200).sendFile(__dirname + "/" + "userinfo.js");
});
app.get("/editprofile.js", function(req, res) {
	res.status(200).sendFile(__dirname + "/" + "editprofile.js");
});

//User logs in
app.post("/login", function (req, res) {
	//http://stackoverflow.com/a/24877872 for method of prepping post request for querying
	var bodyStr = '';
    req.on("data",function(chunk){
        bodyStr += chunk.toString();
    });
    req.on("end",function(){
    	var postData = qs.parse(bodyStr);
		var userName = postData.username;
		var password = postData.password;
		console.log(userName);
		console.log(password);

		User.findOne({email : userName}, function (err, user) {
			if (err) {
				res.status(500).send("Something broke!");
			} else if (!user) {
				res.status(200).send("no user");
			} else if (password != user.password) {
				res.status(200).send("bad pass");
			} else {
				res.status(200).send(userName);
			}
		});
    });
});

//User creates an account
app.post("/createaccount", function (req, res) {
	//http://stackoverflow.com/a/24877872 for method of prepping post request for querying
	var bodyStr = '';
    req.on("data",function(chunk){
        bodyStr += chunk.toString();
    });
    req.on("end",function(){
    	var postData = qs.parse(bodyStr);
		var userName = postData.username;
		var password = postData.password;
		var confirmPassword = postData.confirmPassword;
		console.log(userName);
		console.log(password);

	if (password != confirmPassword) {
		res.status(200).send("Passwords do not match.");
	} else {
		User.findOne({email : userName}, function (err, user) {
			if (err) {
				res.status(500).send("Something broke!");
			} else if (user) {
				res.status(200).send("Email already exists.");
			} else {
				var newUser = new User({ email: userName, password: password, image : "default.png"});
				//See if we need a super user
				User.count({ type: 'super' }, function (err, count) {
					if (err) {
						res.status(500).send("data base error");
					} else {
						if (count == 0) {
							newUser.type = 'super';
						} else {
							newUser.type = 'user';
						}
					}
					newUser.save(function (err, newUser) {
					if (err){
						res.status(500).send("Issue saving user");
						return console.error(err);
					} else {
						res.status(200).send("Success!");
					}
				});
				});
			}
		});
	}
    });
});

/* Find the user in the database and return an object of their information (excluding password)
*/
app.get("/api/userdetails", function (req, res) {
	var bodyStr = '';
    req.on("data",function(chunk){
        bodyStr += chunk.toString();
    });
    req.on("end",function(){;
		var userName = url.parse(req.url, true).query.user;
		User.findOne({email : userName}).lean().exec(function (err, user) {
			if (err) {
				res.status(500).send("database error");
			} else {
				console.log(userName);
				user.password = "";
				res.status(200).send(user);
				console.log(user);
			}
		});
	});
});

/* Return a list of all users in the databases represented as objects.  Blank out passwords
*/
app.get("/api/allusers", function (req, res) {
	User.find().lean().exec(function (err, result) {
		console.log(result);
		res.status(200).send(result);
	});
});

/* Update the information for the given user. Send back their display name and description in a list
*/
app.post("/api/updateuserinfo", function (req, res) {
	var bodyStr = '';
    req.on("data",function(chunk){
        bodyStr += chunk.toString();
    });
    req.on("end",function(){
    	var postData = qs.parse(bodyStr);
    	console.log(postData);
    	var newDisplayName = postData.displayName;
    	var newDescription = postData.description;
    	var userName = postData.userName;

    	User.update({email : userName}, {displayName : newDisplayName, description : newDescription}, function (err, num) {
    		if (err) {
    			res.status(500).send(err);
    		} else {
    			res.status(200).send([newDisplayName, newDescription]);
    		}
    	});
	});
});

/* Change the given user's password to the new given password.  Validate the passwords first. Return nothing if successful, otherwise return the issue
*/
app.post("/api/updatepassword", function (req, res) {
	var bodyStr = '';
    req.on("data",function(chunk){
        bodyStr += chunk.toString();
    });
    req.on("end",function(){
    	var postData = qs.parse(bodyStr);
		var userName = postData.userName;
		var oldPassword = postData.oldPassword;
		var newPassword = postData.newPassword;
		var confirmPassword = postData.confirmPassword;
		//Check original password and procceed if correct
		User.findOne({email : userName}, function (err, user) {
			if (err) {
				res.status(500).send("Something broke!");
			} else if (!user) {
				res.status(200).send("no user");
			} else if (oldPassword != user.password) {
				res.status(200).send("Incorrect password.");
			} else {
				if (newPassword != confirmPassword) {
					res.status(200).send("Confirm password does not match new password.");
				} else {
					user.password = newPassword;
					user.save(function (err, user) {
						if (err) {
							res.status(500).send(err);
						}
						res.status(200).end();
					});
				}
			}
		});
	});
});

/* Update the given user's profile picture.  Return the picture uri after
*/
app.post("/api/updateuserpic", function (req, res) {
	var bodyStr = '';
    req.on("data",function(chunk){
        bodyStr += chunk.toString();
    });
    req.on("end",function(){
    	var postData = qs.parse(bodyStr);
		var userName = postData.userName;
		var picString = postData.picString;
		User.update({email : userName}, {image : picString}, function (err, num) {
			if (err) {
				res.status(500).send(err);
			} else {
				res.status(200).send(picString);
			}
		});
	});
});

/* Delete the given user from the database
*/
app.post("/api/deleteuser", function (req, res) {
	var bodyStr = '';
    req.on("data",function(chunk){
        bodyStr += chunk.toString();
    });
    req.on("end",function(){
    	var postData = qs.parse(bodyStr);
		var userName = postData.userName;
		User.remove({email : userName}, function (err) {
			if (err) {
				res.status(500).send(err);
			} else {
				res.status(200).end();
			}
		});
	});
});

/* Promote the given user to admin level
*/
app.post("/api/promoteuser", function (req, res) {
	var bodyStr = '';
    req.on("data",function(chunk){
        bodyStr += chunk.toString();
    });
    req.on("end",function(){
    	var postData = qs.parse(bodyStr);
		var userName = postData.userName;
		User.update({email : userName}, {type : "admin"}, function (err, num) {
			if (err) {
				res.status(500).send(err);
			} else {
				res.status(200).end();
			}
		});
	});
});

/* Demote the given user to user level
*/
app.post("/api/demoteuser", function (req, res) {
	var bodyStr = '';
    req.on("data",function(chunk){
        bodyStr += chunk.toString();
    });
    req.on("end",function(){
    	var postData = qs.parse(bodyStr);
		var userName = postData.userName;
		User.update({email : userName}, {type : "user"}, function (err, num) {
			if (err) {
				res.status(500).send(err);
			} else {
				res.status(200).end();
			}
		});
	});
});

var server = app.listen(3000, function() {
	console.log("Server listening on port " + server.address().port);
});