<?php

function scale2bin(string $value, array $acceptable_values) {
	return array_search($value, $acceptable_values, true);
}

function ratingPreprocess($value) {
	global $ratings;
	return scale2bin($value, $ratings);
}

function mechPreprocess($value) {
	$mech_ratings = ['helpful', 'not-helpful'];
	return scale2bin($value, $mech_ratings);
}

function harmRatingPreprocess($value) {
	global $harm_ratings;
	return scale2bin($value, $harm_ratings);
}

function sleepRatingPreprocess($value) {
	global $sleep_ratings;
	return scale2bin($value, $sleep_ratings);
}

function scalePreprocess($value) {
	return str_pad($value, 3, '0', STR_PAD_LEFT);
}

function hoursPreprocess($value) {
	return str_pad($value, 5, '0', STR_PAD_LEFT);
}

function timePreprocess($value) {
	return substr($value, 0, 2) . substr($value, 3, 2);
}

function dummy($value) {
	return $value;
}

function pad(string $text, callable $preprocess) {
	$value = call_user_func($preprocess, $text);
	// 32 is column width
	// 16 is number of bytes added to secretbox output
	$padding = 32 - (strlen($value) + 16);
	return random_bytes($padding) . $value;
}

?>