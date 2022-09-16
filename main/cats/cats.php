<html lang="en-US">
<?php require $_SERVER['DOCUMENT_ROOT'] . "/meta-pages/includes.php"; ?>
<link rel="stylesheet" type="text/css" href="/css/cats.css" />
<body>
<?php 
    $pics = glob("*.{png,jpg,JPG}", GLOB_BRACE);
    $len = count($pics);

    echo "<div class='head'><img class='head' src='", $pics[0], "'></div>\n";
    echo "<div id='right'>\n";
    for($x=1; $x<$len; $x++){
        echo "<img class='list' src='$pics[$x]' 
                alt='$pics[$x]'></img>\n";
        #if $x is greater than half of the $pic array,
        #then end this <div> and begin another
        if($x == floor($len / 2)){
            echo "</div><div id='left'>";
        }
    }
    echo "</div>";
?>
</body>
</html>
