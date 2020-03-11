-- db setup script

CREATE DATABASE mood;

USE mood;

CREATE TABLE Users (
	id int UNSIGNED AUTO_INCREMENT NOT NULL,
	recovery_dkey char(128),
	pwd_dkey char(128),
	pwd_hash char(60),
	email_hash char(60),
	email_mask varchar(254),
	PRIMARY KEY(id)
);

INSERT INTO Users (email_mask)
	VALUES("a****@sugarfairyland.com");

SELECT * FROM Users;
