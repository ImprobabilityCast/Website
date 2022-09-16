window.onload = newFortune();

function newFortune() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById("pre1").innerHTML = this.responseText;
            var p1 = document.getElementById("p1");
            var smallScreenText = this.responseText.replace(/\n\n/g, "<br><br>");
            smallScreenText = smallScreenText.replace(/\n\t/g, "\t<br>").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
            if (smallScreenText.length > 250) {
                if (smallScreenText.length > 375) {
                    if (smallScreenText.length > 525) {
                        p1.style.marginBottom = "60%";
                        p1.style.position = "static";
                    } else { p1.style.bottom = "40%"; }
                } else { p1.style.bottom = "50%"; }
            } else { p1.style.bottom = "60%"; }
            if (smallScreenText.length <= 525) {
                p1.style.position = "";
                p1.style.marginBottom = "";
            }
            p1.innerHTML = smallScreenText
         }
     };

     var arg = document.getElementById("next-btn").name;
     if (arg !== "any") {
         request.open("GET", "updateFortune.php?cat=" + arg);
     } else {
	     request.open("GET", "updateFortune.php");
     }
     request.send();
}

function showOptions() {
	var category = document.getElementById("category");
	category.style.display = "block";
	setTimeout(function () {
		category.style.opacity = 1;
		document.getElementById("container").style.opacity = 0;
		document.body.style.background = "aliceblue";
	}, 100);
}

function hideOptions(e) {
	var val = e.currentTarget.name;
	if (val !== "close") {
		var current = document.getElementsByClassName("current");
		for (var i=0; i<current.length; i++) {
			current[i].className = "fortune-type";
		}
		e.currentTarget.className = "fortune-type current";
        
        if (document.getElementById("next-btn").name !== val) {
            document.getElementById("next-btn").name = val;
            newFortune();
        }
	}

	var category = document.getElementById("category");
	category.style.opacity = 0;
	document.getElementById("container").style.opacity = 1;
	setTimeout(function () {
		category.style.display = "none";
		document.body.style.background = "linear-gradient(white, lightblue)";
	}, 100);
}
