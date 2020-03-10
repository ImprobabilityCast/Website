function radioBtnClick(e) {
	var t = e.currentTarget;
	
	var toggle = t.classList.contains("btn-primary");
	
	for (var child of t.parentElement.children) {
		child.classList.add("btn-outline-primary");
		child.classList.remove("btn-primary");
	}
	
	if (toggle) {
		t.classList.add("btn-outline-primary");
		t.classList.remove("btn-primary");
	} else {
		t.classList.add("btn-primary");
		t.classList.remove("btn-outline-primary");
	}
}


function addMech(e) {
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
	
	var class_name = name.replace(/[^A-Z0-9]/ig, '-');
	var cope = document.getElementById("coping");
	var ele = document.createElement("div");
	ele.classList.add("input-group");
	ele.classList.add("form-row");
	ele.innerHTML = '<label class="col-sm-4 col-form-label" for="'
	+ class_name + '">'
	+ name + ':</label>'
	+ '<div class="col">'
	+   '<div id="' + class_name + '" class="btn-group">'
	+	  '<button type="button" class="btn btn-outline-primary" onclick="radioBtnClick(event)">It&nbsp;helped</button>'
	+	  '<button type="button" class="btn btn-outline-primary" onclick="radioBtnClick(event)">Did&nbsp;not&nbsp;help</button>'
	+	  '<button type="button" class="btn btn-outline-primary" onclick="radioBtnClick(event)">Not&nbsp;used</button>'
	+   '</div>'
	+ '</div>';
	cope.appendChild(ele);
}

function removeMech(e) {
	var par = e.currentTarget.parentElement;
	par.parentElement.removeChild(par);
}
