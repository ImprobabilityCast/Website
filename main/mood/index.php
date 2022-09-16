<?php session_start();
require_once 'login_check.php'; ?>
<!DOCTYPE html>
<html lang="en-US">
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
<link rel="stylesheet" href="hoverTweaks.css" />
<link rel="stylesheet" href="index.css" />
<title>Home</title>

<body class="p-3 d-flex flex-column justify-content-between">
	<!--	only need graphs for the scales
	sleep with scale for #  hours of sleep: when fell sleep/when woke graph -->
	<header>
		<nav class="nav nav-justified">
			<a class="nav-link nav-item disabled" href="/mood/">Home Sweet Home</a>
		</nav>
		<hr />
	</header>

	<nav class="nav navbar-nav">
		<h5><a href="mood_today.php" class="p-3 nav-item nav-link text-center hover-grey">Mood today</a></h5>
		<h5><a href="mood_swing.php" class="p-3 nav-item nav-link text-center hover-grey">Mood swing</a></h5>
		<h5><a href="history.php" class="p-3 nav-item nav-link text-center hover-grey">History</a></h5>
		<h5><a href="mechanismMan.php" class="p-3 nav-item nav-link text-center hover-grey">Coping mechanisms</a></h5>
	</nav>
	
	<footer class="mb-3">
		<hr />
		<nav class="nav nav-justified">
			<a href="logout.php" class="nav-item nav-link">
				<button type="button" class="btn btn-primary p-3 font-weight-bold w-100">
					Logout
				</button>
			</a>
		</nav>
	</footer>
</body>
</html>
