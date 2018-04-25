<!DOCTYPE html>
<html lang="en-US">
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<?php require $_SERVER['DOCUMENT_ROOT'] . "/meta-pages/includes.php"; ?>
<style>
img {
    max-width: 1024px;
    width: 100%;
    margin: 10px auto;
    box-shadow: 4px 4px 4px 0px #555;
    display: block;
}
</style>
<body onscroll='scrolled()'>
<div>
<?php
require "getNextPix.php";
main_func(0, 4);
?>
</div>
<script>
var lastImg;
var isRunning = false;
var endOfPage = window.innerHeight;
var nCurrentPix = 4;
var nTotalPix = <?php
    $pixPath = $_SERVER['DOCUMENT_ROOT'] . "/images/Oak_Island_2017/*";
    echo count(glob($pixPath));
?>;

window.onresize = function () {
    endOfPage = window.innerHeight;
}

window.onload = function () {
    updateLastImg();
}

function updateLastImg() {
    lastImg = document.getElementsByTagName("img");
    lastImg = lastImg[lastImg.length - 1];
}

function scrolled() {
    var distance2Bottom = lastImg.getBoundingClientRect().top;
    if (distance2Bottom <
        endOfPage - lastImg.getBoundingClientRect().height / 2) {
        // close enough to end of page
        if (!isRunning) {
            addPix(lastImg);
        }
        if (nCurrentPix == nTotalPix) {
            document.body.removeEventListener("scroll", scrolled);
        }
    }
}

function getNumberOfNewPix() {
    var result;
    var diff = nTotalPix - nCurrentPix;
    if (diff > 4) {
        result = 4;
    } else {
        result = diff;
    }
    return result;
}

function addPix() {
    isRunning = true;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var ele = document.createElement("div");
            ele.innerHTML = this.responseText;
            document.body.appendChild(ele);

            updateLastImg();
            isRunning = false;
        }
    }
    
    request.open("POST", "getNextPix.php", true);
    request.setRequestHeader("Content-type",
                             "application/x-www-form-urlencoded");
    
    var newPix = getNumberOfNewPix();
    request.send("index=" + nCurrentPix + "&num=" + newPix);
    nCurrentPix += newPix;
}

</script>
</body>
</html>