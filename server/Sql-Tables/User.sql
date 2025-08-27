-- Create the Database
CREATE DATABASE `Matrimony-Portal`;

-- Use the Database
USE `Matrimony-Portal`;

-- Create the Users Table
CREATE TABLE `Users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for each user
    `name` VARCHAR(255) NOT NULL, -- Full name of the user
    `email` VARCHAR(255) NOT NULL UNIQUE, -- Unique email address for the user
    `password` VARCHAR(255) NOT NULL, -- Encrypted password for user authentication
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL, -- Gender of the user
    `date_of_birth` DATE NOT NULL, -- Date of birth of the user
    `phone` VARCHAR(15) NULL, -- Optional phone number for contact
    `address` TEXT NULL, -- Optional address for the user
    `profile_picture` VARCHAR(255) NULL, -- URL or path to the user's profile picture
    `marital_status` ENUM('Single', 'Married', 'Divorced', 'Widowed') NOT NULL DEFAULT 'Single', -- Current marital status
    `religion` VARCHAR(50) NULL, -- Religion of the user
    `caste` VARCHAR(50) NULL, -- Optional caste or community information
    `mother_tongue` VARCHAR(50) NULL, -- Native language of the user
    `education` VARCHAR(255) NULL, -- Highest educational qualification
    `profession` VARCHAR(255) NULL, -- Current occupation or profession
    `annual_income` VARCHAR(50) NULL, -- Approximate annual income
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the user record was created
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- Timestamp of the last update to the user record
);
