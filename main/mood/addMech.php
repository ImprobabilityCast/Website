<?php
session_start();

require_once 'mood_util.php';
require_once 'post_check.php';
require_once 'login_check.php';

$dbh = create_db_conn();
$usr = new User($dbh);
$mech = $dbh->quote($usr->encryptData($_POST['mech']));
$sql = 'SELECT * FROM coping_mechs WHERE mech=' . $mech;
if ($dbh->query($sql)->rowCount() === 0) {
    $sql = 'INSERT INTO coping_mechs(id, mech) VALUES(' . $usr->id . ','. $mech . ');';
} else {
    $sql = 'UPDATE coping_mechs SET still_used=TRUE WHERE id=' . $usr->id . ' AND mech=' . $mech;
}
$dbh->query($sql);

$usr = null;
$dbh = null;
?>
