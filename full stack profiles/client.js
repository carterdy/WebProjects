
$(document).ready(function(){
	$("#loginForm").hide();
	$("#createAccountForm").hide();
	$("#loginButton").click(function(){
		$("h1").html("Log in");
		$("#loginForm").show();
		$("#createAccountForm").hide();
	});
	$("#createAccountButton").click(function(){
		$("h1").html("Create Account");
		$("#createAccountForm").show();
		$("#loginForm").hide();
	});
	$("#loginSubmitButton").click(function(){
		$.post("login", $("#loginForm").serialize(), function (data, status) {
			if (data == "no user") {
				$("#result").html("User does not exist. ");
			} else if (data == "bad pass") {
				$("#result").html("Incorrect password. ");
			} else {
				sessionStorage.setItem('userName', data);
				window.location.assign("http://localhost:3000/main.html");
			}
		});
	});
	$("#createSubmitButton").click(function(){
		$.post("createaccount", $("#createAccountForm").serialize(), function (data, status) {
			if (status == "error") {
				alert(data);
			} else {
				$("#result").append(data);
			}
		});
	});
});