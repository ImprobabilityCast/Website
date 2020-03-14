<?php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(404);
	echo file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/meta-pages/404.html');
	exit(0);
}

function badInput() {
	
}


// validation

// email regex
// https://stackoverflow.com/a/8829363/8335309
// https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
$email_regex = '/\A[a-zA-Z0-9.!#$%&\'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\z/';

if (FALSE === preg_match($email_regex, $_POST['email'])) {
	
}

// check password requirements
if (strlen($_POST['pass1']) < 16
		|| FALSE === preg_match('/[a-z]+/i', $_POST['pass1'])
		|| FALSE === preg_match('/[0-9]+/', $_POST['pass1'])
		|| FALSE === preg_match('/[~`\!@#\$%\^&\*\(\)_\+\{\}\|"<>\?\-\=\[\];\',\.]+/',
				$_POST['pass1'])) {
	
}

// create the user
$iterations = SODIUM_CRYPTO_PWHASH_SCRYPTSALSA208SHA256_OPSLIMIT_INTERACTIVE;
$mem_limit = SODIUM_CRYPTO_PWHASH_SCRYPTSALSA208SHA256_MEMLIMIT_INTERACTIVE;
$key_length = SODIUM_CRYPTO_SECRETBOX_KEYBYTES;
$random_key = random_bytes($key_length);
$salt = random_bytes(SODIUM_CRYPTO_PWHASH_SCRYPTSALSA208SHA256_SALTBYTES);
$nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);

$derived_pwd_key = sodium_crypto_pwhash_scryptsalsa208sha256(
	$key_length,
	$_POST['pass1'],
	$salt,
	$iterations,
	$mem_limit
);
$pwd_key = $derived_pwd_key ^ $random_key;

// in the future, use security questions
$derived_recovery_key = sodium_crypto_pwhash_scryptsalsa208sha256(
	$key_length,
	$_POST['email'],
	$salt,
	$iterations,
	$mem_limit
);
$recovery_key = $derived_recovery_key ^ $random_key;

// create db connection
$dsn = 'mysql:host=localhost;dbname=mood';
$username = 'php';
$password = 'bcsdhj%^763SVOW+p2#S';
$options = array(PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION);
try {
	$dbh = new PDO($dsn, $username, $password, $options);
	$sql = "CALL mood.add_user('"
		. bin2hex($nonce) . "','"
		. bin2hex($salt) . "','"
		. bin2hex($recovery_key) . "','"
		. bin2hex($pwd_key) . "','"
		. password_hash($_POST['pass1'], PASSWORD_BCRYPT) . "',"
		. $dbh->quote($_POST['email']) . ");";
	echo $sql;
	if (FALSE === $dbh->exec($sql)) {
		echo "Mission failed";
	}
	$dbh = null;
} catch (PDOException $e) {
	// do nothing, because meh
	echo $e->getMessage();
}

// redirect user
//header("Location: /mood/");
?>
