-- Create the database with modern character set and collation
CREATE DATABASE IF NOT EXISTS secure_file_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE secure_file_db;

-- Users table
-- username is limited to 191 characters to stay within the 767-byte or 1000-byte index limit for utf8mb4
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(191) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- Files metadata table
CREATE TABLE IF NOT EXISTS files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    uploader VARCHAR(191) NOT NULL,
    upload_date DATETIME(6) NOT NULL,
    share_link VARCHAR(191) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    expires_at DATETIME(6),
    is_one_time BOOLEAN NOT NULL,
    -- Foreign key to ensure file uploader actually exists in users table
    CONSTRAINT fk_uploader FOREIGN KEY (uploader) REFERENCES users(username) ON DELETE CASCADE
) ENGINE=InnoDB;
