
function addMech(name) {
	var cope = document.getElementById("coping");
	var ele = document.createElement("div");
	ele.classList.add("form-group");
	ele.classList.add("form-row");
	ele.innerHTML = '<label class="col-sm-4 col-form-label" for="'
	+ name + '"></label>'
	+ '<div class="col">'
	+   '<div id="' + name + '" class="btn-group btn-group-toggle" data-toggle="buttons">'
	+	  '<label class="btn btn-outline-primary">'
	+		'<input type="radio" value="helpful" name="' + name + '">Helpful</input></label>'
	+	  '<label class="btn btn-outline-primary">'
	+		'<input type="radio" value="not-helpful" name="' + name + '">Not&nbsp;helpful</input></label>'
	+	  '<label class="btn btn-outline-primary active">'
	+		'<input type="radio" value="not-used" name="' + name + '" checked>Not&nbsp;used</input></label>'
	+   '</div>'
	+ '</div>';
	ele.firstChild.innerText = name.replace(/~/g, ' ') + ":";
	cope.appendChild(ele);
}

function saveMech(name) {
	var req =  new XMLHttpRequest();
	req.open("POST", "addMech.php", true);
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.send('mech=' + encodeURIComponent(name));
}

function getMech() {
	var req =  new XMLHttpRequest();
	req.addEventListener("readystatechange", function () {
		if (req.readyState === 4 && req.status === 200) {
			var names = req.responseText.split('\n');
			names.sort();
			// i = 1 bc it starts with a \n
			for (var i = 1; i < names.length; i++) {
				addMech(names[i]);
			}
		}
	});
	req.open("GET", "getMech.php", true);
	req.send();
}

function removeMech(e) {
	var par = e.currentTarget.parentElement;
	par.parentElement.removeChild(par);
}

function saveInput(e) {
	if (e.target.name.length === 0) {
		return;
	}
	
	localStorage.setItem(e.target.name, JSON.stringify(e.target.value));
	console.log(e.target.name);
	console.log(JSON.stringify(e.target.value));
}

window.onload = function loadInput(e) {
	// https://stackoverflow.com/a/3138591/8335309
	for (var i = 0; i < localStorage.length; i++) {
		var id = localStorage.key(i);
		var value = JSON.parse(localStorage.getItem(id));
		var ele = document.getElementById(id);
		if (ele === null) { // is prolly radio ctrl
			ele = document.getElementById(id + '-' + value);
			if (ele === null) { // is nothing at all
				console.log('not found: ' + id + '-' + value);
			} else {
				ele.checked = true;
				ele.parentElement.classList.add("active");
			}
		} else {
			document.getElementById(id).value = value;
		}
	}
	getMech();
};

function addMechButton() {
	var form = $("#newMechName");
	var name = "~" + form.val().trim().replace(/\s/g, '~');
	if (name.length == 0) {
		form.addClass("is-invalid");
		form.siblings(".invalid-feedback")[0].style.display = "block";
		return;
	} else {
		form.removeClass("is-invalid");
		form.siblings(".invalid-feedback")[0].style.display = "none";
	}
	addMech(name);
	saveMech(name);
}

function addMechOnEnter(e) {
	if (e.which === 13) {
		addMechButton();
	}
}
