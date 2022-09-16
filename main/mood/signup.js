(function () {
	var uname = document.getElementById("uname");
	var timeoutID = -1;

	document.getElementById('signup-form').addEventListener('input',
		canSubmit
	);
	document.getElementById('show-pwd').addEventListener('input',
		togglePassword
	);

	uname.addEventListener('input',
		isValidUsername
	);

	function togglePassword(event) {
		if (event.currentTarget.checked) {
			document.getElementById("pass1").type = 'text';
		} else {
			document.getElementById("pass1").type = 'password';
		}
	}

	function isValidPassword(pwd) {
		var result = true;
		var msg = document.createElement('span');
		var list = document.createElement('ul');
		var display = document.getElementById('pwd-needs');
		const pwdLen = 10;
		msg.innerText = 'Good password!';

		if (null === pwd.match(/([a-z]+.*[A-Z]+)|([A-Z]+.*[a-z]+)/)) {
			let li = document.createElement('li');
			li.innerText = 'Both upper and lowercase letters';
			list.appendChild(li);
		}
		if (null === pwd.match(/[0-9]+/)) {
			let li = document.createElement('li');
			li.innerText = 'At least one number';
			list.appendChild(li);
		}
		if (null === pwd.match(/[~`\!@#\$%\^&\*\(\)_\+\{\}\|"<>\?\-\=\[\];\',\.]+/)) {
			let li = document.createElement('li');
			li.innerText = 'At least one symbol: `~!@#$%^&*()_+{}|:"<>?-=[]\\;\',./';
			list.appendChild(li);
		}
		if (pwd.length < pwdLen) {
			let li = document.createElement('li');
			li.innerText = 'At least ' + pwdLen
					+ ' characters in length';
			list.appendChild(li);
		}
		if (list.childElementCount > 0) {
			msg.innerText = 'Password needs:';
			result = false;
		}
		display.innerHTML = "";
		display.appendChild(msg);
		display.appendChild(list);
		return result;
	}
	
	function isValidUsername() {
		clearTimeout(timeoutID);
		timeoutID = setTimeout(function () {
			var req = new XMLHttpRequest();
			req.onreadystatechange = function () {
				if (this.readyState == 4 && this.status == 200) {
					if (this.responseText === '1') {
						uname.classList.add('is-invalid');
					} else {
						uname.classList.remove('is-invalid');
					}
					canSubmit();
				}
			};
			req.open('GET', 'userExists.php?uname='
					+ encodeURIComponent(uname.value), true);
			req.send();
		}, 3500);
	}

	function canSubmit() {
		document.getElementById("btn-submit").disabled
			= !isValidPassword(document.getElementById("pass1").value)
				|| uname.classList.contains('is-invalid')
				|| (document.getElementById("sec-q-1").value
					=== document.getElementById("sec-q-2").value)
				|| document.getElementById("sec-q-1-a").value.length < 3
				|| document.getElementById("sec-q-2-a").value.length < 3;
	}

	window.addEventListener('load', function () {
		setTimeout(isValidUsername, 500);
	});

})();
