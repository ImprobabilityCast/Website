
function addMech(name) {
	var cope = document.getElementById("coping");
	var ele = document.createElement("div");
	ele.classList.add("form-group");
	ele.classList.add("form-row");
	ele.innerHTML = '<label class="col-sm-4 col-form-label" for="'
	+ name + '"></label>'
	+ '<div class="col">'
	+   '<div id="' + name.toLowerCase() + '" class="btn-group btn-group-toggle" data-toggle="buttons">'
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
