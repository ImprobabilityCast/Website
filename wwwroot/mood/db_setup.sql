-- db setup script

CREATE DATABASE mood;

USE mood;

CREATE TABLE Users (
	id int UNSIGNED AUTO_INCREMENT NOT NULL,
	recovery_dkey char(128),
	pwd_dkey char(128),
	pwd_hash char(60),
	email_hash char(60),
	PRIMARY KEY(id)
);

CREATE PROCEDURE mood.add_user
		(IN recovery_dkey, IN pwd_dkey, IN pwd_hash, IN email_hash)
BEGIN
	INSERT INTO mood.Users (recovery_dkey, pwd_dkey, pwd_hash, email_hash)
		VALUES(recovery_dkey, pwd_dkey, pwd_hash, email_hash);
END

-- setup demo account
mood.add_user(
	-- recovery_dkey
	-- pwd_dkey
	-- demo@sugarfairyland.com hash
	"$2y$10$HqboaQRbrSxcJKt9n.gwau1dWfIr7rv53tCPAF.9zGO738JhTASia"
	-- hunter2 hash
	"$2y$10$Q7DKrvLsSgjDlqMBIcI9YeYfA7UKqmqhfBkdoO31j4APB6MNBMiXG");

SELECT * FROM Users;
