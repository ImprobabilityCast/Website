<?php http_response_code(403); ?>
<!DOCTYPE html>
<!-- 403 Error Page -->
<html lang='en-US'>
<title>403 Forbidden</title>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0' />
<link rel='stylesheet' type='text/css'
	href='/css/error.css' />
<style>
h1 { color: red }
</style>
<body>
<span>403</span>
<h1>Forbidden</h1>
<p>You do not have permission to access
<i> <?php echo htmlspecialchars($_SERVER['REQUEST_URI']); ?> </i>
on this server</p>
<a href='https://<?php echo $_SERVER['SERVER_NAME']; ?>'>Home</a>
<hr>
<p><i><?php echo $_SERVER['SERVER_SOFTWARE']; ?></i></p>
</body>
</html>
