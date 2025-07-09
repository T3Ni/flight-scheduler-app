const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = 'yoursecretkey'; // you can change later

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Use this endpoint ONCE after deployment to set up DB
app.get('/init-db', async (req, res) => {
  try {
    // Create tables
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) UNIQUE,
        password_hash VARCHAR(255),
        role ENUM('viewer','admin') NOT NULL
      );
      CREATE TABLE IF NOT EXISTS flights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        aircraft_id VARCHAR(20),
        start_time DATETIME,
        end_time DATETIME,
        category ENUM('scheduled','charter','domestic'),
        type ENUM('flight','maintenance')
      );
    `);
    // Add admin user
    const hash = await bcrypt.hash('admin123', 10);
    await db.promise().query(`
      INSERT IGNORE INTO users (email, password_hash, role)
      VALUES ('admin@example.com', ?, 'admin');
    `, [hash]);

    res.send('✅ Database initialized, admin user created: admin@example.com / admin123');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Initialization failed: ' + err.message);
  }
});

// Existing login and flights endpoints
app.post('/login', (req, res) => { /* …existing code… */ });
app.get('/flights', auth, (req, res) => { /* …existing code… */ });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
