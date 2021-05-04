<?php

function create_db_conn() {
	$dsn = 'mysql:host=localhost;dbname=mood';
	$db_username = 'php';
	$db_password = 'bcsdhj%^763SVOW+p2#S';
	$options = array(PDO::ATTR_ERRMODE=>PDO::ERRMODE_WARNING);
	try {
		$dbh = new PDO($dsn, $db_username, $db_password, $options);
	} catch (PDOException $e) {
		error_log($e->getMessage());
	}
	return $dbh;
}

function valid_rating(string $key, array $array, $max) {
	return array_key_exists($key, $array)
			&& $array[$key] >= 0 && $array[$key] <= $max;
}

function user_exists($dbh, $uname) {
	$sql = 'SELECT id FROM users WHERE uname=?;';
	$stmt = $dbh->prepare($sql);
	$stmt->bindParam(1, $uname);
	$stmt->execute();
	return $stmt->rowCount() == 1;
}

class User {
	public $id;
	
	private $nonce;
	private $key;
	
	function __construct($dbh) {
		$pwd_dkey = hex2bin($_SESSION['pwd_key']);
		$this->id = $_SESSION['id'];
		$sql = "SELECT * FROM users WHERE id=$this->id;";
		$creds = $dbh->query($sql);
		
		if ($creds->rowCount() == 1) {
			$row = $creds->fetch(PDO::FETCH_ASSOC);
			$this->nonce = hex2bin($row['nonce']);
			$this->key = $pwd_dkey ^ hex2bin($row['pwd_dkey']);
		} else {
			error_log("User $id does not exist in database");
		}
	}
	
	// the output length is a min of 16 bytes
	function encryptData($text) {
		return sodium_crypto_secretbox($text, $this->nonce, $this->key);
	}
	
	function decryptData($cipher_text) {
		return sodium_crypto_secretbox_open($cipher_text, $this->nonce, $this->key);
	}
}

class DBQueryHelper {
	private $timestamp;
	private $user;
	private $dbh;
	
	function __construct($user, $dbh) {
		$this->user = $user;
		$this->dbh = $dbh;
		$this->timestamp = gmdate('\'Y-m-d H:i:s\'', time());
	}

	public function get_timestamp() {
		return $this->timestamp;
	}

	public function swap_timestamp($stamp) {
		$old = $this->timestamp;
		$this->timestamp = $stamp;
		return $old;
	}
	
	public function insert_data(string $table, string ...$values) {
		array_walk($values, array($this, 'encrypt'));
		
		$values_str = implode(', ', $values);
		$id = $this->user->id;
		$sql = "INSERT INTO $table
				VALUES($id, $this->timestamp, $values_str);";
		if ($id == 1) { // prevent anyone but the one user from making changes
			$this->dbh->query($sql);
		}
	}
	
	private function encrypt(&$value, $key) {
		$value = $this->dbh->quote($this->user->encryptData($value));
	}
}

?>
