<?php
session_start();
if (!empty($_SESSION['pwd_key'])) {
	header("Location: /mood/");
	exit(0);
}

function error_code() {
	if (array_key_exists('error', $_GET)) {
		return $_GET['error'];
	} else {
		return 0;
	}
}

?>

<!DOCTYPE html>
<html lang="en-US">
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
<link rel="stylesheet" href="form.css" />
<link rel="stylesheet" href="signup.css" />
<link rel="stylesheet" href="login.css" />
<title>Login</title>

<body class="container d-flex flex-column justify-content-between">
	<header>
		<nav class="nav nav-justified">
			<a class="nav-link nav-item" href="/mood/">Home</a>
		</nav>
		<hr />
	</header>
	<form action="login_action.php" method="post" class="jumbotron align-self-center needs-validation">
		<h3>Login</h3>
		<hr />
		<fieldset>
			<div class="form-row form-group">
				<label for="uname" class="col-sm-4 col-form-label">Username:</label>
				<div class="col">
					<input type="text" name="uname" class="form-control <?php
							if (error_code() == 2) { echo ' is-invalid'; } ?>"
						placeholder="Username">
					<div class="invalid-feedback"
						<?php if (error_code() == 2) { echo ' style="display: block;"'; } ?>>
						User does not exist
					</div>
				</div>
			</div>
			<div class="form-row form-group">
				<label for="password" class="col-sm-4 col-form-label">Password:</label>
				<div class="col">
					<input type="password" name="password" class="form-control <?php
							if (error_code() == 1) { echo ' is-invalid'; } ?>"
						oninput="checkPasswordsMatch()">
					<div class="invalid-feedback"
						<?php if (error_code() == 1) { echo ' style="display: block;"'; } ?>>
						Incorrect password
					</div>
				</div>
			</div>
		</fieldset>
		<!-- maybe security questions at a later date -->
		<div class="form-row">
			<input type="submit" id="btn-submit" class="btn btn-primary align-self-end col-sm-3" value="Submit">
		</div>
	</form>
	
	<footer class="mb-3">
		<hr />
		<nav class="nav nav-justified">
			<a href="signup.html" class="nav-item nav-link p-3 font-weight-bold">
				Sign up
			</a>
		</nav>
	</footer>
</body>
</html>
