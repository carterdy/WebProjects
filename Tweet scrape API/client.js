

$(document).ready(function(){
	$("#getTweetsButton").click(function(){
		$.ajax({url: "api/tweets", success: function(result){
			$("#getTweets").append("<pre>" + result + "</pre>");
		}});
	});

	$("#getUsersButton").click(function(){
		$.ajax({url: "api/users", success: function(result){
			$("#getUsers").append("<pre>" + result + "</pre>");
		}});
	});

	$("#getLinksButton").click(function(){
		$.ajax({url: "api/links", success: function(result){
			$("#getLinks").append("<pre>" + result + "</pre>");
		}});
	});

	$("#getTweetDetailButton").click(function(){
		$.get("/api/tweetdetail", ($("#tweetDetailForm").serialize()), function(result){
			$("#getTweetDetail").append("<pre>" + result + "</pre>");
		});
	});

	$("#getUserDetailButton").click(function(){
		$.get("/api/userdetail", ($("#userDetailForm").serialize()), function(result){
			$("#getUserDetail").append("<pre>" + result + "</pre>");
		});
	});

	$("#mostFollowersButton").click(function(){
		$.ajax({url: "api/special", success: function(result){
			$("#mostFollowers").append("<pre>" + result + "</pre>");
		}});
	});
});