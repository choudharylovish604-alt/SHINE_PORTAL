const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const apiController = require('../controllers/apiController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// Auth Routes
router.post('/auth/register', apiController.register);
router.post('/auth/login', apiController.login);

// Student Routes
router.get('/students/me', authenticateToken, apiController.getStudentProfile);

// Mentor Routes
router.get('/students', authenticateToken, apiController.getAllStudents);
router.get('/students/:id/history', authenticateToken, apiController.getStudentHistory);
router.post('/upload-data', authenticateToken, upload.single('file'), apiController.uploadData);
router.get('/analytics', authenticateToken, apiController.getAnalytics);

// Counseling Routes
router.post('/counseling', authenticateToken, apiController.scheduleCounseling);
router.get('/counseling', authenticateToken, apiController.getCounseling);

// Detailed Attendance Routes
router.get('/subjects', authenticateToken, apiController.getSubjects);
router.post('/attendance/sessions', authenticateToken, apiController.createAttendanceSession);
router.post('/attendance/logs', authenticateToken, apiController.logAttendance);
router.get('/attendance/student/:id', authenticateToken, apiController.getStudentAttendanceHistory);
router.get('/attendance/defaulters', authenticateToken, apiController.getDefaulters);

// AI Batch Prediction Routes
router.get('/test-students', apiController.getTestStudents);
router.post('/ai/batch-predict', apiController.batchPredict);

module.exports = router;
