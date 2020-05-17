<?php
session_start();
require_once 'login_check.php';
require_once 'mood_util.php';

if (!array_key_exists('start', $_GET) || !array_key_exists('end', $_GET)) {
    exit();
}

$dbh = create_db_conn();
$start = $_GET['start'];
$end = $_GET['end'];
$col_val = 'helpful';
$user = new User($dbh);
$sql = 'SELECT mech, COUNT(helpful) AS help FROM coping_mechs_help WHERE id=?
    AND stamp>=? AND stamp<=? AND helpful=? GROUP BY mech';
$statement = $dbh->prepare($sql);
$statement->bindParam(1, $user->id);
$statement->bindParam(2, $start);
$statement->bindParam(3, $end);
$statement->bindParam(4, $col_val);

$statement->execute();
$data = [];
while ($row = $statement->fetch(PDO::FETCH_OBJ)) {
    $mech = $user->decryptData($row->mech);
    $data[$mech] = ['helpful' => $row->help, 'unhelpful' => 0];
}

$statement->closeCursor();
$col_val = 'not-helpful';
$statement->execute();
while ($row = $statement->fetch(PDO::FETCH_OBJ)) {
    $mech = $user->decryptData($row->mech);
    if (array_key_exists($mech, $data)) {
        $data[$mech]['unhelpful'] = $row->help;
    } else {
        $data[$mech] = ['helpful' => 0, 'unhelpful' => $row->help];
    }
}

$statement = null;
$user = null;
$dbh = null;

echo json_encode($data);

?>
