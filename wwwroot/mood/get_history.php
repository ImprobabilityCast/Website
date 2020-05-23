<?php
session_start();
require_once 'login_check.php';
require_once 'history_helper.php';

if (!array_key_exists('start', $_GET) || !array_key_exists('end', $_GET)) {
    exit(1);
}

$history = new HistoryHelper($_GET['start'], $_GET['end']);

$data['basic_mood'] = $history->basic_mood();
$data['suicide'] = $history->suicide();
$data['self_harm'] = $history->self_harm();
$data['depression'] = $history->depression();
$data['anxiety'] = $history->anxiety();
$data['fog'] = $history->fog();
$data['anger'] = $history->anger();
$data['food'] = $history->food();
$data['sleep'] = $history->sleeps();
$data['people'] = $history->people();
$data['swings'] = $history->swings();
$data['notes'] = $history->notes();
$history = null;

header('Content-Type: text/json');
echo json_encode($data);

?>
