<?php

if ($_GET['cat'] != "") {
	$arg = escapeshellarg(stripslashes($_GET['cat']));
} else {
	$arg = "";
}

echo htmlspecialchars(shell_exec("/usr/games/fortune")) # . $arg));

?>
