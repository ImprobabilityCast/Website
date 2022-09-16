<?php
if (!array_key_exists('id', $_SESSION)) {
	http_response_code(303);
	header("location: login.php");
	exit(0);
}
?>