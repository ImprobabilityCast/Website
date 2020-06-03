<?php
require_once 'mood_util.php';

if (array_key_exists('uname', $_GET)) {
	$dbh = create_db_conn();
	if (user_exists($dbh, $_GET['uname'])) {
		echo '1';
	} else {
		echo '0';
	}
}

?>
