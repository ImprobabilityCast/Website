<?php
session_start();
require_once 'mood_util.php';
require_once 'post_check.php';
require_once 'login_func.php';

$result = login($_POST['uname'], $_POST['password']);
if ($result === 0) {
	header('Location: /mood/');
} else {
	header('Location: /mood/login.php?error=' . $result);
}

?>