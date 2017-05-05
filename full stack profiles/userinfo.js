$(document).ready(function() {
	var userName = sessionStorage.getItem('userName');
	var inspectedUser = sessionStorage.getItem('inspectedUser');
	//Need to populate the page with data based on the user's information. Have to request that info from the server
	$.get("api/userdetails", {user : userName}, function(result){
		$("#profilePic").attr("src", result.image);
		if (result.displayName){
			$("h4").append(result.displayName);
		} else {
			$("h4").append(result.email);
		}
		//Add the admin powers to the page
		if (result.type == "admin" || result.type == "super") {
			$("#bodyContent").append("<button id=\"deleteUserButton\" type=\"button\">Delete User</button>");
			$("#deleteUserButton").click(function() {
				$.post("api/deleteuser", {"userName" : inspectedUser}, function (ret, status) {
					if (status == "error"){
						alert(ret);
					} else {
						alert("User deleted.");
					}
				});
			});
			if (result.type == "super") {
				$("#bodyContent").append("<button id=\"promoteUserButton\" type=\"button\">Make Admin</button>");
				$("#promoteUserButton").click(function() {
					$.post("api/promoteuser", {"userName" : inspectedUser}, function (ret, status) {
						if (status == "error"){
							alert(ret);
						} else {
							alert("User promoted to admin.");
						}
					});
				});
				$("#bodyContent").append("<button id=\"demoteUserButton\" type=\"button\">Demote Admin</button>");
				$("#demoteUserButton").click(function() {
					$.post("api/demoteuser", {"userName" : inspectedUser}, function (ret, status) {
						if (status == "error"){
							alert(ret);
						} else {
							alert("User demoted to regular user.");
						}
					});
				});
			}
		}
	});
	$.get("api/userdetails", {user : inspectedUser}, function(result) {
		$("#userPic").attr("src", result.image);
		$("#userEmail").append(result.email);
		$("#displayName").append(result.displayName);
		$("#userDescription").append(result.description);
	});
	$("#userBar").click(function() {
		window.location.assign("http://localhost:3000/editprofile.html");
	});
	$("#home").click(function() {
		window.location.assign("http://localhost:3000/main.html");
	});
});