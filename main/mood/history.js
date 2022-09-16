var page = (function () {
    let obj = {};
	let requestID = -1;

	$("#start-date").val(
		// past week
		new Date(Date.now() - 7000 * 60 * 60 * 24).toLocaleDateString('en-CA')
	);
	$("#end-date").val(new Date().toLocaleDateString('en-CA'));

	obj.getData = function () {
		clearTimeout(requestID); // invalid ids do nothing
		requestID = setTimeout(sendRequest, 1000);
	};

	function sendRequest() {
		let start = $("#start-date").val();
		let end = $("#end-date").val();
		let req = new XMLHttpRequest();
		let timespan = "?start=" + start + " 00:00:00&end="
			+ end + " 23:59:59";
		req = new XMLHttpRequest();
		req.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				let data = JSON.parse(this.responseText);
				console.log(data);
				graphs.buildGraphs(data);
				text.addText(data);
				addSwingLines(data.swings, $('#swing-text')[0]);
				showMechData(data.mechs);
			}
		};
		req.open("GET", "get_history.php" + timespan, true);
		req.send();
    }
    

	return obj;
})();

function tenIfZero(num1, num2) {
	if (num1 < 10 && num1 > 0) {
		num2 = 90;
		num1 = 10;
	}
	if (num2 < 10 && num2 > 0) {
		num1 = 90;
		num2 = 10;
	}
	return [num1, num2];
}

function showMechData(mechs) {
	let coping = document.getElementById('coping');
	trimChildren(coping);
	
	for (let key in mechs) {
		let ele = document.createElement("div");
		ele.classList.add("row");
		ele.classList.add("mt-2");
		ele.innerText = key.replace(/~/g, ' ');
		coping.appendChild(ele);

		let tot = mechs[key].total;
		let helpfulWidth = mechs[key].helpful  * 100.0 / tot;
		let unhelpfulWidth = 100 - helpfulWidth;
		let arr = tenIfZero(helpfulWidth, unhelpfulWidth);
		helpfulWidth = arr[0];
		unhelpfulWidth = arr[1];

		ele = makeLines(mechs[key].helpful, tot, true);
		coping.appendChild(ele);
	}
}

function trimChildren(dest) {
	while (dest.childElementCount > 2) {
		dest.removeChild(dest.lastChild);
	}
}

function addSwingLines(data, destination) {
	trimChildren(destination);
	
	for (let row of data) {
		let thingToAdd = text.createText(new Date(row['stamp']).toLocaleString(), false);
		let hiddenBox = thingToAdd.children[1];
		let ele = document.createElement("h6");
		ele.innerText = "Trigger";
		ele.classList.add("font-weight-bold");
		hiddenBox.appendChild(ele);
		ele = document.createElement("div");
		ele.innerText = row['swing_trigger'];
		hiddenBox.appendChild(ele);

		ele = document.createElement("span");
		ele.innerText = "Mood Before:";
		hiddenBox.appendChild(ele);
		ele = makeLines(row['mood_before'], 100);
		hiddenBox.appendChild(ele);

		ele = document.createElement("span");
		ele.innerText = "Mood After:";
		hiddenBox.appendChild(ele);
		ele = makeLines(row['mood_after'], 100);
		hiddenBox.appendChild(ele);
		destination.appendChild(thingToAdd);
	}
}

function makeLines(helpful, total, showNumbers = false) {
	let helpfulWidth = helpful  * 100.0 / total;
	let unhelpfulWidth = 100 - helpfulWidth;
	let arr = tenIfZero(helpfulWidth, unhelpfulWidth);
	helpfulWidth = arr[0];
	unhelpfulWidth = arr[1];

	let ele = document.createElement('div');
	ele.classList.add('row');
	ele.innerHTML = '<div class="bg-primary text-center text-white'
	+   ' pt-1 pb-1 width-' +  helpfulWidth
	+   '" style="width:' + helpfulWidth + '%"></div>'
	+	'<div class="bg-secondary text-center text-white'
	+   ' pt-1 pb-1 width-' + unhelpfulWidth
	+   '" style="width:' + unhelpfulWidth + '%"></div>';
	if (showNumbers) {
		ele.children[0].innerText = helpful;
		ele.children[1].innerText = total - helpful;
	}
	return ele;
}

window.onload = page.getData;
