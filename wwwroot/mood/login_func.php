<?php
session_start();
require_once 'mood_util.php';

function login($raw_uname, $raw_pwd, $dbh = null) {
    // assume login info is correct, escape for sql
    if ($dbh === null) {
        $dbh = create_db_conn();
    }
    $uname = $dbh->quote($raw_uname);
    $query_str = "SELECT id, salt, pwd_dkey, pwd_hash
            FROM mood.users
            WHERE users.uname=$uname;";
    $creds = $dbh->query($query_str);
    if ($creds->rowCount() === 1) {
        $row = $creds->fetch(PDO::FETCH_ASSOC);
        if (password_verify($raw_pwd, $row['pwd_hash'])) {
            $derived_pwd_key = sodium_crypto_pwhash_scryptsalsa208sha256(
                SODIUM_CRYPTO_SECRETBOX_KEYBYTES,
                $raw_pwd,
                hex2bin($row['salt']),
                SODIUM_CRYPTO_PWHASH_SCRYPTSALSA208SHA256_OPSLIMIT_INTERACTIVE,
                SODIUM_CRYPTO_PWHASH_SCRYPTSALSA208SHA256_MEMLIMIT_INTERACTIVE
            );
            session_regenerate_id (true);
            $_SESSION['pwd_key'] = bin2hex($derived_pwd_key);
            $_SESSION['id'] = $row['id'];
            $_SESSION['uname'] = $uname;
            return 0;
        } else {
            return 1;
        }
    } else {
        return 2;
    }
}

?>
