const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let dbPromise;

async function initDb() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('student', 'mentor'))
    );

    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        enrollment_number TEXT UNIQUE NOT NULL,
        course TEXT,
        year INTEGER
    );

    CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        attendance_percentage REAL,
        marks_percentage REAL,
        fee_paid BOOLEAN,
        semester TEXT,
        uploaded_by INTEGER REFERENCES users(id),
        student_feedback TEXT,
        report_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS risk (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        risk_score REAL,
        risk_category TEXT,
        reason TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS counseling (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        mentor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        scheduled_date DATETIME NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS attendance_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
        mentor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        session_name TEXT NOT NULL,
        session_date DATE NOT NULL,
        timing TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER REFERENCES attendance_sessions(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        status TEXT CHECK (status IN ('present', 'absent')) NOT NULL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS chatbot_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    mentor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'pending'
        CHECK (status IN ('pending', 'answered', 'closed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chatbot_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_id INTEGER REFERENCES chatbot_queries(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    sender_role TEXT CHECK (sender_role IN ('student', 'mentor')),
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
  `);

  // Insert dummy data if empty
  const mentor = await db.get("SELECT * FROM users WHERE email='mentor@example.com'");
  if (!mentor) {
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash('password123', 10);
      
      await db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", ['Admin Mentor', 'mentor@example.com', hash, 'mentor']);
      await db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", ['John Doe', 'student@example.com', hash, 'student']);
      const studentUser = await db.get("SELECT id FROM users WHERE email='student@example.com'");
      await db.run("INSERT INTO students (user_id, enrollment_number, course, year) VALUES (?, ?, ?, ?)", [studentUser.id, 'ENR001', 'B.Tech', 2]);
  }

  // Seed subjects if empty
  const subjectCount = await db.get("SELECT COUNT(*) as count FROM subjects");
  if (subjectCount.count === 0) {
      const initialSubjects = ['Mathematics', 'Computer Science', 'Physics', 'Artificial Intelligence', 'Software Engineering'];
      for (const sub of initialSubjects) {
          await db.run("INSERT INTO subjects (name) VALUES (?)", [sub]);
      }
  }

  return db;
}

dbPromise = initDb();

module.exports = {
  query: async (text, params) => {
    const db = await dbPromise;
    const sqliteText = text.replace(/\$\d+/g, '?');
    
    const isSelect = sqliteText.trim().toUpperCase().startsWith('SELECT');
    const isInsertReturning = sqliteText.toUpperCase().includes('RETURNING');
    
    if (isSelect) {
        const rows = await db.all(sqliteText, params);
        return { rows };
    } else {
        let cleanText = sqliteText;
        if (isInsertReturning) {
            cleanText = cleanText.split('RETURNING')[0];
        }
        
        const result = await db.run(cleanText, params);
        
        if (isInsertReturning) {
            const rows = await db.all(`SELECT * FROM ${cleanText.split('INTO ')[1].split(' ')[0]} WHERE id = ?`, [result.lastID]);
            return { rows };
        }
        
        return { rows: [] };
    }
  },
  getDb: () => dbPromise
};
