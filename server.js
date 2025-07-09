const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = 'yoursecretkey'; // replace in production

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

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.sendStatus(401);
    const user = results[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.sendStatus(401);
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET);
    res.json({ token, role: user.role });
  });
});

app.get('/flights', auth, (req, res) => {
  db.query('SELECT * FROM flights', (err, results) => {
    if (err) return res.sendStatus(500);
    res.json(results);
  });
});

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
