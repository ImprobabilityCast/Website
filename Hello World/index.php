<?php
// check for invalid URLs
if (strlen($_SERVER["PATH_INFO"]) != 0) {
    require $_SERVER["DOCUMENT_ROOT"] . "/error-pages/404.html";
    exit(0);
} 
?>

<!DOCTYPE html>
<html lang="en-US">
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<?php require $_SERVER['DOCUMENT_ROOT'] . "/meta-pages/includes.php"; ?>

<style>
ul {
    list-style: none;
	float: left;
	width: 12em;
}
body {
	color: black;
	background-color: #eeeeee;
}
h1 {
	padding-bottom: 16px;
	border-bottom: solid 1px gray;
}
.blurb {
    float: left;
    width: 30%;
    text-align: justify;
}
footer {
	border-top: 1px solid gray;
	clear: left;
}
@media screen and (max-width: 400px) {
	ul, .blurb { width: 100%; }
}
</style>
<?php  

define(URL_SEPERATOR, "/");
$current_dir = getcwd();
$dir_array = scandir($current_dir); #gets an array of the current directory

#replaces the document root from the $current_dir string with '/'
$current_dir = str_replace($_SERVER['DOCUMENT_ROOT'], URL_SEPERATOR, $current_dir);

#to fix when the doc root var does not end in a '/'
$current_dir = str_replace(DIRECTORY_SEPARATOR, URL_SEPERATOR, $current_dir);
$current_dir = str_replace("//", URL_SEPERATOR, $current_dir);

echo "<title>",$current_dir,"</title><body><h1>Index of ",
		$current_dir, "</h1>\n";

$file_name = "blurb.txt";
if (file_exists($file_name)) {
    echo "<div class='blurb'>" . file_get_contents($file_name) . "</div>";
}

# This prints links to each file & directory in the current directory.
# Note that 'scandir()' returns a link to both the parent and current
# directories.  Therefore, $i starts at 1 to skip the link to the 
# current directory.

$len = count($dir_array);
for ($i = 1; $i < $len; $i++) {
	echo "<ul>";
    while ($i % 15 != 0 && $i < $len) {
        $url = str_replace(" ","%20", $dir_array[$i]);
        echo "<li><a href='$url'>$dir_array[$i]</a></li>\n";
        $i++;
    }
    echo "</ul>";
}

// See the note at the end of the php manual page for "get_browser()"
// before using it.  It depends on a file not included with php.
$array = get_browser($_SERVER['HTTP_USER_AGENT'], true);

// Signature
// $_SERVER['SERVER_SIGNATURE'] does not work on IIS
echo "<footer><i>",$_SERVER['SERVER_SOFTWARE'], " Server at ",
	$_SERVER['LOCAL_ADDR'], " port ", $_SERVER['SERVER_PORT'], "</i><address>",
	$array['browser'], "/", $array['version'], " Browser at ",
	$_SERVER['REMOTE_ADDR'], " port ", $_SERVER['REMOTE_PORT'],
	"</address></footer></body></html>";
?>
