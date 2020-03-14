<?php
session_start();
if (!empty($_SESSION['pwd_key'])) {
	header("Location: /mood/");
	exit(0);
}
$wrong_pwd = ('1' === htmlspecialchars($_GET['wrong_pwd']));
$wrong_user = ('1' === htmlspecialchars($_GET['wrong_user']));
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
				<label for="email" class="col-sm-4 col-form-label">Email:</label>
				<div class="col">
					<input type="text" name="email" class="form-control <?php
							if ($wrong_user) { echo ' is-invalid'; } ?>"
						placeholder="someone@example.com">
					<div class="invalid-feedback"
						<?php if ($wrong_user) { echo ' style="display: block;"'; } ?>>
						User does not exist
					</div>
				</div>
			</div>
			<div class="form-row form-group">
				<label for="password" class="col-sm-4 col-form-label">Password:</label>
				<div class="col">
					<input type="password" name="password" class="form-control <?php
							if ($wrong_pwd) { echo ' is-invalid'; } ?>"
						oninput="checkPasswordsMatch()">
					<div class="invalid-feedback"
						<?php if ($wrong_pwd) { echo ' style="display: block;"'; } ?>>
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
	
	<footer>
		<hr />
		<nav class="nav nav-justified">
			<a class="nav-link nav-item" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">Tech Support</a>
		</nav>
	</footer>
</body>
</html>
