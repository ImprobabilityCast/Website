<!DOCTYPE html>
<html lang="en-US">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<?php require $_SERVER['DOCUMENT_ROOT'] . "/meta-pages/includes.php"; ?>
<link rel="stylesheet" type="text/css" href="mines.css" />
<link id="sizer" rel="stylesheet" type="text/css" href="tdNormal.css" />
<body>



<div id="left">
<button type="button" id="new" onclick="controller.newGame(level)">New</button>
<button type="button" id="size" onclick="toggleSize(event)">Large Tiles</button>
<div id="flagCounter">
10
</div>
<select onchange="level=event.currentTarget.selectedIndex">
  <option>easy</option>
  <option>intermediate</option>
  <option>expert</option>
  <option>world</option>
</select>
</div>

<table id="board">
</table>

<script src="model.js" ></script>
<script src="view.js" ></script>
<script src="controller.js" ></script>
<script>
var switcher = true;
var siz = document.getElementById('sizer');
function toggleSize(evt) {
    if (switcher) {
        siz.setAttribute('href', "tdLarge.css");
        evt.currentTarget.textContent = "Normal Tiles";
    } else {
        siz.setAttribute('href', "tdNormal.css");
        evt.currentTarget.textContent = "Large Tiles";
    }
    switcher = !switcher;
}
var level = 0;
var controller = new Controller();
</script>
</body>
</html>
