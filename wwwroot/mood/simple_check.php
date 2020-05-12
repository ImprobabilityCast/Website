<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	http_response_code(404);
	echo file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/meta-pages/404.html');
	exit(0);
}
?>
