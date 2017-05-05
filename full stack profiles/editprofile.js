$(document).ready(function() {
	var userName = sessionStorage.getItem('userName');
	//Need to populate the page with data based on the user's information. Have to request that info from the server
	$.get("api/userdetails", {user : userName}, function(result){
		$("#profilePic").attr("src", result.image);
		$("#userPic").attr("src", result.image);
		$("#email").append(result.email);
		$("#nameInput").attr("value", result.displayName);
		$("#descriptionInput").attr("value", result.description);
		$("#picInput").attr("value", result.image);
		if (result.displayName){
			$("h4").append(result.displayName);
		} else {
			$("h4").append(result.email);
		}
	});
	//Updating display name and description
	$("#updateFormButton").click(function() {
		http://stackoverflow.com/questions/6627936/jquery-post-with-serialize-and-extra-data for method of sending form and data
		var data = $('#updateForm').serializeArray();
		data.push({name: 'userName', value: userName});
		$.post("api/updateuserinfo", data, function (ret, status) {
			if (status == "error"){
				alert(ret);
			} else {
				$("#nameInput").attr("value", ret[0]);
				$("#descriptionInput").attr("value", ret[1]);
			}
		});
	});
	//Updating display picture
	$("#updateImageButton").click(function(){
		var data = $('#updateImageForm').serializeArray();
		data.push({name: 'userName', value: userName});
		$.post("api/updateuserpic", data, function (ret, status) {
			if (status == "error") {
				alert(ret);
			} else {
				$("#picInput").attr("value", ret);
				$("#userPic").attr("src", ret);
				$("#profilePic").attr("src", ret);
			}
		});
	});
	//updating password
	$("#updatePasswordButton").click(function() {
		var data = $('#changePassword').serializeArray();
		data.push({name: 'userName', value: userName});
		$.post("api/updatepassword", data, function (ret, status) {
			if (status == "error"){
				alert(ret);
			} else if (ret) {
				alert(ret);
			} else {
				alert("Password changed successfully");
			}
		});
	});
	$("#home").click(function() {
		window.location.assign("http://localhost:3000/main.html");
	});
});