<?php
// do validation

// do the stuffs
echo "login action page";
echo strlen(password_hash("ksdjbcdhb", PASSWORD_BCRYPT)); // always a 60 char str
echo "<hr>" . strlen(hash("whirlpool", "data", FALSE));
?>