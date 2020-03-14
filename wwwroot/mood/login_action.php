<?php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(404);
	echo file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/meta-pages/404.html');
	exit(0);
}
session_start();

// assume login info is correct, escape for sql
$dsn = 'mysql:host=localhost;dbname=mood';
$db_username = 'php';
$db_password = 'bcsdhj%^763SVOW+p2#S';
$options = array(PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION);
try {
	$dbh = new PDO($dsn, $db_username, $db_password, $options);
	$email = $dbh->quote($_POST['email']);
	$creds = $dbh->query("CALL mood.get_user_creds($email)");
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
			header("Location: /mood/");
			exit();
		} else {
			header("Location: /mood/login.php?wrong_pwd=1");
		}
	} else {
		header("Location: /mood/login.php?wrong_user=1");
	}
	
} catch (PDOException $e) {
	// do nothing bc, meh
}

?>