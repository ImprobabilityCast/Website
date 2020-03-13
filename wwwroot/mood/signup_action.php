<?php

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
		|| FALSE === preg_match('/[~`!@#\$%\^&\*\(\)_\+\{\}\|"<>\?\-=\[\];\',\.]+/', $_POST['pass1'])) {
	
}

// create the user
$random_key = random_bytes(SODIUM_CRYPTO_SECRETBOX_KEYBYTES);
$iterations = 1000;

$nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
$derived_pwd_key = hash_pbkdf2('sha256', $_POST['pass1']. 'hjg', $nonce,
		$iterations, SODIUM_CRYPTO_SECRETBOX_KEYBYTES);
$pwd_key = $derived_pwd_key ^ $random_key;

$derived_backup_key = hash_pbkdf2('sha256', $_POST['email']. 'oiuyut', $nonce,
		$iterations, SODIUM_CRYPTO_SECRETBOX_KEYBYTES);
$backup_key = $derived_backup_key ^ $random_key;

echo '<br />' . $derived_pwd_key;
echo '<br />' . $derived_backup_key;
echo '<br />' . $pwd_key;
echo '<br />' . $backup_key;
echo '<br />' . ($derived_pwd_key ^ $pwd_key);
echo '<br />' . ($derived_backup_key ^ $backup_key);

// redirect user
?>
