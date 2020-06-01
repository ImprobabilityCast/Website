<?php

function randomShort($lorem) {
	return substr($lorem, rand(0, strlen($lorem) - 100), 100);
}

function randomLong($lorem) {
	return substr($lorem, rand(0, strlen($lorem) - 100), 500);
}

function randomRating($max = 1) {
	return rand(0, $max);
}

function timeHelper($hour) {
	$str = '';
	$min = rand(0, 59);
	if ($hour < 10) {
		$str = $str . '0';
	}
	$str = $str . $hour . ':';
	if ($min < 10) {
		$str = $str . '0';
	}
	$str = $str . $min;
	return [$hour * 100 + $min, $str];
}

function randomMorning() {
	$hour = rand(3, 10);
	return timeHelper($hour);
}

function randomEvening() {
	$hour = rand(19, 23);
	return timeHelper($hour);
}

function createPostArray() {
	$lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
	
	$post = array(
		'suicide-hidden' => '1',
		'harm-hidden' => '1',
		'depression-hidden' => '1',
		'anxiety-hidden' => '1',
		'fog-hidden' => '1',
		'anger-hidden' => '1',
		'food-hidden' => '1',
		'sleep-hidden' => '1',
		'people-hidden' => '1',
		'mood-overall' => randomShort($lorem),
		'mood-secondary' => randomShort($lorem),
		'suicidal-thoughts' => randomRating(3),
		'suicidal-urges' => randomRating(3),
		'suicidal-steps' => randomLong($lorem),
		'harm-where' => randomShort($lorem),
		'harm-tool' => randomShort($lorem),
		'harm-depth' => randomShort($lorem),
		'harm-emote-response' => randomLong($lorem),
		'harm-purpose' => randomRating(1),
		'energy' => randomRating(100),
		'motivation' => randomRating(100),
		'hygine' => randomRating(100),
		'anx-where' => randomLong($lorem),
		'anx-intensity' => randomRating(100),
		'panic-attack' => randomRating(1),
		'fog-speed' => randomRating(100),
		'forgets' => randomRating(3),
		'slurrs' => randomRating(3),
		'anger-exp' => randomLong($lorem),
		'anger-thoughts' => randomLong($lorem),
		'veggies' => randomRating(1),
		'sleep-quality' => randomRating(1),
		'meds' => randomLong($lorem),
		'ap-what' => randomLong($lorem),
		'ap-impact' => randomLong($lorem),
		'ap-interactions' => randomRating(100),
		'note' => randomLong($lorem),
	);
	
	$morn = randomMorning();
	$eve = randomEvening();
	$awake = rand(0, ($eve[0] - $morn[0]) / 100);
	$post['fell-asleep'] = $eve[1];
	$post['woke-up'] = $morn[1];
	$post['sleep-spent-awake'] = $awake;
	$post['wake-to-eat-time'] = rand(0, 12) / 4;
	$post['food-to-food-time'] = rand(16, 48) / 4;

	return $post;
}

// https://stackoverflow.com/a/25098798/8335309
function cookieMan($ch, $headerLine) {
	global $cookie;
	if (preg_match('/^Set-Cookie:\s*([^;]*)/mi', $headerLine, $matches)) {
		$cookie = $matches[1];
	}
	return strlen($headerLine);
}

function createOptions($url, $post_str) {
	global $cookie;
	return array(
		CURLOPT_URL => $url,
		CURLOPT_POST => true,
		CURLOPT_POSTFIELDS => $post_str,
		CURLOPT_FOLLOWLOCATION => true,
		CURLOPT_VERBOSE => true,
		CURLOPT_HEADERFUNCTION => 'cookieMan',
		CURLOPT_COOKIE => $cookie,
	);
}

function login($ch) {
	$url = 'http://100.115.92.206/mood/login_action.php';
	$login_str = http_build_query(array(
		'email' => 'demo@sugarfairyland.com',
		'password' => 'hunter2',
	));
	$options = createOptions($url, $login_str);
	curl_setopt_array($ch, $options);
	curl_exec($ch);
}

function postData($ch) {
	$url = 'http://100.115.92.206/mood/mood_today_action.php';
	$data_str = http_build_query(createPostArray());
	$options = createOptions($url, $data_str);
	curl_setopt_array($ch, $options);
	curl_exec($ch);
}

$ch = curl_init();
login($ch);
$num = (count($argv) == 2 && is_numeric($argv[1])) ? $argv[1] : 1;

while ($num > 0) {
	postData($ch);
	echo 'taking a short break...';
	sleep(5);
	$num -= 1;
}

curl_close($ch);
echo "\n";
?>
