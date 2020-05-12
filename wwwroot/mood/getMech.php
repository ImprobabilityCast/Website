<?php
session_start();

require_once 'mood_util.php';
require_once 'simple_check.php';
require_once 'login_check.php';

$dbh = create_db_conn();
$usr = new User($dbh);
$sql = 'SELECT mech FROM coping_mechs
    WHERE id=' . $usr->id . ' and still_used=TRUE;';
$dbh->query($sql);
$mech = $dbh->quote($usr->encryptData($_POST['mech']));

$usr = null;
$dbh = null;
?>
