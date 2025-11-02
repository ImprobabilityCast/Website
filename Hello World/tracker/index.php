<?php
namespace Tracker;

use PDO;
use PDOException;


$url = strtolower(urldecode($_POST['location']));
$server_name = "localhost";
$port = "3306";
$db_name = "localhost_stats";
$user = "tracker";
$pwd = "99%Hobbit";

try {
    $dns = "mysql:host=" . $server_name . ";port=" . $port
            . ";dbname=" . $db_name;
    $connection = new PDO($dns, $user, $pwd);
    $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] === "POST") {
        if (filter_var($url, FILTER_VALIDATE_URL) == FALSE) {
            header("Access Denied", true, 403);
            exit(0);
        }
        $url = $connection->quote($url);
        $sql = "CALL localhost_stats.log_visit($url)";
        $connection->exec($sql);
        echo "You've been tracked!";
    } else {
        $sql = "SELECT * FROM localhost_stats.tracking";
        $stmt = $connection->query($sql);
        
        echo "<!DOCTYPE html>";
        echo "<html lang='en-US'>";
        echo "<meta charset='UTF-8' />";
        echo "<meta name='viewport'
                content='width=device-width, initial-scale=1.0' />";
        
        require $_SERVER['DOCUMENT_ROOT'] . "/meta-pages/includes.php";
        
        echo "<link rel='stylesheet' type='text/css' href='tracker.css' />";
        echo "<body><a href='/'>Home</a><table><thead>";
        echo "<tr><th>URL</th><th>Visits</th><tr>";
        echo "</thead><tbody>";
        
        $res = $stmt->fetchAll();
        for ($row = 0; $row < $stmt->rowCount(); $row++) {
            echo "<tr>";
            for ($col = 0; $col < $stmt->columnCount(); $col++) {
                echo "<td>" . $res[$row][$col] . "</td>";
            }
            echo "</tr>";
        }
        echo "</tbody></table></body></html>";
    }
} catch (Exception $e) {
    // Clearly this is not suited for production. Never give potential hackers
    // such beatuiful error messages.
    echo print_r($e);
}
?>
