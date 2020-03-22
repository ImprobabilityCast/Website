function checkPasswordsMatch() {
	if (document.getElementById("pass1").value
			=== document.getElementById("pass2").value) {
		document.getElementById("pass2feedback").style.display = "none";
	} else {
		document.getElementById("pass2feedback").style.display = "block";
	}
}

function isValidEmail(email) {	
	// email regex
	// https://stackoverflow.com/a/8829363/8335309
	// https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
	var email_regex = /^[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	return null !== email.match(email_regex);
}

function isValidPassword(pwd) {
	return pwd.length >= 16
		&& null !== pwd.match(/[a-z]+/i)
		&& null !== pwd.match(/[0-9]+/)
		&& null !== pwd.match(/[~`\!@#\$%\^&\*\(\)_\+\{\}\|"<>\?\-\=\[\];\',\.]+/);
}

function canSubmit() {
	document.getElementById("btn-submit").disabled
		= (document.getElementById("pass1").value
				!== document.getElementById("pass2").value)
			|| !isValidPassword(document.getElementById("pass1").value)
			|| !isValidEmail(document.getElementById("email").value);
}
