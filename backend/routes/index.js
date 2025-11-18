const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

const authController = require('../controllers/authController');
const attendanceController = require('../controllers/attendanceController');
const homeworkController = require('../controllers/homeworkController');
const announcementController = require('../controllers/announcementController');
const chatController = require('../controllers/chatController');
const feeController = require('../controllers/feeController');
const resultsController = require('../controllers/resultsController');
const galleryController = require('../controllers/galleryController');
const diaryController = require('../controllers/diaryController');
const adminController = require('../controllers/adminController');
const notificationService = require('../services/notificationService');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authenticateToken, authController.getProfile);

router.post('/attendance', authenticateToken, authorizeRoles('teacher', 'admin'), attendanceController.markAttendance);
router.get('/attendance', authenticateToken, attendanceController.getAttendance);
router.get('/attendance/stats', authenticateToken, attendanceController.getAttendanceStats);

router.post('/homework', authenticateToken, authorizeRoles('teacher', 'admin'), upload.single('attachment'), homeworkController.createHomework);
router.get('/homework', authenticateToken, homeworkController.getHomework);
router.post('/homework/submit', authenticateToken, upload.single('attachment'), homeworkController.submitHomework);
router.post('/homework/grade', authenticateToken, authorizeRoles('teacher', 'admin'), homeworkController.gradeHomework);
router.get('/homework/submissions', authenticateToken, homeworkController.getSubmissions);

router.post('/announcements', authenticateToken, authorizeRoles('teacher', 'admin'), upload.single('attachment'), announcementController.createAnnouncement);
router.get('/announcements', authenticateToken, announcementController.getAnnouncements);
router.delete('/announcements/:id', authenticateToken, authorizeRoles('teacher', 'admin'), announcementController.deleteAnnouncement);

router.post('/chat/send', authenticateToken, upload.single('attachment'), chatController.sendMessage);
router.get('/chat/messages', authenticateToken, chatController.getMessages);
router.get('/chat/conversations', authenticateToken, chatController.getConversations);

router.post('/fees', authenticateToken, authorizeRoles('admin'), feeController.createFeeRecord);
router.get('/fees', authenticateToken, feeController.getFeeRecords);
router.post('/fees/payment', authenticateToken, authorizeRoles('admin', 'parent'), feeController.recordPayment);

router.post('/results', authenticateToken, authorizeRoles('teacher', 'admin'), resultsController.createResult);
router.get('/results', authenticateToken, resultsController.getResults);
router.get('/results/report', authenticateToken, resultsController.getStudentReport);

router.post('/gallery/albums', authenticateToken, authorizeRoles('teacher', 'admin'), upload.single('coverPhoto'), galleryController.createAlbum);
router.get('/gallery/albums', authenticateToken, galleryController.getAlbums);
router.post('/gallery/photos', authenticateToken, authorizeRoles('teacher', 'admin'), upload.single('photo'), galleryController.uploadPhoto);
router.get('/gallery/photos', authenticateToken, galleryController.getPhotos);

router.post('/diary', authenticateToken, authorizeRoles('teacher', 'admin'), diaryController.createDiaryEntry);
router.get('/diary', authenticateToken, diaryController.getDiaryEntries);
router.put('/diary/:id', authenticateToken, authorizeRoles('teacher', 'admin'), diaryController.updateDiaryEntry);

router.post('/notifications/register-token', authenticateToken, notificationService.registerPushToken);
router.get('/notifications', authenticateToken, notificationService.getNotifications);
router.post('/notifications/mark-read', authenticateToken, notificationService.markAsRead);

router.post('/admin/users', authenticateToken, authorizeRoles('admin'), adminController.createUser);
router.get('/admin/users', authenticateToken, authorizeRoles('admin'), adminController.getAllUsers);
router.put('/admin/users/:userId/status', authenticateToken, authorizeRoles('admin'), adminController.toggleUserStatus);
router.post('/admin/classes', authenticateToken, authorizeRoles('admin'), adminController.createClass);
router.get('/admin/classes', authenticateToken, authorizeRoles('admin', 'teacher', 'parent'), adminController.getAllClasses);
router.post('/admin/students', authenticateToken, authorizeRoles('admin'), adminController.createStudent);
router.get('/admin/students', authenticateToken, authorizeRoles('admin', 'teacher', 'parent'), adminController.getAllStudents);
router.get('/admin/analytics', authenticateToken, authorizeRoles('admin'), adminController.getAnalytics);

module.exports = router;
