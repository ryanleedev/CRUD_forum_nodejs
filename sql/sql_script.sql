#sql

DROP DATABASE IF EXISTS myforum;


GRANT USAGE ON *.* TO 'root'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON myforum.* TO 'root'@'localhost';

#create database
CREATE DATABASE myforum;

USE myforum;

#create table
CREATE TABLE myforum.`mboard` (
	`idx` INT UNSIGNED NOT NULL AUTO_INCREMENT, 
	`subject` VARCHAR (255) DEFAULT '',
	`name` VARCHAR (100) DEFAULT '',
	`password` VARCHAR (255),
	`content` MEDIUMTEXT,
	`hit` INT DEFAULT 0,
	`imglist` VARCHAR(255) DEFAULT '',
	`rdate` DATETIME, 
	`ip` VARCHAR (100), 
	PRIMARY KEY (`idx`)
);

INSERT INTO myforum.`mboard` (`subject`, `name`, `password`, `content`, `hit`, `rdate`) VALUES
('Hello this is content', 'Admin', '$2y$10$tzFI1UVE4EJm098h73TEuu97c2.vXBb2fccvgpI6MNGnsDFGScnUG', 'this is forum that you can post your article like this! Password for this content is "asdf", so if you want to edit this post or delete enter the the password.','3', now()),('My name is Ryan!', 'Lee', '$2y$10$tzFI1UVE4EJm098h73TEuu97c2.vXBb2fccvgpI6MNGnsDFGScnUG', 'this is my first post!','2', now())
,('Image!', 'Lee', '$2y$10$tzFI1UVE4EJm098h73TEuu97c2.vXBb2fccvgpI6MNGnsDFGScnUG', '<img src="upload/20230405205934_0.jpg" data-filename="KakaoTalk_20220917_215432857.jpg" style="font-size: var(--bs-body-font-size); font-weight: var(--bs-body-font-weight); text-align: var(--bs-body-text-align); background-color: var(--bs-body-bg); width: 50%;"><br>Image of airport','2', now())

