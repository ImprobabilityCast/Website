<?php http_response_code(500); ?>
<!DOCTYPE html>
<!-- 500 Error Page -->
<html lang='en-US'>
<title>500 Internal Server Error</title>
<meta charset='UTF-8'>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="stylesheet" type="text/css"
	href="/css/error.css" />
<body>
<span>500</span>
<h1>Internal Server Error</h1>
<p>The server made a boo boo.</p>
<a href='https://<?php echo $_SERVER['SERVER_NAME']; ?>'>Home</a>
<hr>
<p><i><?php echo $_SERVER['SERVER_SOFTWARE']; ?></i></p>
</body>
</html>
