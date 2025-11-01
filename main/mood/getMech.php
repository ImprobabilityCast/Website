<?php
session_start();

require_once 'mood_util.php';
require_once 'login_check.php';

$dbh = create_db_conn();
$usr = new User($dbh);
$sql = 'SELECT mech FROM coping_mechs WHERE id=' . $usr->id . ' and still_used=TRUE;';
$statement = $dbh->query($sql);
while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
    echo "\n", $usr->decryptData($row['mech']);
}

$statement = null;
$usr = null;
$dbh = null;
?>
