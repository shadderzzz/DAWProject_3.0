# Create the database
CREATE DATABASE IF NOT EXISTS login_system;
USE login_system;


CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    hashedPassword VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE recent_searches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) 


# Create the app user
CREATE USER IF NOT EXISTS 'dawapp'@'localhost' IDENTIFIED BY 'qwertyuiop'; 
GRANT ALL PRIVILEGES ON login_system.* TO 'dawapp'@'localhost';
