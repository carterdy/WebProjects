http = require('http');
fs = require('fs');
path = require('path');
url = require("url");
querystring = require("querystring");

PORT = 3000;
TEST_FILE = "favs.json";

STATIC_PREFIX = '/static/';

MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.txt': 'text/plain'
};

var tweets;

/*Extract and format the important info from the given tweet.  The tweet is represented as a JSON object.
*Keep: Date, ID, text, username
*/
function getTweetInfo(tweet){

	return "{\n" + "\t\"created_at\": " + tweet.created_at + ",\n" + "\t\"id_str\": " + tweet.id_str + ",\n" + "\t\"text\": " + tweet.text + ",\n" + "\t\"user\": " + "{" + "\n" + "\t\t\"screen_name\": " +  tweet.user.screen_name + ",\n" + "\t},\n" + "}\n";
}

/*  Find and return the tweet with the given ID. Return -1 if such a tweet does not exist
*/
function findTweet (tweetId) {
  for (var i = 0; i < tweets.length; i++){
    if (tweets[i].id == tweetId){
      return tweets[i];
    }
  }
  return -1;
}

/*  Extract and format the important info from the given user.  The user is represented as a JSON object.
*  Keep: Id, name, screen name, location, description, url, followers
*/
function getUserInfo (user) {
  return "{\n" + "\t\"id\": " + user.id + ",\n" + "\t\"name\": " + user.name + ",\n" + "\t\"screen_name\": " + user.screen_name + ",\n" + "\t\"location\": " +  user.location + ",\n" + "\t\"description\": " + user.description  + ",\n" + "\t\"url\": " + user.url + ",\n" + "\t\"followers_count\": " + user.followers_count + "\n}\n";
}

/*  Find and return the user with the given ID. Return -1 if the user is not found
*/
function findUser (userId) {
  for (var i = 0; i < tweets.length; i++){
    if (tweets[i].user.id == userId){
      return tweets[i].user;
    }
  }
  return -1;
}

/*Given a tweet, return the string of the user's name
*/
function getUser(tweet){
  return tweet.user.name;
}

/*  Return the user with the most followers in JSON format
*/
function getMostPopularUser(){
  var mostPopular = -1;
  for (var i = 0; i < tweets.length; i++){
    if (mostPopular == -1 || tweets[i].user.followers_count > mostPopular.followers_count){
      mostPopular = tweets[i].user;
    }
  }
  return mostPopular;
}

/*  Given a tweet, extract and return the external links it contains
*/
function getLinks (tweet) {
  if (tweet.entities.media){
    return tweet.entities.urls[0].url + " " + tweet.entities.media[0].media_url + "\n"
  } else {
    return tweet.entities.urls[0].url + "\n";
  }
}

http.createServer(function(request, response) {
	var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);
  console.log('Request: ' + request.url);


  if (request.url == "/"){
  	//Serve the HTML page and read the JSON file
    if (fs.statSync(filename).isDirectory()) filename += '/index.html';
 
    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write("Error reading index.html " + err + "\n");
        response.end();
        return;
      }
 
      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });

    //Took a look at this for easy way to load JSON file http://stackoverflow.com/questions/10011011/using-node-js-how-do-i-read-a-json-object-into-server-memory
    fs.readFile(TEST_FILE, "utf8", function(err, data) {
    	if(err) {
    		reponse.writeHead(500, {"Content-Type": "text/plain"});
    		response.write(err, + "\n");
    		response.end();
    		return;
    	}
    	tweets = JSON.parse(data);

    });

  } else if (request.url == "/jquery-2.1.4.js"){
    //Serve the jquery script
    filename = path.join(process.cwd(), uri);
    if (fs.statSync(filename).isDirectory()) filename += '/jquery-2.1.4.js';
 
    fs.readFile(filename, function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write("Error reading Jquery " + err + "\n");
        response.end();
        return;
      }
 
      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  } else if (request.url == "/client.js"){
        filename = path.join(process.cwd(), uri);
    if (fs.statSync(filename).isDirectory()) filename += '/client.js';
 
    fs.readFile(filename, function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write("Error reading client.js " + err + "\n");
        response.end();
        return;
      }
 
      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  } else if (request.url == "/api/tweets"){
  	//URL for retrieving tweets
    	//Need to go through each tweet and extract the information we want from each one
      response.writeHead(200);
    	for (var i = 0; i < tweets.length; i++){
    		response.write(getTweetInfo(tweets[i]), "utf8");
    	}
      response.end();

  } else if (request.url == "/api/users"){
  	//URL for listing all known Twitter users
    response.writeHead(200);
    var users = [];
    var currentUser = "";
    for (var i = 0; i < tweets.length; i++){
      currentUser = getUser(tweets[i]);
      //Checking to make sure the user hasn't been listed yet
      if (users.indexOf(currentUser) == -1){
        users.push(currentUser);
        response.write(currentUser + "\n");
      }
    }
    response.end();
  } else if (request.url == "/api/links"){
  	//URL for listing all links in tweets
    response.writeHead(200);
    for (var i = 0; i < tweets.length; i++){
      response.write(getLinks(tweets[i]));
    }
    response.end();
  } else if (url.parse(request.url).pathname == "/api/tweetdetail"){
  	//URL for getting details about a tweet. Have to separate out the query
    response.writeHead(200);
    var tweetId = url.parse(request.url, true).query.tweetID;
    var tweet = findTweet(tweetId);
    if (tweet != -1){
      response.write(getTweetInfo(tweet));
    } else {
      response.write("Tweet not found! " + tweetId);
    }  
    response.end();

  } else if (url.parse(request.url).pathname == "/api/userdetail"){
  	//URL for getting details about a user
    response.writeHead(200);
    var userId = url.parse(request.url, true).query.userID;
    var user = findUser(userId);
    if (user != -1){
      response.write(getUserInfo(user));
    } else {
      response.write("User not found! " + userId);
    }
    response.end();
  } else if (request.url == "/api/special"){
  	//URL for extra task.  Return the user with the most followers
    response.writeHead(200);
    var user = getMostPopularUser();
    if (user == -1){
      response.write("There are no users!");
    } else {
      response.write(getUserInfo(user));
    }
    response.end();
  } else {
  	//Throw 404
  	response.writeHead(404, {"Content-Type": "text/plain"});
  	response.write("Feels bad man. " + url.parse(request.url).pathname + "\n");
  	response.end();
  	return;
  }

}).listen(PORT);

console.log('Server running at http://127.0.0.1:' + PORT + '/');