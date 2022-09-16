<?php
//$dir = (substr(PHP_OS, 0, 3) == "WIN") ? "D:\\" : "/dev/cdrom/";
$dir = "../../Users/Public/Music/";
$arr = scandir($dir);
$length = count($arr);

header("Content-Type: audio/wav");
header("Content-Length: " . filesize($dir . $arr[2]));

if ($_GET['track'] !== null) {
	$index = $_GET['track'] + 2;
	readfile($dir . $arr[$index]);
} else {
	$index = 2;
	readfile($dir . $arr[$index]);
}

?>