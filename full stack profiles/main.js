$(document).ready(function() {
	var userName = sessionStorage.getItem('userName');
	//Need to populate the page with data based on the user's information. Have to request that info from the server
	$.get("api/userdetails", {user : userName}, function(result){
		$("#profilePic").attr("src", result.image);
		if (result.displayName){
			$("h1").html("Welcome " + result.displayName);
			$("h4").append(result.displayName);
		} else {
			$("h1").html("Welcome " + result.email);
			$("h4").append(result.email);
		}
	});
	$.get("api/allusers", function(result) {
		for (var i = 0; i < result.length; i++) {
			$("#userTable").append("<tr><td class=\"email\">" + result[i].email + "</td><td>" + result[i].displayName + "</td></tr>");
		}
		$(".email").click(function(){
			var tarEmail = $(this).html();
			sessionStorage.setItem('inspectedUser', tarEmail);
			window.location.assign("http://localhost:3000/userinfo.html");
		});
	});
	$("#userBar").click(function() {
		window.location.assign("http://localhost:3000/editprofile.html");
	});
	$("#home").click(function() {
		window.location.assign("http://localhost:3000/main.html");
	});
});