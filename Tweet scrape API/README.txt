README:  By Dylan Carter 998996038 c4carter

We weren't actually given a file name for the JSON file, so I'm assuming it is going to be called "favs.JSON" (just as the testing one was).

a3 is the name of the node.js server script.

The page is accessed at 127.0.0.1:3000 (of course) and all the API funcitons are called just by clicking the buttons on the page.  The data retrieved from the  server will then be placed right on the page.  Alternatively, the requests could be entered statically with the URLs:
	127.0.0.1:3000//api/tweets
	127.0.0.1:3000//api/users
	127.0.0.1:3000//api/links
	127.0.0.1:3000//api/tweetdetail?tweetID=<TWEET ID HERE>
	127.0.0.1:3000//api/userdetail?userID=<user ID HERE>
	127.0.0.1:3000//api/special
Doing this just gives you the static page.
