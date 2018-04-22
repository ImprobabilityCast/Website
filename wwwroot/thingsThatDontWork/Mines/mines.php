<!DOCTYPE html>
<html lang="en-US">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<?php require $_SERVER['DOCUMENT_ROOT'] . "/meta-pages/includes.php"; ?>
<link rel="stylesheet" type="text/css" href="mines.css" />
<body>



<div id="left">
<button onclick="controller.newGame(10)">New</button>

<div id="flagCounter">
10
</div>
</div>

<!-- <table id="board">
<tr><td></td><td class="unseen"></td><td class="explode"></td></tr>
<tr><td></td><td></td><td></td></tr>
<tr><td></td><td></td><td></td></tr>
</table>-->
<table id="board">
</table>


<script src="model.js" ></script>
<script src="view.js" ></script>
<script src="controller.js" ></script>
<script>
var controller = new Controller();
</script>
</body>
</html>
