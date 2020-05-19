<?php
session_start();
require_once 'login_check.php';
require_once 'history_helper.php';

if (!array_key_exists('start', $_GET) || !array_key_exists('end', $_GET)) {
    exit(1);
}

$history = new HistoryHelper();

?>
