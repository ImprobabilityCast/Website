<?php require "../meta-pages/head.php" ?>
<style>
* { box-sizing: border-box; }
*:focus { outline: none; }
body {
	color: #aaa;
	background: #111;
}
input[type=submit]:hover, 
input[type=file]:hover {
	cursor: pointer;
}
fieldset {
	width: 300px;
}
</style>
<script>
function platClick(l){
	switch (l) {
		case "L":
			document.getElementById("L").checked = true;
			break;
		case "W":
			document.getElementById("W").checked = true;
			break;
		case "32":
			document.getElementById("32").checked = true;
			break;
		case "64":
		default:
			document.getElementById("64").checked = true;
	}
}
function msg(){
	document.getElementById("msg").innerHTML = "Working..."
}
</script>
<body>
	<form action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>"
		method="post" enctype="multipart/form-data">
		<fieldset>
		<legend>Platform</legend>
			<span onclick="platClick('L')">
				<input type="radio" name="platform" value="linux" id="L" />
				<label for="linux">Linux</label>
			</span>
			<br>
			<span onclick="platClick('W')">
				<input type="radio" name="platform" value="win32" 
					id="W" checked />
				<label for="win32">Win32</label>
			</span>
			<br>
		</fieldset>
		<fieldset>
		<legend>Architecture</legend>
			<span onclick="platClick('32')">
				<input type="radio" name="architecture" value="32" id="32" />
				<label for="32">x32 bit</label>
			</span>
			<br>
			<span onclick="platClick('64')">
				<input type="radio" name="architecture" value="64" 
					id="64" checked />
				<label for="64">x64 bit</label>
			</span>
			<br>
		</fieldset>
		<br>
		<input type="file" name="file2up" id="file2up" />
		<input type="submit" name="submit" value="Upload" 
			onclick="msg()"/>
	</form>
	<p id="msg"></p>
<?php

if ($_SERVER["REQUEST_METHOD"] === "POST") {
	$upDir = "./src/";
	$objDir = "./objs/";
	$outDir = "./bin/";
	
	$inFile = $upDir . basename($_FILES['file2up']['name']);
	$objFile = $objDir . basename($inFile,".cpp") . ".o";
	$outFile = $outDir . basename($inFile,".cpp");

	$Ok = true;
	
	if($_POST['platform'] === "win32"){
		$outFile .= ".exe";
		if ($_POST['architecture'] === "64") {
			$app = "x86_64-w64-mingw32-g++-win32";
		} else {
			$app = "i686-w64-mingw32-g++-win32";
		}
	}
	else {
		if ($_POST['architecture'] === "64") {
			$app = "g++ ";
		} else {
			$app = "i686-w64-mingw32-g++-posix";
		}
	}
	
	
	if ($_FILES["file2up"]["size"] > 5000000) { //5MB
		echo "<p>Sorry, your file is too large.</p>\n";
		$Ok = false;
	}
	if($Ok){
		if(file_exists($inFile))
			if(!unlink($inFile))
				echo "<p>File on server could not be deleted</p>\n";
				
		if(move_uploaded_file($_FILES["file2up"]["tmp_name"], $inFile)){
			echo "<p>The file '", basename( $_FILES["file2up"]["name"]),
				"' has been uploaded.</p>\n";

			$cmd =  $app . " " .
					$inFile . 
					" -o " . 
					$outFile . 
					" 2>&1"; //so you can see ALL the output
			echo "<p>\$ $cmd</p>\n";
			$cout = shell_exec($cmd);
			
			if(strlen($cout) === 0){
				echo "<p style='color: green;'>Successful.</p>\n<p>";
			}
			else{
				echo "<pre style='color: red;'>", $cout, "</pre>";
				$Ok = false;
			}
		} else {
			echo "<p>Sorry, there was an error uploading your file.</p>",
				'<p>', basename($_FILES['file2up']['name']),
				$inFile, '</p>',
				'<p>', $_FILES["file2up"]["tmp_name"], '</p><p>';
			print_r($_FILES);
			echo '</p>';
			$Ok = false;
		}
	}
	
	if($Ok){
		echo "<script>
			window.onload = function () {
				window.location='$outFile';
			}
			</script>";
	}
}
?>
</body>
</html>
