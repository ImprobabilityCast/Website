<!DOCTYPE html>
<html lang="en-US">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<?php require $_SERVER['DOCUMENT_ROOT'] . "/meta-pages/includes.php"; ?>
<link rel="stylesheet" type="text/css" href="/css/mines.css" />
<body>

<table id="board">
</table>

<button onclick="mines.newGame()">New</button>
<!--<input name="numberOfMines" type="number" min="1" last-good-input=""
    onchange="stopInvalid(event)" oninput="flagInvalid(event)"/>
<input name="width" type="number" min="2" last-good-input=""
    onchange="stopInvalid(event)" oninput="flagInvalid(event)"/>
<input name="height" type="number" min="2" last-good-input=""
    onchange="stopInvalid(event)" oninput="flagInvalid(event)"/>-->
<form>
<label for="size">Size: </label>
<select name="size" onchange="mines.sizeChange(event)">
    <option size="8">8 x 8</option>
    <option size="10">10 x 10</option>
    <option size="15">15 x 15</option>
    <option size="20">20 x 20</option>
    <option size="40">40 x 40</option>
</select>
<br />
<label for="numberOfMines">Mines: </label>
<select name="numberOfMines" onchange="mines.nMinesChange(event)">
    <option>10</option>
    <option>15</option>
    <option>30</option>
    <option>60</option>
</select>
</form>
<div id="flagCounter">
10
</div>
<p id="msg">

</p>

<script src="minesTile.js" ></script>
<script src="mines.js" ></script>
<script src="minesEventHandlers.js" defer="defer"></script>
<script>
var mines = new Mines(document.getElementById("board"));
mines.newGame(8, 8);
</script>
</body>
</html>
