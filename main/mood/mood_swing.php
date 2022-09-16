<?php session_start();
require_once 'login_check.php'; ?>
<!DOCTYPE html>
<html lang="en-US">
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
<link rel="stylesheet" href="form.css" />
<title>Mood Swing</title>

<body class="container">
	<?php require_once 'mood_nav.html'; ?>
	
	<form id="depressing-form" autocomplete="off" method="post"
			action="swing_action.php">
		<fieldset>
			<legend>Significant mood swing</legend>
			<div class="form-group">
				<label for="mood-trigger">Trigger:</label>
				<input type="text" class="form-control" name="mood-trigger">
			</div>
			
			<div class="form-group">
				<label for="mood-before">Mood before:</label>
				<div class="input-group">
					<div class="container">
						<div class="row">
							<input type="range" class="custom-range" name="mood-before" min="0" max="100">
						</div>
						<div class="row justify-content-between">
							<div class="col-auto">
								<span>Low</span>
							</div>
							<div class="col-auto">
								<span>High</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<div class="form-group">
				<label for="mood-after">Mood after:</label>
				<div class="input-group">
					<div class="container">
						<div class="row">
							<input type="range" class="custom-range" name="mood-after" min="0" max="100">
						</div>
						<div class="row justify-content-between">
							<div class="col-auto">
								<span>Low</span>
							</div>
							<div class="col-auto">
								<span>High</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</fieldset>
		
		<div class="form-row">
			<input type="submit" id="btn-submit" class="btn btn-primary align-self-end col-sm-3" value="Submit">
		</div>
	</form>
	<script src="/js/jquery.min.js"></script>
	<script src="/js/popper.min.js"></script>
	<script src="/bootstrap/js/bootstrap.min.js"></script>
</body>
</html>
