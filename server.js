/*------------------------------------------------------
Declare global variables
-------------------------------------------------------*/
var debug = require('debug')('server.js');
var debug_http = require('debug')('http');
//Debug option to print
debug("Server initializing...");
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var swig  = require('swig');
var express = require('express');
var app = express();
var compression = require('compression');
var ROOT = { root: __dirname+'/public' };

/*------------------------------------------------------
Declare what does express uses
-------------------------------------------------------*/
app.use(compression());
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
//Performance cache
app.use(express.static(__dirname + '/public',{
	//maxAge: 86400000
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var salt = bcrypt.genSaltSync(10);
var secret = bcrypt.hashSync("session_secret", salt);
app.use(session({
  cookieName: 'session',
  secret: secret,
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true
}));

/*Ddos security frame work
var Ddos = require('ddos')
var ddos = new Ddos({
	maxcount: 30,
	burst: 8,
	limit: 8 * 30,
	maxexpiry: 120,
	checkinterval : 0.5,
	errormessage : '[DOS Alert] Please wait 120 seconds and try again!',
	testmode: false
});
app.use(ddos.express)*/

//Server listen on 3000
var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  debug('Server is now running at port '+ port);
});

/*------------------------------------------------------
Bascis login page interface
Login succeed
Login fail
Register
-------------------------------------------------------*/
app.use(function(req, res, next) {

	debug_http(req.method + ' ' + req.url);

	if(req.url=="/" || req.url=="/api/login/?type=google" ||req.url=="/api/login" || (req.url=="/api/users" && req.method=="POST") || req.url=="/api/logout"){
		next();
		return;
	} else {
		if (req.session && req.session.email) {
		    userManager.getUser(req.session._id, function(success, user) {
			    if (!user) {
		   			res.redirect('/api/logout');
		    		return;
		    	}
		    	// finishing processing the middleware and run the route

		    	next();
		    });
		} else {
			res.redirect('/');
			return;
		}
	}
});

/*------------------------------------------------------
Managers and databases:
-------------------------------------------------------*/
var MONGODB_URL = 'mongodb://localhost/';
//var MONGODB_URL = 'mongodb://carpool309:muchbetterthanuber@ds055564.mongolab.com:55564/heroku_7wrc6q07';

//User databse
var UserManager = require('./controller/UserManager.js');
var userManager = new UserManager(MONGODB_URL);

//Product databse
var RecommendationManager = require('./controller/RecommendationManager.js');
var recommendationManager = new RecommendationManager(MONGODB_URL);

//Remommendation databse
var ProductManager =  require('./controller/ProductManager.js');
var productManager = new ProductManager(MONGODB_URL);


/*------------------------------------------------------
the start page allows to login/register
-------------------------------------------------------*/
app.all('/', function(req, res){
	if(req.session._id || req.session._id == 0){
		res.redirect('/users');
	} else {
		res.render('../public/getStarted.html');
	}
});

/********************** User Account *************************/
/*------------------------------------------------------
if following get request
Get the user id
Then render the correspsongind profile.html
-------------------------------------------------------*/
app.get('/users/:id', function(req, res){
	//var page = "/users/" + req.params.id;
	var user = {
		_id: req.session._id
	}
	//userManager.logPage(user,page);
	userManager.getUser(req.session._id,function(success,profile){
		if(!success){
			res.redirect('/users');
			return;
		}

		userManager.getUser(req.params.id, function(success,user){

			if(!success){
				res.redirect('/users');
				return;
			}

			res.render('profile.html', {
   				profile: profile, user: user, mostVisitedPage: "***disabled***"
			});
		})
	});
});

/*------------------------------------------------------
Get all user profiles in the database
And pass into the render function for userList.html
-------------------------------------------------------*/
app.get('/users', function(req, res){
	userManager.getUser(req.session._id,function(success, profile){
		userManager.getUserList(function(users){
			res.render('userList.html', {
   				profile: profile, users: users
   			});
		})
	});
	var user = {
		_id: req.session._id
	}
	var page = "/users";
	//userManager.logPage(user,page);

});

/*------------------------------------------------------
Admin page get request
Get all data from all database and render the html
-------------------------------------------------------*/
app.get('/admin', function(req,res){
	userManager.getUser(req.session._id,function(success, profile){
		if(profile.userType>=1){
			userManager.getUserList(function(users){
				res.render('admin.html', {
	   				profile: profile, users: users, numOnlineUsers: msgManager.getNumOnlineUsers()
				});
			});
		} else {
			res.redirect('/users');
		}
	});
});


/*------------------------------------------------------
Delete a speccific user by get the user's id through the request
-------------------------------------------------------*/
app.delete('/api/users/:id', function(req, res){
	var user_id = req.session._id;
	var profile_id = req.params.id;
	userManager.deleteUser({_id: user_id},{_id: profile_id},function(success, msg){
		if(success){
			res.send("OK");
		} 
		else {
			res.writeHead(400,msg);
			res.end(msg);
		}
	});
});

/*------------------------------------------------------
get the login data and check with the databse 
if log in succeed go to certain page
if not, report error message
-------------------------------------------------------*/
app.post('/api/login', function(req, res) {
	if(req.query.type=="google"){
		debug("GOOGLE LOGIN!")
		var profile = JSON.parse(req.body.json);
		userManager.loginGoogle(profile, function(success,user){
			if(success && user){
				debug("User found and login")
				req.session._id = user._id;
				req.session.email = user.email;
				req.session.displayName = user.displayName;
				res.end(JSON.stringify({isLogin: true}));
			} else if(success && !user){
				debug("User NOT found, create user")
				userManager.createUserGoogle(profile, function(success,user){
					if(success && user){
						req.session._id = user._id;
						req.session.email = user.email;
						req.session.displayName = user.displayName;
						res.end(JSON.stringify({isLogin: true}));
					}
				})
			} else {
				res.writeHead(400,user);
				res.end(user);
			}
		})
	} else {
		var profile = JSON.parse(req.body.json);
		userManager.login(profile, function(success,user){
			if(success){
				req.session._id = user._id;
				req.session.email = user.email;
				req.session.displayName = user.displayName;
				res.end("OK");
				debug("Login success!")
			} else {
				res.writeHead(400,user);
				res.end(user);
			}
		})
	}
});


/*------------------------------------------------------
Logout the user
by reseting the session and redirect to the home page
-------------------------------------------------------*/
app.get('/api/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});

app.post('/api/users', function (req, res){
	var profile = JSON.parse(req.body.json);
	if(req.query.type=="google"){
		debug("Create user by Google");

		userManager.createUserGoogle(profile, function(success,msg){
			if(success){
				res.send('OK');
				return;
			} else {
				res.writeHead(400,msg);
				res.end(msg);
				return;
			}
		})

	} else {
		debug("receiving profile: "+profile.email);

		userManager.createUser(profile, function(success,msg){
			if(success){
				res.send('OK');
				return;
			} else {
				res.writeHead(400,msg);
				res.end(msg);
				return;
			}
		});
	}

});

/*------------------------------------------------------
Get the data from the user
And then update the user profile:
name, email, icons
-------------------------------------------------------*/
app.patch('/api/users/:id', function (req, res){
	var profile = JSON.parse(req.body.json);
	profile['_id'] = req.params.id;
	var user = req.session;

	userManager.updateProfile(user, profile, function(success, msg){
		if(success){
			res.send('OK');
			return;
		} else {
			res.writeHead(400,msg);
			res.end(msg);
			return;
		}
	})
});

/*------------------------------------------------------
Get the verified password from user
And update the password in the database
-------------------------------------------------------*/
app.put('/api/changePassword', function (req, res){
	var profile = JSON.parse(req.body.json);
	var user = req.session;

	var loginProfile = {
		email: user.email,
		password: {plain: profile.password.old}
	}
	delete profile.password.old;

	if(user._id!=profile._id){
		res.writeHead(400,"You have no right to change other user's password!");
		res.end("You have no right to change other user's password!");
	}
	//Check for different conditions
	if(profile.password.enabled){
		userManager.login(loginProfile, function(success,msg){
			if(!success){
				res.writeHead(400,"Original password invalid");
				res.end("Original password invalid");
			} else {
				userManager.changePassword(profile, function(success, msg){
					if(!success){
						res.writeHead(400,msg);
						res.end(msg);
					} else {
						res.send('OK');
					}
				})
			}
		})
	} else {
		userManager.getUser(profile._id, function(success, p){
			if(!p.password.enabled){
				userManager.changePassword(profile, function(success, msg){
					if(!success){
						res.writeHead(400,msg);
						res.end(msg);
					} else {
						res.send('OK');
					}
				})
			} else {
				res.writeHead(400,"The user has enabled password!")
				res.send('The user has enabled password!')
			}
		})
	}
});


/*------------------------------------------------------
GET command which send all users in the database to the client
-------------------------------------------------------*/
app.get('/api/users', function(req, res){
  //console.log('getting user api');
	userManager.getUserList(function(users){
		res.send(users);
	});
});

/*------------------------------------------------------
GET command which return user who satisfy specifis search conditions
-------------------------------------------------------*/
app.get('/api/users/search', function(req, res){
	userManager.searchUser(req.query.keyword, function(success, users){
		if(success){
			res.send(users);
		} else {
			res.writeHead(400,"Internal Server Error");
			res.end("Internal Server Error");
		}
	})
});

/*------------------------------------------------------
Get the current user's data from databse and send to user
-------------------------------------------------------*/
app.get('/api/users/current', function(req,res){
	userManager.getUser(req.session._id, function(success, user){
		res.send(user);
	});
});

/*------------------------------------------------------
GET the user data accroding to user's ID
-------------------------------------------------------*/
app.get('/api/users/:id', function(req, res){
	userManager.getUser(req.params.id, function(success, user){
		res.send(user);
	});
});

/*------------------------------------------------------
Get the profile pic of the current user by knowing keyword current
-------------------------------------------------------*/
app.get('/api/users/current/profilePic', function(req, res){
	userManager.getUserPic(req.session._id, function(pic){
		res.send(pic);
	})
});

/*------------------------------------------------------
GET specific user's icon pic by user's ID
-------------------------------------------------------*/
app.get('/api/users/:id/profilePic', function(req, res){
	userManager.getUserPic(req.params.id, function(pic){
		//res.contentType('image/png');
		res.send(pic);
	})
});

/*------------------------------------------------------
Enable to trace the most visited pages log
-------------------------------------------------------*/
app.post('/api/log', function(req, res){
	var b = JSON.parse(req.body.json);

	var behavior = {
		ip_addr : req.connection.remoteAddress,
		browser: b.browser,
		os: b.os,
		mobile: b.mobile,
		screenSize: b.screenSize,
		location: b.location
	}

	var user = {
		id: req.session._id,
		behavior: behavior
	}
	userManager.log(user, function(success, msg){
		if(success){
			res.send("OK");
		} else {
			res.writeHead(400,msg);
			res.end(msg);
		}
	})
});
/********************** User Account End *************************/

/********************** Recommendation API ***********************/
/********************** Recommendation API End *******************/

/********************** Product API ******************************/
/********************** Product API End **************************/

/*-----------------------------------------------------------
Close function
------------------------------------------------------------*/
exports.close = function(){
  server.close();
}
