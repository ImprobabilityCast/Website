function saveInput(e) {
	if (e.target.name.length === 0) {
		return;
	}
	
	localStorage.setItem(e.target.name, JSON.stringify(e.target.value));
	console.log("saving " + e.target.name);
}

window.addEventListener('load', function () {
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
				ele.setAttribute("waschecked", 1);
				ele.parentElement.classList.add("active");
			}
		} else if (ele.type === "checkbox") {
			ele.checked = true;
		} else {
			document.getElementById(id).value = value;
		}
	}
});
