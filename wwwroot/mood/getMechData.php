<?php
session_start();
require_once 'login_check.php';
require_once 'mood_util.php';

if (!array_key_exists('start', $_GET) || !array_key_exists('end', $_GET)) {
    exit();
}

function count_mechs($user, $mech_arr) {
    $data = [];
    foreach ($mech_arr as $value) {
        $mech = $user->decryptData($value['mech']);
        $helpful = $user->decryptData($value['helpul'])[-1];
        if (!array_key_exists($key, $data)) {
            $data[$key] = ['helpful' => 0, 'total' => 0];
        }
        if ($helpful == 1) {
            $data[$key]['helpful']++;
        }
        $data[$key]['total']++;
    }
    return $data;
}

$dbh = create_db_conn();
$start = $_GET['start'];
$end = $_GET['end'];
$user = new User($dbh);
$sql = 'SELECT mech, helpful FROM coping_mechs_help
    WHERE id=? AND stamp>=? AND stamp<=?';
$statement = $dbh->prepare($sql);
$statement->bindParam(1, $user->id);
$statement->bindParam(2, $start);
$statement->bindParam(3, $end);

$statement->execute();
$data = $statement->fetchAll(PDO::FETCH_ASSOC);
$data = count_mechs($data);

$statement = null;
$user = null;
$dbh = null;

header('Content-Type: text/json');
echo json_encode($data);

?>
