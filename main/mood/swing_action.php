<?php

session_start();
require_once 'login_check.php';
require_once 'post_check.php';
require_once 'mood_util.php';
require_once 'preprocessing.php';

$dbh = create_db_conn();
$user = new User($dbh);
$db_helper = new DBQueryHelper($user, $dbh);

if (valid_rating('mood-before', $_POST, 100)
		&& valid_rating('mood-after', $_POST, 100)) {
	$db_helper->insert_data('swings',
			$_POST['mood-trigger'],
			pad_binary($_POST['mood-before'], 7),
			pad_binary($_POST['mood-after'], 7)
	);
}

$dbh = null;
$user = null;
$db_helper = null;

header('Location: /mood/mood_swing.php');

?>
