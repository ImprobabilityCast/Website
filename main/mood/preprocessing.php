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

// note that the max of max_bits is 8
function pad_binary($value, int $num_bits) {
	// 32 is column width
	// 16 is number of bytes added to secretbox output
	$padding = 32 - (1 + 16);
	$value = (random_int(0, 255) << $num_bits) | ($value * 1);
	return random_bytes($padding) . chr($value);
}

?>