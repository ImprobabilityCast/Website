{
    tracker = new XMLHttpRequest();
    tracker.onreadystatechange = function () {
        if (this.readyState == 4) {
            console.log(this.responseText);
        }
    }
    tracker.open("POST", "http://localhost/tracker/tracker.php", true);
    tracker.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    tracker.send("location=" + encodeURI(window.location.href));
}
