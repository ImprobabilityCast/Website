<?php
require_once 'mood_util.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(404);
	echo file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/meta-pages/404.html');
	exit(0);
}
session_start();

// assume login info is correct, escape for sql
$dbh = create_db_conn();
$email = $dbh->quote($_POST['email']);
$query_str = "SELECT salt, pwd_dkey, pwd_hash
		FROM mood.users
		WHERE users.email=$email;";
$creds = $dbh->query($query_str);
if ($creds->rowCount() === 1) {
	$row = $creds->fetch(PDO::FETCH_ASSOC);
	if (password_verify($_POST['password'], $row['pwd_hash'])) {
		$derived_pwd_key = sodium_crypto_pwhash_scryptsalsa208sha256(
			SODIUM_CRYPTO_SECRETBOX_KEYBYTES,
			$_POST['password'],
			hex2bin($row['salt']),
			SODIUM_CRYPTO_PWHASH_SCRYPTSALSA208SHA256_OPSLIMIT_INTERACTIVE,
			SODIUM_CRYPTO_PWHASH_SCRYPTSALSA208SHA256_MEMLIMIT_INTERACTIVE
		);
		$_SESSION['pwd_key'] = bin2hex($derived_pwd_key);
		$_SESSION['email'] = $email;
		header("Location: /mood/");
		exit();
	} else {
		header("Location: /mood/login.php?wrong_pwd=1");
	}
} else {
	header("Location: /mood/login.php?wrong_user=1");
}

?>