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
