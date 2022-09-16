<?php
try{
	throw new Exception("yogi");
}
catch(Exception $e){
	//header($_SERVER['SERVER_PROTOCOL'] . " 500 Internal Server Error", 500);
	//header("Location: 500.php", 500);
	require $_SERVER["DOCUMENT_ROOT"] . "/meta-pages/500.php";
}

?>
