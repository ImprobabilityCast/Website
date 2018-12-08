<?php

# A short script to keep browscap.ini up to date. - 12/8/2018

# get local version
$browscap_file = "C:/Program Files/PHP/extras/lite_php_browscap.ini";
$file = fopen($browscap_file, "r");
$line = "dummy";
while ($line !== FALSE && strpos($line, "Version=") === FALSE) {
    $line = fgets($file);
}

fclose($file);

if ($line !== FALSE) {
    $local_v = trim(substr($line, strlen("Version=")));
    
    # get remote version
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "http://browscap.org/version-number");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_VERBOSE, TRUE);
    $remote_v = trim(curl_exec($ch));
    
    echo "\nInstalled version:\t" , $local_v, "\n";
    echo "Current version:\t" , $remote_v, "\n";
    
    # compare & exec
    if ((int) $local_v < (int) $remote_v) {
        echo "Updating the browscap.ini file\n";
        curl_setopt($ch, CURLOPT_URL, "http://browscap.org/stream?q=Lite_PHP_BrowsCapINI");
        $file = fopen($browscap_file, "r+");
        if ($file === FALSE) {
            echo "Could not open '", $browscap_file , "'";
        } else {
            curl_setopt($ch, CURLOPT_FILE, $file);
            curl_exec($ch);
            fclose($file);
        }
    } else {
        echo "Up to date.\n";
    }
    curl_close($ch);
}

?>
