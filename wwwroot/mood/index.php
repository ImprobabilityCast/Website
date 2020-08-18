<?php session_start();
require_once 'login_check.php'; ?>
<!DOCTYPE html>
<html lang="en-US">
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />

<body class="container">
	<!--	only need graphs for the scales
	sleep with scale for #  hours of sleep: when fell sleep/when woke graph -->
	
	<ul class="nav navbar-nav">
		<li><a href="mood_swing.php">Significant mood swing</a></li>
		<li><a href="mood_today.php">Mood today</a></li>
		<li><a href="history.php">History</a></li>
	</ul>
	
	<footer class="container">
		<hr />
		<nav class="nav nav-justified">
			<a class="nav-link nav-item" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Tech Support</a>
		</nav>
	</footer>
</body>
</html>
