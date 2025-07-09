const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express(); // ← THIS is what must exist before app.get()

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// ✅ INSERT THIS — after all the above

app.get('/init-db', async (req, res) => {
  try {
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) UNIQUE,
        password_hash VARCHAR(255),
        role ENUM('viewer','admin') NOT NULL
      );
    `);

    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS flights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        aircraft_id VARCHAR(20),
        start_time DATETIME,
        end_time DATETIME,
        category ENUM('scheduled','charter','domestic'),
        type ENUM('flight','maintenance')
      );
    `);

    const hash = await bcrypt.hash('admin123', 10);
    await db.promise().query(`
      INSERT IGNORE INTO users (email, password_hash, role)
      VALUES ('admin@example.com', ?, 'admin');
    `, [hash]);

    res.send('✅ Database initialized, admin user created');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Initialization failed: ' + err.message);
  }
});

// Your other routes (e.g. login, flights) go here…

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
