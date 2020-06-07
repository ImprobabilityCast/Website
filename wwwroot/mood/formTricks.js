
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
	+		'<input type="radio" value="2" name="' + name + '">Helpful</input></label>'
	+	  '<label class="btn btn-outline-primary">'
	+		'<input type="radio" value="1" name="' + name + '">Not&nbsp;helpful</input></label>'
	+	  '<label class="btn btn-outline-primary active">'
	+		'<input type="radio" value="0" name="' + name + '" checked>Not&nbsp;used</input></label>'
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
	// todo delete from server
}

function addMechButton() {
	var form = $("#newMechName");
	var name = "~" + form.val().trim().replace(/\s+/g, '~');
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

function toggleRadio(e) {
	if (e.target.tagName.toUpperCase() === "INPUT") {
		if (e.target.getAttribute("waschecked") == 1) {
			e.target.setAttribute("waschecked", 0);
			e.target.checked = false;
			e.target.parentElement.classList.remove("active");
			localStorage.removeItem(e.target.name);
			console.log("removing: '" + e.target.name + "'");
		} else {
			e.target.setAttribute("waschecked", 1);
		}
	}
}

function dummyToggleRadio(e) {
	setTimeout(toggleRadio, 300, e);
}

window.addEventListener('load', function () {
	// https://stackoverflow.com/a/15105717/8335309
	if (typeof $ === 'function') {
		let inputs = $("input[type=radio]");
		for (let input of inputs) {
			input.addEventListener("click", dummyToggleRadio);
		}
	}
	getMech();
});
