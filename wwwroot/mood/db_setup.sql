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

-- find out if sodium secret box returns same length encrypted binary text

CREATE TABLE mood.coping_mechs (
	email varchar(254) NOT NULL,
	mech varbinary(144) NOT NULL,
	still_used boolean NOT NULL DEFAULT true,
	PRIMARY KEY (email, mech),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.coping_mechs_help (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	mech varbinary(144) NOT NULL,
	helpful binary(64) NOT NULL,
	PRIMARY KEY (email, mech, stamp),
	FOREIGN KEY (email, mech) REFERENCES mood.coping_mechs(email, mech)
);

CREATE TABLE mood.basic_mood (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	overall varbinary(144) NOT NULL,
	secondary varbinary(144) NOT NULL,
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.suicide (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	thoughts binary(64) NOT NULL,
	urges binary(64) NOT NULL,
	steps varbinary(516) NOT NULL,
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.self_harm (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	place varbinary(516) NOT NULL,
	tool_used varbinary(516) NOT NULL,
	how_deep varbinary(516) NOT NULL,
	emote_response varbinary(516) NOT NULL,
	purpose binary(64) NOT NULL,
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.depression (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	energy binary(64) NOT NULL,
	motivation binary(64) NOT NULL,
	hygine binary(64) NOT NULL,
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.anxiety (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	felt_where varbinary(516) NOT NULL,
	intensity binary(64) NOT NULL,
	panic binary(64) NOT NULL,
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.fog (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	comp_speed binary(64) NOT NULL,
	forget binary(64) NOT NULL,
	slurr binary(64) NOT NULL,
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.anger (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	expression varbinary(516) NOT NULL,
	thought varbinary(516) NOT NULL,
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.food (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	after_wake binary(64) NOT NULL,
	between_food binary(64) NOT NULL,
	protein_veggie binary(64) NOT NULL,
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.sleep (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	fell_asleep binary(64) NOT NULL,
	woke_up binary(64) NOT NULL,
	sleep_spent_awake binary(64) NOT NULL,
	quality binary(64) NOT NULL,
	meds varbinary(516) NOT NULL,
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.people (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	what_do varbinary(516) NOT NULL,
	what_impact varbinary(516) NOT NULL,
	interaction_rating binary(64) NOT NULL,
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.swings (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	swing_trigger varbinary(144) NOT NULL,
	mood_before binary(64) NOT NULL,
	mood_after binary(64) NOT NULL,
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE TABLE mood.notes (
	email varchar(254) NOT NULL,
	stamp datetime NOT NULL,
	note varbinary(516),
	PRIMARY KEY (email, stamp),
	FOREIGN KEY (email) REFERENCES mood.users(email)
);

CREATE USER 'php'@'localhost'
	IDENTIFIED BY 'bcsdhj%^763SVOW+p2#S';
GRANT SELECT, INSERT ON mood.* TO 'php'@'localhost';

INSERT INTO mood.users VALUES (
	'18ff036c5549c9138acaa67a04e90cc3f70e620fca3cf9c6',
	'b75c36112b20e27ea3b12e1f36b5cc7926c5b1f5c17187c8f58e7e588f5a02a1',
	'eeebfddd1fcd7f4316294224f7f316b8e4a295d6bed4c3d8ba12b19796eb76ba',
	'752ad616d4c207c9c309bba25e29fcc1c25921723238c63bc12d107797ccb83c',
	'$2y$10$3TS14xFibYkTS5dYBxuCve2oDoG1FqOWrx99kVh6I7KoiFy4qrE/m',
	'demo@sugarfairyland.com'
);
