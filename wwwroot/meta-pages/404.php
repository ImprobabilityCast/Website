<?php http_response_code(404); ?>
<!DOCTYPE html>
<!-- 404 Error Page -->
<html lang='en-US'>
<title>404 Not Found</title>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0' />
<link rel='stylesheet' type='text/css'
	href='/css/error.css' />
<body>
<span>404</span>
<h1>Not Found</h1>
<p>The requested URL
<i> <?php echo htmlspecialchars($_SERVER['REQUEST_URI']); ?> </i>
was not found on this server</p>
<a href='http://<?php echo $_SERVER['SERVER_NAME']; ?>'>Home</a>
<hr>
<p><i><?php echo $_SERVER['SERVER_SOFTWARE']; ?></i></p>
</body>
</html>
