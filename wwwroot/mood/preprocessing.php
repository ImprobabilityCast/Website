<?php

function numberPreprocess($value) {
	return str_pad($value, 5, '0', STR_PAD_LEFT);
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