<?php session_start();
require_once 'login_check.php'; ?>
<!DOCTYPE html>
<html lang="en-US">
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
<link rel="stylesheet" href="./history.css" />
<title>Mood Log</title>

<body class="container">
<?php require_once 'mood_nav.html'; ?>

<div class="row skinny">
	<div class="input-group" oninput="page.getData()">
		<label class="input-group-prepend input-group-text col" for="start-date">
			Starting Date:
		</label>
		<input type="date" id="start-date" class="form-control col">
	</div>
	<div class="input-group" oninput="page.getData()">
		<label class="input-group-prepend input-group-text col" for="start-date">
			Ending Date:
		</label>
		<input type="date" id="end-date" class="form-control col">
	</div>
</div>

<!-- word cloud for overall/secondary mood, but only if there's more than one entry-->

<div id="coping" class="skinny">
	<h5>Coping mechanisms used</h5>
	<div class="row">
		<div class="col-sm bg-primary text-center text-white pt-1 pb-1 w-50">Helpful</div>
		<div class="col-sm bg-secondary text-center text-white pt-1 pb-1 w-50">Not helpful</div>
	</div>
</div>
<div>
	<h5>Mood</h5>
	<div id="mood-text"></div>
	<br>
</div>
<div>
	<h5>Significant mood swings</h5>
	<div id="swing-text"></div>
	<br>
</div>
<div class="row">
	<div class="col p-0">
		<h5>Suicide</h5>
		<canvas id="suicide" width="300" height="300"></canvas>
		<h6>Suicidal steps</h6>
		<div id="suicide-text"></div>
		<br>

		<h5>Self harm</h5>
		<div id="self-harm-text"></div>
		<br>

		<h5>Depression</h5>
		<canvas id="depression" width="300" height="300"></canvas>
	</div>
	<div class="col p-0">
		<h5>Anxiety</h5>
		<canvas id="anxiety" width="300" height="300"></canvas>
		<h6>Felt Where</h6>
		<div id="anxiety-text"></div>
		<br>

		<h5>Fogginess</h5>
		<canvas id="fogComp" width="300" height="300"></canvas>
		<canvas id="fogRadio" width="300" height="300"></canvas>
		<h5>Anger</h5>
		<div id="anger-text"></div>
		<br>
	</div>
	<div class="col p-0">
		<h5>Eating</h5>
		<canvas id="food" width="300" height="300"></canvas>
		<h5>Sleep</h5>
		<canvas id="sleepTimes" width="300" height="300"></canvas>
		<canvas id="sleepHours" width="300" height="300"></canvas>
		<h6>Meds</h6>
		<div id="sleep-text"></div>
		<br>

		<h5>People</h5>
		<canvas id="people" width="300" height="300"></canvas>
		<h6>Interactions and their impact</h6>
		<div id="people-text"></div>
		<br>
		<h5>Notes</h5>
		<div id="notes-text"></div>
	</div>
</div>
<!-- maybe have a page for each one, so that reponses can be seen with dates
have a link to new tab if multiple days, otherwise just put it there. :D
-->

<script src="/js/jquery.min.js"></script>
<script src="/js/popper.min.js"></script>
<script src="/bootstrap/js/bootstrap.min.js"></script>
<script src="/js/chart.bundle.min.js"></script>
<script src="graphs.js"></script>
<script src="text.js"></script>
<script src="history.js"></script>
</body>
</html>
