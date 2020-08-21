<?php session_start();
require_once 'login_check.php'; ?>
<!DOCTYPE html>
<html lang="en-US">
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
<link rel="stylesheet" href="hoverTweaks.css" />
<title>Home</title>

<body class="container">
	<!--	only need graphs for the scales
	sleep with scale for #  hours of sleep: when fell sleep/when woke graph -->
	<header class="container">
		<nav class="nav nav-justified">
			<a class="nav-link nav-item disabled" href="/mood/">Home</a>
		</nav>
		<hr />
	</header>

	<div class="nav navbar-nav">
		<a href="mood_swing.php" class="nav-item nav-link text-center hover-grey">Mood swing</a>
		<a href="mood_today.php" class="nav-item nav-link text-center hover-grey">Mood today</a>
		<a href="history.php" class="nav-item nav-link text-center hover-grey">History</a>
		<a href="mechanismMan.php" class="nav-item nav-link text-center hover-grey">Coping mechanisms</a>
	</div>
	
	<footer class="container">
		<hr />
		<nav class="nav nav-justified">
			<a class="nav-link nav-item" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Tech Support</a>
		</nav>
	</footer>
</body>
</html>
