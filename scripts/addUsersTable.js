const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'kanban.db');
const db = new sqlite3.Database(dbPath);

const createUsersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      image TEXT,
      created_at TEXT NOT NULL,
      last_login TEXT
    )
  `;

  db.run(query, (err) => {
    if (err) {
      console.error('❌ Error creating users table:', err.message);
      db.close();
      process.exit(1);
    } else {
      console.log('✅ Users table created');
      db.close();
    }
  });
};

console.log('Connected to SQLite database');
createUsersTable();
