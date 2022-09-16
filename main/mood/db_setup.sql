-- delte the old stuff if it exists
DROP USER 'php'@'localhost';
DROP DATABASE mood;

-- db setup script

CREATE DATABASE mood;

CREATE TABLE mood.users (
	id int unsigned NOT NULL AUTO_INCREMENT,
	nonce char(48) NOT NULL, -- SODIUM_CRYPTO_SECRETBOX_NONCEBYTES * 2
	-- SODIUM_CRYPTO_PWHASH_SCRYPTSALSA208SHA256_SALTBYTES * 2
	salt char(64) NOT NULL,
	recovery_dkey char(64) NOT NULL, -- SODIUM_CRYPTO_SECRETBOX_KEYBYTES * 2
	pwd_dkey char(64) NOT NULL, -- SODIUM_CRYPTO_SECRETBOX_KEYBYTES * 2
	pwd_hash char(60) NOT NULL,
	uname char(24) UNIQUE NOT NULL,
	sec_q_1 char(128) NOT NULL,
	sec_q_2 char(128) NOT NULL,
	sec_a_hash char(60) NOT NULL,
	PRIMARY KEY (id)
);

CREATE TABLE mood.coping_mechs (
	id int unsigned NOT NULL,
	mech varbinary(144) NOT NULL,
	still_used boolean NOT NULL DEFAULT true,
	FOREIGN KEY (id) REFERENCES mood.users(id),
	PRIMARY KEY (id, mech)
);

CREATE TABLE mood.coping_mechs_help (
	id int unsigned NOT NULL,
	stamp datetime NOT NULL,
	mech varbinary(144) NOT NULL,
	helpful varbinary(32) NOT NULL,
	PRIMARY KEY (id, mech, stamp),
	FOREIGN KEY (id, mech) REFERENCES mood.coping_mechs(id, mech)
);

CREATE TABLE mood.basic_mood (
	id int unsigned NOT NULL,
	stamp datetime NOT NULL,
	overall varbinary(144) NOT NULL,
	secondary varbinary(144) NOT NULL,
	PRIMARY KEY (id, stamp),
	FOREIGN KEY (id) REFERENCES mood.users(id)
);

CREATE TABLE mood.suicide (
	id int unsigned NOT NULL,
	stamp datetime NOT NULL,
	thoughts binary(32) NOT NULL,
	urges binary(32) NOT NULL,
	steps varbinary(516) NOT NULL,
	PRIMARY KEY (id, stamp),
	FOREIGN KEY (id) REFERENCES mood.users(id)
);

CREATE TABLE mood.self_harm (
	id int unsigned NOT NULL,
	stamp datetime NOT NULL,
	place varbinary(144) NOT NULL,
	tool_used varbinary(144) NOT NULL,
	how_deep varbinary(144) NOT NULL,
	emote_response varbinary(516) NOT NULL,
	purpose binary(32) NOT NULL,
	PRIMARY KEY (id, stamp),
	FOREIGN KEY (id) REFERENCES mood.users(id)
);

CREATE TABLE mood.depression (
	id int unsigned NOT NULL,
	stamp datetime NOT NULL,
	energy binary(32) NOT NULL,
	motivation binary(32) NOT NULL,
	hygine binary(32) NOT NULL,
	PRIMARY KEY (id, stamp),
	FOREIGN KEY (id) REFERENCES mood.users(id)
);

CREATE TABLE mood.anxiety (
	id int unsigned NOT NULL,
	stamp datetime NOT NULL,
	felt_where varbinary(516) NOT NULL,
	intensity binary(32) NOT NULL,
	panic binary(32) NOT NULL,
	PRIMARY KEY (id, stamp),
	FOREIGN KEY (id) REFERENCES mood.users(id)
);

CREATE TABLE mood.fog (
	id int unsigned NOT NULL,
	stamp datetime NOT NULL,
	comp_speed binary(32) NOT NULL,
	forget binary(32) NOT NULL,
	slurr binary(32) NOT NULL,
	PRIMARY KEY (id, stamp),
	FOREIGN KEY (id) REFERENCES mood.users(id)
);

CREATE TABLE mood.anger (
	id int unsigned NOT NULL,
	stamp datetime NOT NULL,
	expression varbinary(516) NOT NULL,
	thought varbinary(516) NOT NULL,
	PRIMARY KEY (id, stamp),
	FOREIGN KEY (id) REFERENCES mood.users(id)
);

CREATE TABLE mood.food (
	id int unsigned NOT NULL,
	stamp datetime NOT NULL,
	after_wake binary(32) NOT NULL,
	between_food binary(32) NOT NULL,
	protein_veggie binary(32) NOT NULL,
	PRIMARY KEY (id, stamp),
	FOREIGN KEY (id) REFERENCES mood.users(id)
);

CREATE TABLE mood.sleep (
	id int unsigned NOT NULL,
	stamp datetime NOT NULL,
	fell_asleep binary(32) NOT NULL,
	woke_up binary(32) NOT NULL,
	sleep_spent_awake binary(32) NOT NULL,
	quality binary(32) NOT NULL,
	meds varbinary(516) NOT NULL,
	PRIMARY KEY (id, stamp),
	FOREIGN KEY (id) REFERENCES mood.users(id)
);

CREATE TABLE mood.people (
	id int unsigned NOT NULL,
	stamp datetime NOT NULL,
	what_do varbinary(516) NOT NULL,
	what_impact varbinary(516) NOT NULL,
	interaction_rating binary(32) NOT NULL,
	PRIMARY KEY (id, stamp),
	FOREIGN KEY (id) REFERENCES mood.users(id)
);

CREATE TABLE mood.swings (
	id int unsigned NOT NULL,
	stamp datetime NOT NULL,
	swing_trigger varbinary(144) NOT NULL,
	mood_before binary(32) NOT NULL,
	mood_after binary(32) NOT NULL,
	PRIMARY KEY (id, stamp),
	FOREIGN KEY (id) REFERENCES mood.users(id)
);

CREATE TABLE mood.notes (
	id int unsigned NOT NULL,
	stamp datetime NOT NULL,
	note varbinary(516),
	PRIMARY KEY (id, stamp),
	FOREIGN KEY (id) REFERENCES mood.users(id)
);

CREATE USER 'php'@'localhost'
	IDENTIFIED BY 'bcsdhj%^763SVOW+p2#S';
GRANT SELECT, INSERT, UPDATE ON mood.* TO 'php'@'localhost';

INSERT INTO mood.users (nonce, salt, recovery_dkey, pwd_dkey, pwd_hash, uname, sec_q_1, sec_q_2, sec_a_hash) VALUES (
	'18ff036c5549c9138acaa67a04e90cc3f70e620fca3cf9c6',
	'b75c36112b20e27ea3b12e1f36b5cc7926c5b1f5c17187c8f58e7e588f5a02a1',
	'eeebfddd1fcd7f4316294224f7f316b8e4a295d6bed4c3d8ba12b19796eb76ba',
	'752ad616d4c207c9c309bba25e29fcc1c25921723238c63bc12d107797ccb83c',
	'$2y$10$3TS14xFibYkTS5dYBxuCve2oDoG1FqOWrx99kVh6I7KoiFy4qrE/m',
	'demo',
	'Childhood bff',
	'favorite color when 12',
	'$2y$10$QxEWmTK2eJleVzaeRsb2YecyFSlbA8ydMSVzrRq3EBt0CGsXNVEOe'
);
