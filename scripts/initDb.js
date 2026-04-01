const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'kanban.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database at:', dbPath);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS kanban_cards (
      id TEXT PRIMARY KEY,
      sender_name TEXT NOT NULL,
      sender_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Urgent', 'Information', 'Promotional')),
      next_action TEXT,
      deadline TEXT,
      ai_draft TEXT,
      summary_bullets TEXT,
      read_time TEXT,
      board_section TEXT NOT NULL DEFAULT 'todo' CHECK(board_section IN ('todo', 'in_progress', 'done')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('kanban_cards table created or already exists');
    }
  });

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_category_section 
    ON kanban_cards(category, board_section)
  `, (err) => {
    if (err) {
      console.error('Error creating index:', err);
    } else {
      console.log('Index created successfully');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
    process.exit(1);
  }
  console.log('Database initialization complete');
  process.exit(0);
});
