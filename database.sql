CREATE DATABASE IF NOT EXISTS `networkr`;
USE `networkr`;

CREATE TABLE IF NOT EXISTS `users`(
  `id` VARCHAR(36),
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `invitedBy` VARCHAR(36),
  `permissions` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `banned` BOOLEAN NOT NULL DEFAULT FALSE,

  PRIMARY KEY (`id`),
  FOREIGN KEY (`invitedBy`) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS `invites`(
  `id` INT AUTO_INCREMENT,
  `code` VARCHAR(36) NOT NULL UNIQUE,
  `createdBy` VARCHAR(36),
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  FOREIGN KEY (`createdBy`) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS `identities`(
  `id` VARCHAR(36),
  `name` VARCHAR(255) NOT NULL,
  `is_person` INT NOT NULL DEFAULT 0,
  `first_name` VARCHAR(255),
  `last_name` VARCHAR(255),
  `note` TEXT,

  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `relationships`(
  `id` INT AUTO_INCREMENT,
  `identity_one` VARCHAR(36) NOT NULL,
  `identity_two` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255),

  PRIMARY KEY (`id`),
  FOREIGN KEY (`identity_one`) REFERENCES users(id),
  FOREIGN KEY (`identity_two`) REFERENCES users(id)
);

-- Create an invite for admin
INSERT INTO `invites` (`code`) VALUES ("abc123");