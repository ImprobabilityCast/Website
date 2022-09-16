<?php
// disable signup
exit(); 

require_once 'mood_util.php';
require_once 'post_check.php';
require_once 'login_func.php';

function normalize($str) {
	return preg_replace('/\s/', ' ', strtoupper(trim($str)));
}

// validation

// check password requirements
if (strlen($_POST['pass1']) < 10
		|| FALSE === preg_match('/[a-z]+/i', $_POST['pass1'])
		|| FALSE === preg_match('/[0-9]+/', $_POST['pass1'])
		|| FALSE === preg_match('/[~`\!@#\$%\^&\*\(\)_\+\{\}\|"<>\?\-\=\[\];\',\.]+/',
				$_POST['pass1'])) {
	header('Location: signup.html');
	exit();
}

// check if user already exists
$dbh = create_db_conn();
if (empty($_POST['uname'])
		|| user_exists($dbh, $_POST['uname'])) {
	$stmt = null;
	$dbh = null;
	header('Location: signup.html');
	exit();
}

// create the user
$iterations = SODIUM_CRYPTO_PWHASH_SCRYPTSALSA208SHA256_OPSLIMIT_INTERACTIVE;
$mem_limit = SODIUM_CRYPTO_PWHASH_SCRYPTSALSA208SHA256_MEMLIMIT_INTERACTIVE;
$key_length = SODIUM_CRYPTO_SECRETBOX_KEYBYTES;
$random_key = random_bytes($key_length);
$salt = random_bytes(SODIUM_CRYPTO_PWHASH_SCRYPTSALSA208SHA256_SALTBYTES);
$nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
$backup_pwd = normalize($_POST['sec-q-1-a']) . normalize($_POST['sec-q-2-a']);

$derived_pwd_key = sodium_crypto_pwhash_scryptsalsa208sha256(
	$key_length,
	$_POST['pass1'],
	$salt,
	$iterations,
	$mem_limit
);
$pwd_key = $derived_pwd_key ^ $random_key;

$derived_recovery_key = sodium_crypto_pwhash_scryptsalsa208sha256(
	$key_length,
	$backup_pwd,
	$salt,
	$iterations,
	$mem_limit
);
$recovery_key = $derived_recovery_key ^ $random_key;

$sql = 'INSERT INTO mood.users
		(nonce, salt, recovery_dkey, pwd_dkey, pwd_hash,
		uname, sec_q_1, sec_q_2, sec_a_hash)
		VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);';
$stmt = $dbh->prepare($sql);

$nonce = bin2hex($nonce);
$salt = bin2hex($salt);
$recovery_key = bin2hex($recovery_key);
$pwd_key = bin2hex($pwd_key);
$pass_hash = password_hash($_POST['pass1'], PASSWORD_BCRYPT);
$backup_pwd_hash = password_hash($backup_pwd, PASSWORD_BCRYPT);

$stmt->bindParam(1, $nonce);
$stmt->bindParam(2, $salt);
$stmt->bindParam(3, $recovery_key);
$stmt->bindParam(4, $pwd_key);
$stmt->bindParam(5, $pass_hash);
$stmt->bindParam(6, $_POST['uname']);
$stmt->bindParam(7, $_POST['sec-q-1']);
$stmt->bindParam(8, $_POST['sec-q-2']);
$stmt->bindParam(9, $backup_pwd_hash);

if (FALSE === $stmt->execute()) {
	error_log("could not create new user: " . $_POST['uname']);
	$dbh = null;
	$stmt = null;
	exit();
}

session_start();
login($_POST['uname'], $_POST['pass1'], $dbh);

$dbh = null;
$stmt = null;

?>

<html>
<body>
<div><a href="/mood/">Redirecting...</a></div>
<script>
(function () {
	var removeIDs = [
		'sec-q-1',
		'sec-q-1-a',
		'sec-q-2',
		'sec-q-2-a',
		'uname'
	];
	for (var id of removeIDs) {
		localStorage.removeItem(id);
		console.log('removing: ' + id);
	}
	window.location = '/mood/';
})();
</script>
</body>
</html>
