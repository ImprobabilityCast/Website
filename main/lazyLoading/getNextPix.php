<?php

function is_valid_request() {
    return ($_SERVER["REQUEST_METHOD"] == "POST")
        && is_numeric($_POST["index"])
        && is_numeric($_POST["num"]);
}

function main_func($index, $num) {
    $file_list = array_values(array_diff(
            scandir($_SERVER["DOCUMENT_ROOT"] ."/images/Oak_Island_2017/"),
            array("..", ".")
            ));
    $max_index = count($file_list) - 1;
    
    if (($index <= $max_index) && ($num + $index <= $max_index)) {
        $end = $index + $num;
        for ($i = $index; $i < $end; $i++) {
            echo "<img src='/images/Oak_Island_2017/"
                    . $file_list[$i] . "'>";
        }
    }
}

if (is_valid_request()) {
    main_func(intval($_POST["index"]), intval($_POST["num"]));
} else {
    http_response_code(403);
}

?>