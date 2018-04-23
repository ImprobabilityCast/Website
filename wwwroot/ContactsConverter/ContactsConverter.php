<?php
$key = $user = $process_error = "";

if ($_SERVER['REQUEST_METHOD'] === "POST") {
	$key = $_POST['key']; $user = $_POST['user'];
	if ( empty($key) || empty($user) )
		$process_error = "Password and username fields are required, duh.";
	else {
		$login_array = ["login_username" => $user, "secretkey" => $key];

		$get_book_array = array(
			CURLOPT_URL => "http://wm.integrity.com/plugins/abook_import_export/address_book_export.php",
			CURLOPT_POSTFIELDS => NULL
		);

		$defaults = array(
			CURLOPT_URL => "http://wm.integrity.com/src/redirect.php",
			CURLOPT_POST => true,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_FAILONERROR => true,
			CURLOPT_POSTFIELDS => http_build_query($login_array),
			CURLOPT_COOKIEJAR => "cookies.txt",
			CURLOPT_COOKIEFILE => "cookies.txt",
			CURLOPT_USERAGENT => 
				"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36
				 (KHTML, like Gecko) Ubuntu Chromium/58.0.3029.110
				 Chrome/58.0.3029.110 Safari/537.36"
		);

		$ch = curl_init();
		curl_setopt_array($ch, $defaults);
		// attempt login
		curl_exec($ch);
		if (curl_errno($ch) !== 0)
			$process_error = curl_error($ch);
		else {
			// attempt to download addressbook
			curl_setopt_array($ch, $get_book_array);
			$fd = fopen("integrity.csv", "w+");
			if ($fd !== FALSE) {
				$csvText = curl_exec($ch);
				if (curl_errno($ch) === 0) {
					fwrite($fd, $csvText);
                    
					// convert address book
                    if (substr(PHP_OS, 0, 3) === "WIN") {
                        $cmd = "./Integrity2gmail.exe";
                    } else {
                        $cmd = "./Integrity2gmail";
                    }
					exec("$cmd integrity.csv", $arr, $ret);
                    
					if ($ret !== 0) {
						for($i=0; $i<count($arr); $i++)
							$process_error .= "\n" . $arr[$i];
						$process_error .= "\nProcess returned: $ret";
					}
					else {
						// send converted address book to client
						header("Content-Disposition: attachment; filename=gmail.csv");
						unlink("gmail.csv");
					}
				}
				else
					$process_error = curl_error($ch);
				fclose($fd);
				unlink("integrity.csv");
			}
			else
				$process_error = "File could not be opened.";
		}
		curl_close($ch);
	}
}
if ($process_error !==  "") {
    echo '<pre style="color: red; background-color: white;">';
	if ($process_error === 0)
		echo "FAILED\n\nMaybe wrong password or username?";
	else echo $process_error, "</pre>";
}
?>
