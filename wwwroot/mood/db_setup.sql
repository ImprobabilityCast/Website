-- delte the old stuff if it exists
DROP USER 'php'@'localhost';
DROP DATABASE mood;

-- db setup script

CREATE DATABASE mood;

CREATE TABLE mood.users (
	nonce char(48) NOT NULL, -- SODIUM_CRYPTO_SECRETBOX_NONCEBYTES * 2
	-- SODIUM_CRYPTO_PWHASH_SCRYPTSALSA208SHA256_SALTBYTES * 2
	salt char(64) NOT NULL,
	recovery_dkey char(64) NOT NULL, -- SODIUM_CRYPTO_SECRETBOX_KEYBYTES * 2
	pwd_dkey char(64) NOT NULL, -- SODIUM_CRYPTO_SECRETBOX_KEYBYTES * 2
	pwd_hash char(60) NOT NULL,
	email varchar(254) NOT NULL,
	PRIMARY KEY(email)
);

CREATE USER 'php'@'localhost'
	IDENTIFIED BY 'bcsdhj%^763SVOW+p2#S';
GRANT EXECUTE ON mood.* TO 'php'@'localhost';

delimiter /
CREATE PROCEDURE mood.add_user (
		IN nonce char(48),
		IN salt char(64),
		IN recovery_dkey char(64),
		IN pwd_dkey char(64),
		IN pwd_hash char(60),
		IN email varchar(254)
	)
BEGIN
	INSERT INTO mood.users (nonce, salt, recovery_dkey,
			pwd_dkey, pwd_hash, email)
		VALUES(nonce, salt, recovery_dkey, pwd_dkey, pwd_hash, email);
END/

CREATE PROCEDURE mood.get_user_creds (
		IN email varchar(254)
	)
BEGIN
	SELECT salt, pwd_dkey, pwd_hash FROM mood.users
			WHERE users.email=email;
END/
delimiter ;

CALL mood.add_user(
	'18ff036c5549c9138acaa67a04e90cc3f70e620fca3cf9c6',
	'b75c36112b20e27ea3b12e1f36b5cc7926c5b1f5c17187c8f58e7e588f5a02a1',
	'eeebfddd1fcd7f4316294224f7f316b8e4a295d6bed4c3d8ba12b19796eb76ba',
	'752ad616d4c207c9c309bba25e29fcc1c25921723238c63bc12d107797ccb83c',
	'$2y$10$3TS14xFibYkTS5dYBxuCve2oDoG1FqOWrx99kVh6I7KoiFy4qrE/m',
	'demo@sugarfairyland.com'
);
