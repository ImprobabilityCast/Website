<?php session_start();
require_once 'login_check.php'; ?>
<!DOCTYPE html>
<html lang="en-US">
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css" />
<link rel="stylesheet" href="form.css" />
<title>Mood Today</title>

<body class="container">
	<?php require_once 'mood_nav.html'; ?>
	
	<form id="depressing-form" autocomplete="off" method="post" action="mood_today_action.php"
			onchange="saveInput(event)" onsubmit="setHiddenInputs(event)" >
		<fieldset id="mood">
			<legend>Mood</legend>
			<div class="form-group">
				<label for="mood-overall">Overall mood:</label>
				<input type="text" class="form-control" id="mood-overall" name="mood-overall"></input>
				<label for="mood-secondary">Secondary mood:</label>
				<input type="text" class="form-control" id="mood-secondary" name="mood-secondary"></input>
				
				<label for="mood-date">Date:</label>
				<input type="date" id="mood-date" class="form-control" name="mood-date" value>
			</div>
			
			<div class="form-group">
				<label for="newMechName" class="mt-3">Coping mechanisms:</label>
				<div class="input-group">
					<input type="text" class="form-control" id="newMechName"
						placeholder="Add a coping mechanism" onkeypress="addMechOnEnter(event, addMechLineHTML)">
					<div class="input-group-append">
						<button type="button" class="btn btn-primary btn-plus"
							onclick="addMechButton(addMech)">&nbsp;&nbsp;&nbsp;+&nbsp;&nbsp;&nbsp;</button>
					</div>
					<div class="invalid-feedback"></div>
				</div>
				<p class="mt-3 mb-4"><a href="mechanismMan.php">Remove a coping mechanism</a></p>
			</div>
			<div class="form-group" id="coping"></div>
			<input type="hidden" id="mood-hidden" name="mood-hidden">
		</fieldset>
	
		<fieldset id="suicide">
			<legend>Suicide</legend>
			
			<div class="form-group form-row">
				<label class="col-sm-4 col-form-label" for="suicidal-thoughts">Suicidal&nbsp;thoughts:</label>
				<div class="col-auto btn-group btn-group-toggle" data-toggle="buttons">
					<label class="btn btn-outline-primary">
						<input type="radio" name="suicidal-thoughts" id="suicidal-thoughts-0" value="0" waschecked="0">
						None
					</label>
					<label class="btn btn-outline-primary">
						<input type="radio" name="suicidal-thoughts" id="suicidal-thoughts-1" value="1" waschecked="0">
						1-5
					</label>
					<label class="btn btn-outline-primary">
						<input type="radio" name="suicidal-thoughts" id="suicidal-thoughts-2" value="2" waschecked="0">
						5-10
					</label>
					<label class="btn btn-outline-primary">
						<input type="radio" name="suicidal-thoughts" id="suicidal-thoughts-3" value="3" waschecked="0">
						Over&nbsp;10
					</label>
				</div>
			</div>
			
			<div class="form-group form-row">
				<label class="col-sm-4 col-form-label" for="suicidal-urges">Suicidal&nbsp;urges:</label>
				<div class="col-auto btn-group btn-group-toggle" data-toggle="buttons">
					<label class="btn btn-outline-primary">
						<input type="radio" name="suicidal-urges" id="suicidal-urges-0" value="0" waschecked="0">
						None
					</label>
					<label class="btn btn-outline-primary">
						<input type="radio" name="suicidal-urges" id="suicidal-urges-1" value="1" waschecked="0">
						1-5
					</label>
					<label class="btn btn-outline-primary">
						<input type="radio" name="suicidal-urges" id="suicidal-urges-2" value="2" waschecked="0">
						5-10
					</label>
					<label class="btn btn-outline-primary">
						<input type="radio" name="suicidal-urges" id="suicidal-urges-3" value="3" waschecked="0">
						Over&nbsp;10
					</label>
				</div>
			</div>
			
			<div class="form-group">
				<label for="suicidal-steps">Suicidal steps</label>
				<textarea class="form-control" rows="5" id="suicidal-steps" name="suicidal-steps"></textarea>
			</div>
			<input type="hidden" id="suicide-hidden" name="suicide-hidden">
		</fieldset>
		
		<fieldset id="harm">
			<legend>Self-harm</legend>
			<div class="form-group">
				<label for="harm-where">Where:</label>
				<input type="text" class="form-control" id="harm-where" name="harm-where">
			</div>
			<div class="form-group">
				<label for="harm-tool">Tool used:</label>
				<input type="text" class="form-control" id="harm-tool" name="harm-tool">
			</div>
			<div class="form-group">
				<label for="harm-depth">How deep:</label>
				<input type="text" class="form-control" id="harm-depth" name="harm-depth">
			</div>
			<div class="form-group">
				<label for="harm-emote-response">Emotional Response:</label>
				<textarea class="form-control" rows="5" id="harm-emote-response" name="harm-emote-response"></textarea>
			</div>
			<div class="form-group form-row">
				<label class="col-form-label" for="harm-purpose">Purpose:</label>
				<div class="col btn-group btn-group-toggle" data-toggle="buttons">
					<label class="btn btn-outline-primary col-sm-3">
						<input type="radio" name="harm-purpose" id="harm-purpose-0" value="0" waschecked="0">
						To bleed
					</label>
					<label class="btn btn-outline-primary col-sm-3">
						<input type="radio" name="harm-purpose" id="harm-purpose-1" value="1" waschecked="0">
						To hurt
					</label>
				</div>
			</div>
			<input type="hidden" id="harm-hidden" name="harm-hidden">
		</fieldset>
		
		<fieldset id="depression" oninput="flagInput(event)">
			<legend>Depression</legend>
			<div class="form-group">
				<label for="energy">Energy level:</label>
				<div class="input-group">
					<div class="container">
						<div class="row">
							<input type="range" class="custom-range" id="energy" name="energy" min="0" max="100" changed="0">
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
				<label for="motivation">Motivation:</label>
				<div class="input-group">
					<div class="container">
						<div class="row">
							<input type="range" class="custom-range" id="motivation" name="motivation" min="0" max="100" changed="0">
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
				<label for="hygine">Basic needs/hygine:</label>
				<div class="input-group">
					<div class="container">
						<div class="row">
							<input type="range" class="custom-range" id="hygine" name="hygine" min="0" max="100" changed="0">
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
			<input type="hidden" id="depression-hidden" name="depression-hidden">
		</fieldset>
		
		<fieldset id="anxiety">
			<legend>Anxiety</legend>
			<div class="form-group">
				<label for="anx-where">Felt where:</label>
				<textarea class="form-control" rows="5" id="anx-where" name="anx-where"></textarea>
			</div>
			<div class="form-group">
				<label for="anx-intensity">Intensity:</label>
				<div class="input-group">
					<div class="container">
						<div class="row">
							<input type="range" class="custom-range" id="anx-intensity"
								name="anx-intensity" min="0" max="100" changed="0" oninput="flagInput(event)">
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
			<div class="custom-control custom-checkbox">
				<input type="checkbox" class="custom-control-input" id="panic-attack" name="panic-attack" value="1">
				<label class="custom-control-label" for="panic-attack">Panic attack</label>
			</div>
			<input type="hidden" id="anxiety-hidden" name="anxiety-hidden">
		</fieldset>
		
		<fieldset id="fog">
			<legend>Fogginess</legend>
			<div class="form-group">
				<label for="fog-speed">Speed of comprehension:</label>
				<div class="input-group">
					<div class="container">
						<div class="row">
							<input type="range" class="custom-range" id="fog-speed"
								name="fog-speed" min="0" max="100">
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
			
			<div class="form-group form-row">
				<label class="col-sm-9 col-form-label" for="forgets">Forgeting what I was thinking/saying/doing in the middle of it:</label>
				<div class="col-auto btn-group btn-group-toggle" data-toggle="buttons">
					<label class="btn btn-outline-primary">
						<input type="radio" name="forgets" id="forgets-0" value="0" waschecked="0">
						None
					</label>
					<label class="btn btn-outline-primary">
						<input type="radio" name="forgets" id="forgets-1" value="1" waschecked="0">
						1-5
					</label>
					<label class="btn btn-outline-primary">
						<input type="radio" name="forgets" id="forgets-2" value="2" waschecked="0">
						5-10
					</label>
					<label class="btn btn-outline-primary">
						<input type="radio" name="forgets" id="forgets-3" value="3" waschecked="0">
						Over&nbsp;10
					</label>
				</div>
			</div>
			
			<div class="form-group form-row">
				<label class="col-sm-9 col-form-label" for="slurrs">Slurring words/stuttering:</label>
				<div class="col-auto btn-group btn-group-toggle" data-toggle="buttons">
					<label class="btn btn-outline-primary">
						<input type="radio" name="slurrs" id="slurrs-0" value="0" waschecked="0">
						None
					</label>
					<label class="btn btn-outline-primary">
						<input type="radio" name="slurrs" id="slurrs-1" value="1" waschecked="0">
						1-5
					</label>
					<label class="btn btn-outline-primary">
						<input type="radio" name="slurrs" id="slurrs-2" value="2" waschecked="0">
						5-10
					</label>
					<label class="btn btn-outline-primary">
						<input type="radio" name="slurrs" id="slurrs-3" value="3" waschecked="0">
						Over&nbsp;10
					</label>
				</div>
			</div>
			<input type="hidden" id="fog-hidden" name="fog-hidden">
		</fieldset>
		
		<fieldset id="anger">
			<legend>Anger</legend>
			<div class="form-group">
				<label for="anger-exp">Any alarming expression of anger:</label>
				<textarea class="form-control" rows="5" id="anger-exp" name="anger-exp"></textarea>
			</div>
			<div class="form-group">
				<label for="anger-thoughts">Any specific destructive thoughts:</label>
				<textarea class="form-control" rows="5" id="anger-thoughts" name="anger-thoughts"></textarea>
			</div>
			<input type="hidden" id="anger-hidden" name="anger-hidden">
		</fieldset>
		
		<fieldset id="food">
			<legend>Eating</legend>
			<div class="form-group form-row">
				<label for="wake-to-eat-time" class="col-sm-4 col-form-label">Ate how long after waking up:</label>
				<div class="col">
					<div class="input-group">
						<input class="form-control" type="number" id="wake-to-eat-time" name="wake-to-eat-time" min="0" step="0.25" />
						<div class="input-group-append">
							<span class="input-group-text">Hrs</span>
						</div>
					</div>
				</div>
			</div>
			
			<div class="form-group form-row">
				<label for="food-to-food-time" class="col-sm-4 col-form-label">Time between each food:</label>
				<div class="col">
					<div class="input-group">
						<input class="form-control" type="number" id="food-to-food-time" name="food-to-food-time" min="0" step="0.25"/>
						<div class="input-group-append">
							<span class="input-group-text">Hrs</span>
						</div>
					</div>
				</div>
			</div>
			
			<div class="custom-control custom-checkbox">
				<input type="checkbox" class="custom-control-input" id="veggies" name="veggies" value="1">
				<label class="custom-control-label" for="veggies">Any protein/veggies</label>
			</div>
			<input type="hidden" id="food-hidden" name="food-hidden">
		</fieldset>
		
		<fieldset id="sleep">
			<legend>Sleep</legend>
			<div class="form-group form-row">
				<label class="col-sm-4 col-form-label" for="fell-asleep">Time fell asleep:</label>
				<div class="col">
					<input type="time" id="fell-asleep" name="fell-asleep" class="form-control">
				</div>
			</div>
			<div class="form-group form-row">
				<label class="col-sm-4 col-form-label" for="woke-up">Time woke up:</label>
				<div class="col">
					<input type="time" id="woke-up" name="woke-up" class="form-control">
				</div>
			</div>
			
			<div class="form-group form-row">
				<label class="col-sm-4 col-form-label" for="sleep-spent-awake">Time spent lying awake:</label>
				<div class="col">
					<div class="input-group">
						<input class="form-control" type="number" id="sleep-spent-awake" name="sleep-spent-awake" min="0" step="0.25" />
						<div class="input-group-append">
							<span class="input-group-text">Hrs</span>
						</div>
					</div>
				</div>
			</div>
			
			<div class="form-group form-row">
				<label class="col-form-label" for="sleep-quality">Sleep quality:</label>
				<div class="col btn-group btn-group-toggle" data-toggle="buttons">
					<label class="btn btn-outline-primary col-sm-3">
						<input type="radio" name="sleep-quality" id="sleep-quality-0" value="0" waschecked="0">
						Restless
					</label>
					<label class="btn btn-outline-primary col-sm-3">
						<input type="radio" name="sleep-quality" id="sleep-quality-1" value="1" waschecked="0">
						Solid
					</label>
				</div>
			</div>
			
			<div class="form-group">
				<label for="meds">When meds were taken and how much:</label>
				<textarea class="form-control" rows="5" id="meds" name="meds"></textarea>
			</div>
			<input type="hidden" id="sleep-hidden" name="sleep-hidden">
		</fieldset>
		
		<fieldset id="people">
			<legend>Alone/People time</legend>
			<div class="form-group">
				<label for="ap-what">What did you do:</label>
				<textarea class="form-control" rows="5" id="ap-what" name="ap-what"></textarea>
			</div>
			<div class="form-group">
				<label for="ap-impact">What impact did it have:</label>
				<textarea class="form-control" rows="5" id="ap-impact" name="ap-impact"></textarea>
			</div>
			<div class="form-group">
				<label for="ap-interactions">How would you rate your interactions:</label>
				<div class="input-group">
					<div class="container">
						<div class="row">
							<input type="range" class="custom-range" id="ap-interactions"
								name="ap-interactions" min="0" max="100" changed="0" oninput="flagInput(event)">
						</div>
							<div class="row justify-content-between">
							<div class="col-auto">
								<span>Heavy</span>
							</div>
							<div class="col-auto">
								<span>Life Fueling</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<input type="hidden" id="people-hidden" name="people-hidden">
		</fieldset>
		
		<hr />
		<div class="form-group">
			<label for="note">Notes:</label>
			<textarea class="form-control" id="note" name="note" rows="5"></textarea>
		</div>
		
		<div class="form-row">
			<input type="submit" id="btn-submit" class="btn btn-primary align-self-end col-sm-3" value="Submit">
		</div>
	</form>
	
	<footer class="container">
		<hr />
		<nav class="nav nav-justified">
			<a href="/mood/" class="nav-link nav-item">Home</a>
		</nav>
	</footer>
	
	<script src="/js/jquery.min.js"></script>
	<script src="/js/popper.min.js"></script>
	<script src="/bootstrap/js/bootstrap.min.js"></script>

	<script src="util.js"></script>
	<script src="mechanismMan.js"></script>
	<script src="formTricks.js"></script>
	<script src="mood_validation.js"></script>
	<script>
	window.addEventListener('load', function () {
		$("#mood-date").val(new Date().toLocaleDateString('en-CA'));
		// https://stackoverflow.com/a/15105717/8335309
		if (typeof $ === 'function') {
			let inputs = $("input[type=radio]");
			for (let input of inputs) {
				input.addEventListener("click", dummyToggleRadio);
			}
		}
		getMech(addMech);
	});
	</script>
</body>
</html>
