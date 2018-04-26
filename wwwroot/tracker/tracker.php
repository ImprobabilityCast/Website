<?php
namespace Tracker;

use PDO;
use PDOException;


$url = urldecode($_POST['location']);
$server_name = "localhost";
$port = "3306";
$db_name = "localhost_stats";
$user = "tracker";
$pwd = "99%Hobbit";

if ($_SERVER['REQUEST_METHOD'] != "POST"
    || filter_var($url, FILTER_VALIDATE_URL) == FALSE) {
    header("Access Denied", true, 403);
    exit(0);
}

// Clearly this is not suited for production. Never give potential hackers
// such beatuiful error messages.

try {
    $dns = "mysql:host=" . $server_name . ";port=" . $port
            . ";dbname=" . $db_name;
    $connection = new PDO($dns, $user, $pwd);

    $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $url = $connection->quote($url);
    $sql = "CALL localhost_stats.log_visit($url)";
    $connection->exec($sql);
    echo "You've been tracked!";
} catch (Exception $e) {
    echo print_r($e);
}

?>
