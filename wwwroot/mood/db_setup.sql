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
	PRIMARY KEY (email)
);

CREATE TABLE mood.coping_mechs (
	email varchar(254) NOT NULL,
	mech varchar(128) NOT NULL,
	PRIMARY KEY (email, mech),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.coping_mechs_help (
	email varchar(254) NOT NULL,
	mech varchar(128) NOT NULL,
	stamp datetime NOT NULL,
	helpful ENUM('none', '1-5', '5-10', 'over 10') NOT NULL,
	PRIMARY KEY (email, mech, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email),
	FOREIGN KEY (mech) REFERENCES mood.ucoping_mechs(mech)
);

CREATE TABLE mood.basic_mood (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	overall varchar(128),
	secondary varchar(128),
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.suicide (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	thoughts ENUM('none', '1-5', '5-10', 'over-10'),
	urges ENUM('none', '1-5', '5-10', 'over-10'),
	steps varchar(512),
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.self_harm (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	place varchar(512),
	tool_used varchar(128),
	how_deep varchar(128),
	emote_response varchar(512),
	purpose ENUM('to-bleed', 'to-hurt'),
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.depression (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	energy tinyint unsigned,
	motivation tinyint unsigned,
	hygine tinyint unsigned,
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.anxiety (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	felt_where varchar(512),
	intensity tinyint unsigned,
	panic boolean,
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);


CREATE TABLE mood.fog (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	comp_speed tinyint unsigned,
	forget ENUM('none', '1-5', '5-10', 'over-10'),
	slurr ENUM('none', '1-5', '5-10', 'over-10'),
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.anger (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	expression varchar(512),
	thought varchar(512),
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.eat (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	after_wake decimal(4, 2) unsigned,
	between_food decimal(4, 2) unsigned,
	protein_veggie boolean,
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.sleep (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	fell_asleep time,
	woke_up time,
	time_awake decimal(4, 2) unsigned,
	quality ENUM('restless', 'solid'),
	meds varchar(512),
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.people (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	what_do varchar(512),
	what_impact varchar(512),
	interaction_rating tinyint unsigned,
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
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
