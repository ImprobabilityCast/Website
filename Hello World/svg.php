<!DOCTYPE html>
<html lang="en-US">
<meta charset="UTF-8" />
<body>
<?php
function get_svg_files($array){
	return (strripos($array, ".svg") ||
			strripos($array, ".svgz") );
}
try{
	$files = scandir("./svg/");
	$svg_files = array_values(array_filter($files, "get_svg_files"));
	// array_values() - returns all values, reindexed
	$len = count($svg_files);
	for($i=0; $i<$len; $i++){
		echo "<a href='../svg/" . $svg_files[$i] . "'>";
		echo file_get_contents("../svg/" . $svg_files[$i]);
		echo "</a>\n";
	}
}
catch(Exception $e){
	include "500.php";
}
?>
</body>
</html>
