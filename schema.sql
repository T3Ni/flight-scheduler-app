CREATE DATABASE IF NOT EXISTS flight_scheduler;
USE flight_scheduler;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('viewer', 'admin') NOT NULL
);

CREATE TABLE IF NOT EXISTS flights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aircraft_id VARCHAR(20),
  start_time DATETIME,
  end_time DATETIME,
  category ENUM('scheduled', 'charter', 'domestic'),
  type ENUM('flight', 'maintenance')
);
