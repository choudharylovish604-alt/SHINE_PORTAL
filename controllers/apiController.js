const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const xlsx = require('xlsx');
const fs = require('fs');
const db = require('../db');
const aiService = require('../services/aiService');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    let studentId = null;
    if (user.role === 'student') {
        const studentResult = await db.query('SELECT id FROM students WHERE user_id = $1', [user.id]);
        if (studentResult.rows.length > 0) {
            studentId = studentResult.rows[0].id;
        }
    }
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, studentId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getStudentProfile = async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Only students can access this' });
  try {
    const studentRes = await db.query('SELECT * FROM students WHERE user_id = $1', [req.user.id]);
    if (studentRes.rows.length === 0) return res.status(404).json({ error: 'Student profile not found' });
    
    const student = studentRes.rows[0];
    const recordRes = await db.query('SELECT * FROM records WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1', [student.id]);
    const riskRes = await db.query('SELECT * FROM risk WHERE student_id = $1 ORDER BY updated_at DESC LIMIT 1', [student.id]);
    const counselingRes = await db.query('SELECT * FROM counseling WHERE student_id = $1 ORDER BY scheduled_date DESC', [student.id]);

    res.json({
      profile: student,
      latestRecord: recordRes.rows[0] || null,
      risk: riskRes.rows[0] || null,
      counseling: counselingRes.rows || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch student data' });
  }
};

exports.getAllStudents = async (req, res) => {
  if (req.user.role !== 'mentor') return res.status(403).json({ error: 'Only mentors can access this' });
  try {
    const result = await db.query(`
      SELECT s.id, u.name, u.email, s.enrollment_number, s.course, s.year,
             r.attendance_percentage, r.marks_percentage, r.fee_paid,
             risk.risk_score, risk.risk_category, risk.reason
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN (
          SELECT r1.* FROM records r1
          INNER JOIN (SELECT student_id, MAX(id) as max_id FROM records GROUP BY student_id) r2
          ON r1.id = r2.max_id
      ) r ON s.id = r.student_id
      LEFT JOIN (
          SELECT risk1.* FROM risk risk1
          INNER JOIN (SELECT student_id, MAX(id) as max_id FROM risk GROUP BY student_id) risk2
          ON risk1.id = risk2.max_id
      ) risk ON s.id = risk.student_id
      ORDER BY risk.risk_score DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

exports.uploadData = async (req, res) => {
  if (req.user.role !== 'mentor') return res.status(403).json({ error: 'Only mentors can upload' });
  
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
    let processed = 0;
    
    for (const row of data) {
      const studentRes = await db.query('SELECT id FROM students WHERE enrollment_number = $1', [row.EnrollmentNumber]);
      if (studentRes.rows.length === 0) continue; 
      
      const studentId = studentRes.rows[0].id;
      const attendance = parseFloat(row.Attendance) || 0;
      const marks = parseFloat(row.Marks) || 0;
      const feePaid = String(row.FeePaid).toLowerCase() === 'yes' || row.FeePaid === true || row.FeePaid === 1;

      await db.query(
        'INSERT INTO records (student_id, attendance_percentage, marks_percentage, fee_paid, uploaded_by) VALUES ($1, $2, $3, $4, $5)',
        [studentId, attendance, marks, feePaid, req.user.id]
      );

      const aiResponse = await aiService.predictRisk(attendance, marks, feePaid);
      const { risk_score, risk_category, reason } = aiResponse;
      
      await db.query(
        'INSERT INTO risk (student_id, risk_score, risk_category, reason) VALUES ($1, $2, $3, $4)',
        [studentId, risk_score, risk_category, reason]
      );
      processed++;
    }

    fs.unlinkSync(req.file.path);

    res.json({ message: 'Data processed successfully', processed });
  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'File processing failed' });
  }
};

exports.scheduleCounseling = async (req, res) => {
  const { student_id, mentor_id, scheduled_date, notes } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO counseling (student_id, mentor_id, scheduled_date, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [student_id, mentor_id || null, scheduled_date, notes]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to schedule counseling' });
  }
};

exports.getCounseling = async (req, res) => {
  try {
    let query = 'SELECT c.*, u.name as mentor_name, s.enrollment_number FROM counseling c LEFT JOIN users u ON c.mentor_id = u.id LEFT JOIN students s ON c.student_id = s.id';
    let params = [];
    
    if (req.user.role === 'student') {
       const studentRes = await db.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
       if (studentRes.rows.length > 0) {
           query += ' WHERE c.student_id = $1';
           params.push(studentRes.rows[0].id);
       } else {
           return res.json([]);
       }
    } else if (req.user.role === 'mentor') {
       query += ' WHERE c.mentor_id = $1 OR c.mentor_id IS NULL';
       params.push(req.user.id);
    }
    
    query += ' ORDER BY c.scheduled_date DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch counseling sessions' });
  }
};

exports.getStudentHistory = async (req, res) => {
    const { id } = req.params;
    try {
        const records = await db.query('SELECT * FROM records WHERE student_id = ? ORDER BY semester ASC, created_at ASC', [id]);
        const risk = await db.query('SELECT * FROM risk WHERE student_id = ? ORDER BY updated_at DESC', [id]);
        res.json({ records: records.rows, risk: risk.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch student history' });
    }
};

exports.getAnalytics = async (req, res) => {
  if (req.user.role !== 'mentor') return res.status(403).json({ error: 'Only mentors can access analytics' });
  
  try {
    const trendRes = await db.query(`
      SELECT semester as month, AVG(attendance_percentage) as avgAtt, AVG(marks_percentage) as avgMarks
      FROM records
      GROUP BY semester
      ORDER BY created_at ASC
    `);
    
    res.json({
        trendData: trendRes.rows || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// --- Detailed Attendance Endpoints ---

exports.getSubjects = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM subjects ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
};

exports.createAttendanceSession = async (req, res) => {
    if (req.user.role !== 'mentor') return res.status(403).json({ error: 'Unauthorized' });
    const { subject_id, session_name, session_date, timing } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO attendance_sessions (subject_id, mentor_id, session_name, session_date, timing) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [subject_id, req.user.id, session_name, session_date, timing]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create session' });
    }
};

exports.logAttendance = async (req, res) => {
    if (req.user.role !== 'mentor') return res.status(403).json({ error: 'Unauthorized' });
    const { session_id, logs } = req.body; // logs: [{ student_id, status, reason }]
    try {
        for (const log of logs) {
            await db.query(
                'INSERT INTO attendance_logs (session_id, student_id, status, reason) VALUES ($1, $2, $3, $4)',
                [session_id, log.student_id, log.status, log.reason || null]
            );
        }
        res.json({ message: 'Attendance logged successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to log attendance' });
    }
};

exports.getStudentAttendanceHistory = async (req, res) => {
    const studentId = req.params.id;
    try {
        const result = await db.query(`
            SELECT al.*, asess.session_name, asess.session_date, asess.timing, sub.name as subject_name
            FROM attendance_logs al
            JOIN attendance_sessions asess ON al.session_id = asess.id
            JOIN subjects sub ON asess.subject_id = sub.id
            WHERE al.student_id = $1
            ORDER BY asess.session_date DESC, asess.created_at DESC
        `, [studentId]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch attendance history' });
    }
};

exports.getDefaulters = async (req, res) => {
    if (req.user.role !== 'mentor') return res.status(403).json({ error: 'Unauthorized' });
    try {
        const result = await db.query(`
            SELECT s.id, u.name, s.enrollment_number, sub.name as subject_name,
                   COUNT(CASE WHEN al.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(al.id), 0) as attendance_percentage
            FROM students s
            JOIN users u ON s.user_id = u.id
            CROSS JOIN subjects sub
            LEFT JOIN attendance_sessions asess ON asess.subject_id = sub.id
            LEFT JOIN attendance_logs al ON al.student_id = s.id AND al.session_id = asess.id
            GROUP BY s.id, sub.id
            HAVING attendance_percentage < 30 OR (attendance_percentage IS NULL AND (SELECT COUNT(*) FROM attendance_sessions WHERE subject_id = sub.id) > 0)
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch defaulters' });
    }
};

exports.getTestStudents = async (req, res) => {
    try {
        const data = fs.readFileSync('test_students_50.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to load test data' });
    }
};

exports.batchPredict = async (req, res) => {
    try {
        const results = await aiService.predictBatch(req.body);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'AI Batch Prediction failed' });
    }
};
