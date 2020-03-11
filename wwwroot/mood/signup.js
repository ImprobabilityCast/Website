function checkPasswordsMatch() {
	if (document.getElementById("pass1").value
			=== document.getElementById("pass2").value) {
		document.getElementById("pass2feedback").style.display = "none";
	} else {
		document.getElementById("pass2feedback").style.display = "block";
	}
}

function isValidEmail(email) {
	return email.length > 0;
}

function canSubmit() {
	document.getElementById("btn-submit").disabled
		= (document.getElementById("pass1").value
				!== document.getElementById("pass2").value)
			|| document.getElementById("pass1").value.length === 0
			|| !isValidEmail(document.getElementById("email").value);
}
