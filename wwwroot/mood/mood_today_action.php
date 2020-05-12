<?php

session_start();
require_once 'mood_util.php';
require_once 'preprocessing.php';
require_once 'simple_check.php';

// check is loged in

$dbh = create_db_conn();
// don't care about seconds
$ratings = array('none', '1-5', '5-10', 'over-10');
$harm_ratings = array('to-bleed', 'to-hurt');
$sleep_ratings = array('restless', 'solid');
$user = new User($dbh);
$db_helper = new DBQueryHelper($user, $dbh);
$time_reg = '/\A(([0-1][0-9])|(2[0-3])):[0-5][0-9]\z/';
$hours_reg = '/\A\d{1,2}(\.\d{1,2})?\z/';

function escape(&$value, $key) {
	global $dbh;
	$value = $dbh->quote(trim($value));
}

function valid_rating(string $key, array $array,
		array $ratings_array) {
	return array_key_exists($key, $array)
			&& in_array($array[$key], $ratings_array);
}

function keys_exist(array $array, string ...$keys) {
	foreach ($keys as $key) {
		if (!array_key_exists($key, $array)) {
			return false;
		}
	}
	return true;
}

function validScaleRating($value) {
	return (0 <= $value && $value <= 100);
}

function isValidTimeSlice($time1, $time2, $interval) {
	$time1 = new DateTimeImmutable('H:i', $time1);
	$time2 = new DateTimeImmutable('H:i', $time2);
	$valid_interval = $time1->diff($time2, true);
	return ($valid_interval->h + $valid_interval->i / 60) >= $interval;
}

//array_walk($_POST, 'escape');
var_dump($_POST);


if (array_key_exists('mood-overall', $_POST)) {
	$mood_secondary = array_key_exists('mood-secondary', $_POST) ?
			$_POST['mood-secondary'] : "''";
	$db_helper->insert_data('basic_mood',
			$_POST['mood-overall'],
			$mood_secondary
	);
}

if (valid_rating('suicidal-thoughts', $_POST, $ratings)
		&& valid_rating('suicidal-urges', $_POST, $ratings)
		&& array_key_exists('suicidal-steps', $_POST)) {
	$db_helper->insert_data('suicide',
			pad($_POST['suicidal-thoughts'], 'ratingPreprocess'),
			pad($_POST['suicidal-urges'], 'ratingPreprocess'),
			$_POST['suicidal-steps']
	);
}

if (keys_exist($_POST, 'harm-where', 'harm-tool', 'harm-depth',
		'harm-emote-response')
		&& valid_rating('harm-purpose', $_POST, $harm_ratings)) {
	$db_helper->insert_data('self_harm',
			$_POST['harm-where'],
			$_POST['harm-tool'],
			$_POST['harm-depth'],
			$_POST['harm-emote-response'],
			pad($_POST['harm-purpose'], 'harmRatingPreprocess')
	);
}

if (keys_exist($_POST, 'energy', 'motivation', 'hygine')
		&& validScaleRating($_POST['energy'])
		&& validScaleRating($_POST['motivation'])
		&& validScaleRating($_POST['hygine'])) {
	$db_helper->insert_data('depression',
			pad($_POST['energy'], 'scalePreprocess'),
			pad($_POST['motivation'], 'scalePreprocess'),
			pad($_POST['hygine'], 'scalePreprocess')
	);
}

if (array_key_exists('fog-speed', $_POST)
		&& validScaleRating($_POST['anx-intensity'])) {
	$db_helper->insert_data('anxiety',
			$_POST['anx-where'],
			pad($_POST['anx-intensity'], 'scalePreprocess'),
			pad(array_key_exists('panic-attack', $_POST), 'dummy')
	);
}

if (array_key_exists('fog-speed', $_POST)
		&& valid_rating('forgets', $_POST, $ratings)
		&& valid_rating('slurrs', $_POST, $ratings)) {
	$db_helper->insert_data('fog',
			pad($_POST['fog-speed'], 'scalePreprocess'),
			pad($_POST['forgets'], 'ratingPreprocess'),
			pad($_POST['slurrs'], 'ratingPreprocess')
	);
}

if (keys_exist($_POST, 'anger-exp', 'anger-thoughts')) {
	$db_helper->insert_data('anger',
			$_POST['anger-exp'],
			$_POST['anger-thoughts']
	);
}

if (keys_exist($_POST, 'wake-to-eat-time', 'food-to-food-time')
		&& preg_match($hours_reg, $_POST['wake-to-eat-time'])
		&& preg_match($hours_reg, $_POST['food-to-food-time'])) {
	$db_helper->insert_data('food',
			pad($_POST['wake-to-eat-time'], 'hoursPreprocess'),
			pad($_POST['food-to-food-time'], 'hoursPreprocess'),
			pad(array_key_exists('veggies', $_POST), 'dummy')
	);
}

if (keys_exist($_POST, 'fell-alseep', 'woke-up', 'sleep-spent-awake',
			'sleep-quality', 'meds')
		&& preg_match($time_reg, $_POST['fell-asleep'])
		&& preg_match($time_reg, $_POST['woke-up'])
		&& preg_match($hours_reg, $_POST['sleep-spent-awake'])
		&& isValidTimeSlice($_POST['fell-asleep'], $_POST['woke-up'],
			$_POST['sleep-spent-awake'])
		&& valid_rating('sleep-quality', $_POST, $sleep_ratings)) {
	$db_helper->insert_data('sleep',
			pad($_POST['fell-asleep'], 'dummy'),
			pad($_POST['woke-up'], 'dummy'),
			pad($_POST['sleep-spent-awake'], 'hoursPreprocess'),
			pad($_POST['sleep-quality'], 'sleepPreprocess'),
			$_POST['meds']
	);
}

if (keys_exist($_POST, 'ap-what', 'ap-impact', 'ap-interactions')
		&& (!empty($_POST['ap-what']) || !empty($_POST['ap-impact'])
			|| $_POST['ap-interactions'] !== '50')) {
	$db_helper->insert_data('people',
			$_POST['ap-what'],
			$_POST['ap-impact'],
			pad($_POST['ap-interactions'], 'scalePreprocess')
	);
}

if (array_key_exists('note', $_POST) && !empty($_POST['note'])) {
	$db_helper->insert_data('notes', $_POST['note']);
}

$db_helper = null;
$user = null;
$dbh = null;

?>