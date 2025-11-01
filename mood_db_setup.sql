-- delete the old stuff if it exists
DROP USER IF EXISTS 'php'@'localhost';
DROP DATABASE IF EXISTS mood;

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

INSERT INTO mood.users (nonce, salt, recovery_dkey, pwd_dkey, pwd_hash, uname, sec_q_1, sec_q_2, sec_a_hash) VALUES (
	'5f063301f31241f1a1d94b3bc1eed7308f1a2a494b8828ea',
	'16f990a96e55f977825f8586f3f7f44e7276146678c6df7375739e6b967ab7b7',
	'0bb605af6493ef39cddcd19a5caa5754c71987df5b4d958dd0bd524aec9fd421',
	'772b31595e45ae9ea41308aa7756bfb7470c2b8e81504e4b763a1f3f4c9d0c1f',
	'$2y$10$PCASlQIRaVyR7IfkeaOgUO0dDQL1YA2jYsYNm1ZdROfhdrKUI2gjW',
	'demo_user',
	'Childhood bff',
	'favorite color when 12',
	'$2y$10$TzUBM7dTggkoDR7ALpeYx.oFFVg/PujBbdKkQFYmZ8HwbuCOPwh4i'
);
