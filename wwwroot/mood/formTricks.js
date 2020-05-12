
function addMech() {
	var form = $("#newMechName");
	var name = form.val().trim();
	if (name.length == 0) {
		form.addClass("is-invalid");
		form.siblings(".invalid-feedback")[0].style.display = "block";
		return;
	} else {
		form.removeClass("is-invalid");
		form.siblings(".invalid-feedback")[0].style.display = "none";
	}
	
	var id = name.replace(/[^A-Z0-9]/ig, '-');
	var cope = document.getElementById("coping");
	var ele = document.createElement("div");
	ele.classList.add("form-group");
	ele.classList.add("form-row");
	ele.innerHTML = '<label class="col-sm-4 col-form-label" for="'
	+ id + '">'
	+ name + ':</label>'
	+ '<div class="col">'
	+   '<div id="' + id + '" class="btn-group">'
	+	  '<button type="button" class="btn btn-outline-primary" onclick="radioBtnClick(event)">It&nbsp;helped</button>'
	+	  '<button type="button" class="btn btn-outline-primary" onclick="radioBtnClick(event)">Did&nbsp;not&nbsp;help</button>'
	+	  '<button type="button" class="btn btn-outline-primary" onclick="radioBtnClick(event)">Not&nbsp;used</button>'
	+   '</div>'
	+ '</div>';
	cope.appendChild(ele);

	var req =  new XMLHttpRequest();
	req.open("POST", "addMech.php", true);
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.send('mech=' + encodeURIComponent(name));
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
};

function addMechOnEnter(e) {
	if (e.which === 13) {
		addMech();
	}
}
