function mechAction(name, page) {
	var req =  new XMLHttpRequest();
	req.open("POST", page, true);
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.send('mech=' + encodeURIComponent(name));
}

function addMechButton(successCallback) {
	var form = $("#newMechName");
	var name = "~" + form.val().trim().replace(/\s+/g, '~');
	if (name.length == 1) {
		form.addClass("is-invalid");
		form.siblings(".invalid-feedback")[0].innerText = "Coping mechanism can't be empty.";
	} else if (document.getElementById(name.toLowerCase()) !== null) {
		form.addClass("is-invalid");
		form.siblings(".invalid-feedback")[0].innerText = "Coping mechanism already exists.";
	} else {
        form.removeClass("is-invalid");
        form.val("");
		successCallback(name);
		mechAction(name, 'addMech.php');
	}
}

function addMechOnEnter(e, successCallback) {
	if (e.which === 13) {
		addMechButton(successCallback);
	}
}

function addMechLineHTML(name) {
	let dest = document.getElementById("mechs");
    let ele = document.createElement("div");
    let target = name.toLowerCase().replace(/~/g, '\\~');
    ele.classList.add("row");
    ele.classList.add("pb-2");
    ele.classList.add("pt-2");
    ele.classList.add("hover-grey");
    ele.classList.add("collapse");
    ele.classList.add("show");
    ele.setAttribute("id", name.toLowerCase());
    ele.innerHTML = '<span class="col"></span>' 
    + '<button type="button" onclick="removeMech(event)" '
    + 'class="btn btn-primary align-self-end mr-3" '
    + 'data-target="#' + target + '" '
    + 'data-toggle="collapse" aria-expanded="true" '
    + 'aria-controls="' + target +'">Remove</button>';
	ele.firstChild.innerText = name.replace(/~/g, ' ') + ":";
	dest.appendChild(ele);
}

function getMech(addHTMLcallback) {
	var req =  new XMLHttpRequest();
	req.addEventListener("readystatechange", function () {
		if (req.readyState === 4 && req.status === 200) {
			var names = req.responseText.split('\n');
			names.sort();
			// i = 1 bc it starts with a \n
			for (var i = 1; i < names.length; i++) {
				addHTMLcallback(names[i]);
			}
		}
	});
	req.open("GET", "getMech.php", true);
	req.send();
}

function removeMech(e) {
    let par = e.currentTarget.parentElement;
    let mech = par.firstChild.innerText.trim().replace(' ', '~');
	mechAction('~' + mech.substr(0, mech.length - 1), 'removeMech.php');
}
