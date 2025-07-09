app.get('/init-db', async (req, res) => {
  try {
    // Create users table
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) UNIQUE,
        password_hash VARCHAR(255),
        role ENUM('viewer','admin') NOT NULL
      );
    `);

    // Create flights table
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

    // Create default admin user
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
