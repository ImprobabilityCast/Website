<html>
<script>
(function () {
	let removeIDs = [<?php

session_start();
require_once 'mood_util.php';
require_once 'preprocessing.php';
require_once 'simple_check.php';

$dbh = create_db_conn();
$user = new User($dbh);
$db_helper = new DBQueryHelper($user, $dbh);
// don't care about seconds
$time_reg = '/\A(([0-1][0-9])|(2[0-3])):[0-5][0-9]\z/';
$hours_reg = '/\A\d{1,2}(\.\d{1,2})?\z/';

function escape(&$value, $key) {
	global $dbh;
	$value = $dbh->quote(trim($value));
}

function valid_rating(string $key, array $array, $max) {
	return array_key_exists($key, $array)
			&& $array[$key] >= 0 && $array[$key] <= $max;
}

function validScaleRating($value) {
	return (0 <= $value && $value <= 100);
}

function isValidTimeSlice($time1, $time2, $interval) {
	$time1 = DateTimeImmutable::createFromFormat('H:i', $time1);
	$time2 = DateTimeImmutable::createFromFormat('H:i', $time2);
	$valid_interval = $time1->diff($time2, true);
	return ($valid_interval->h + $valid_interval->i / 60) >= $interval;
}

function check_section_valid($hidden_name) {
	return array_key_exists($hidden_name, $_POST)
		&& $_POST[$hidden_name] == '1';
}

if (array_key_exists('mood-overall', $_POST)
		&& !empty($_POST['mood-overall'])) {
	$mood_secondary = array_key_exists('mood-secondary', $_POST) ?
			$_POST['mood-secondary'] : "''";
	$db_helper->insert_data('basic_mood',
			$_POST['mood-overall'],
			$mood_secondary
	);
	echo '"mood-overall", "mood-secondary",';
}

if (check_section_valid('suicide-hidden')
		&& valid_rating('suicidal-thoughts', $_POST, 3)
		&& valid_rating('suicidal-urges', $_POST, 3)) {
	$db_helper->insert_data('suicide',
			pad($_POST['suicidal-thoughts'], 'numberPreprocess'),
			pad($_POST['suicidal-urges'], 'numberPreprocess'),
			$_POST['suicidal-steps']
	);
	echo '"suicidal-thoughts", "suicidal-urges", "suicidal-steps",';
}

if (check_section_valid('harm-hidden')
		&& valid_rating('harm-purpose', $_POST, 1)) {
	$db_helper->insert_data('self_harm',
			$_POST['harm-where'],
			$_POST['harm-tool'],
			$_POST['harm-depth'],
			$_POST['harm-emote-response'],
			pad($_POST['harm-purpose'], 'numberPreprocess')
	);
	echo '"harm-where", "harm-tool", "harm-depth", ',
		'"harm-emote-response", "harm-purpose",';
}

if (check_section_valid('depression-hidden')
		&& validScaleRating($_POST['energy'])
		&& validScaleRating($_POST['motivation'])
		&& validScaleRating($_POST['hygine'])) {
	$db_helper->insert_data('depression',
			pad($_POST['energy'], 'numberPreprocess'),
			pad($_POST['motivation'], 'numberPreprocess'),
			pad($_POST['hygine'], 'numberPreprocess')
	);
	echo '"energy", "motivation", "hygine",';
}

if (check_section_valid('anxiety-hidden')
		&& validScaleRating($_POST['anx-intensity'])) {
	$panic = (array_key_exists('panic-attack', $_POST))
			? $_POST['panic-attack'] * 1 : 0;
	$db_helper->insert_data('anxiety',
			$_POST['anx-where'],
			pad($_POST['anx-intensity'], 'numberPreprocess'),
			pad($panic, 'numberPreprocess')
	);
	echo '"anx-where", "anx-intensity", "panic-attack",';
}

if (check_section_valid('fog-hidden')
		&& valid_rating('forgets', $_POST, 3)
		&& valid_rating('slurrs', $_POST, 3)) {
	$db_helper->insert_data('fog',
			pad($_POST['fog-speed'], 'numberPreprocess'),
			pad($_POST['forgets'], 'numberPreprocess'),
			pad($_POST['slurrs'], 'numberPreprocess')
	);
	echo '"fog-speed", "forgets", "slurrs",';
}

if (check_section_valid('anger-hidden')) {
	$db_helper->insert_data('anger',
			$_POST['anger-exp'],
			$_POST['anger-thoughts']
	);
	echo '"anger-exp", "anger-thoughts",';
}

if (check_section_valid('food-hidden')
		&& preg_match($hours_reg, $_POST['wake-to-eat-time'])
		&& preg_match($hours_reg, $_POST['food-to-food-time'])) {
	$veggies = array_key_exists('veggies', $_POST)
			? $_POST['veggies'] * 1 : 0;
	$db_helper->insert_data('food',
			pad($_POST['wake-to-eat-time'], 'numberPreprocess'),
			pad($_POST['food-to-food-time'], 'numberPreprocess'),
			pad($veggies, 'numberPreprocess')
	);
	echo '"wake-to-eat-time", "food-to-food-time", "veggies",';
}

if (check_section_valid('sleep-hidden')
		&& preg_match($time_reg, $_POST['fell-asleep'])
		&& preg_match($time_reg, $_POST['woke-up'])
		&& preg_match($hours_reg, $_POST['sleep-spent-awake'])
		&& isValidTimeSlice($_POST['fell-asleep'], $_POST['woke-up'],
			$_POST['sleep-spent-awake'])
		&& valid_rating('sleep-quality', $_POST, 1)) {
	$db_helper->insert_data('sleep',
			pad($_POST['fell-asleep'], 'dummy'),
			pad($_POST['woke-up'], 'dummy'),
			pad($_POST['sleep-spent-awake'], 'numberPreprocess'),
			pad($_POST['sleep-quality'], 'numberPreprocess'),
			$_POST['meds']
	);
	echo '"fell-asleep", "woke-up", "sleep-spent-awake", ',
		'"sleep-quality", "meds",';
}

if (check_section_valid('people-hidden')) {
	$db_helper->insert_data('people',
			$_POST['ap-what'],
			$_POST['ap-impact'],
			pad($_POST['ap-interactions'], 'numberPreprocess')
	);
	echo '"ap-what", "ap-impact", "ap-interactions",';
}

if (array_key_exists('note', $_POST) && !empty($_POST['note'])) {
	$db_helper->insert_data('notes', $_POST['note']);
	echo '"note",';
}

foreach ($_POST as $key => $value) {
	if ($key[0] === '~' && ($value !== 'not-used')) {
		$enc_key = $dbh->quote($user->encryptData($key));
		$qot_val = $dbh->quote($user->encryptData(pad($value, 'mechPreprocess')));
		$sql = "INSERT INTO coping_mechs_help
			VALUES($user->id, $db_helper->timestamp, $enc_key, $qot_val);";
		$dbh->query($sql);
	}
}

$db_helper = null;
$user = null;
$dbh = null;

?>""];
	removeIDs.pop();

	for (let id of removeIDs) {
		localStorage.removeItem(id);
		console.log("removed: " + id);
	}
	window.location = "mood_today.html";
})();
</script>
</html>
