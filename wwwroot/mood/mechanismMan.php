<?php
session_start();
require_once 'login_check.php';
?>
<!DOCTYPE html>
<html lang="en-US">

<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
<link rel="stylesheet" href="form.css" />
<link rel="stylesheet" href="hoverTweaks.css" />
<title>Coping Mechanisms</title>

<body class="p-3">
	<?php require_once 'mood_nav.html'; ?>
    <h3>Coping Mechanisms</h2>
    <br>
    <div class="input-group">
        <input type="text" class="form-control" id="newMechName"
            placeholder="Add a coping mechanism" onkeypress="addMechOnEnter(event, addMechLineHTML)">
        <div class="input-group-append">
            <button type="button" class="btn btn-primary btn-plus"
                onclick="addMechButton(addMechLineHTML)">&nbsp;&nbsp;&nbsp;+&nbsp;&nbsp;&nbsp;</button>
        </div>
        <div class="invalid-feedback"></div>
    </div>
    <br>

    <div id="mechs"></div>
    <br>

	<script src="/js/jquery.min.js"></script>
	<script src="/js/popper.min.js"></script>
	<script src="/bootstrap/js/bootstrap.min.js"></script>
    <script src="mechanismMan.js"></script>
    <script>
        window.addEventListener("load", function () {
            getMech(addMechLineHTML);
        });
    </script>
</body>
</html>
