const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payrollController');
const multer = require('multer');
const fs = require('fs');

// 1. Uploads folder auto-create karne ka logic
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// 2. Multer storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// 3. Routes ko update karein (Middleware add kiya)
const uploadFields = upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'aadharFront', maxCount: 1 },
    { name: 'aadharBack', maxCount: 1 }
]);

// POST aur PUT dono mein uploadFields lagayein
router.post('/employee', uploadFields, ctrl.registerEmployee);
router.put('/employee/:id', uploadFields, ctrl.updateEmployee);

router.get('/employees', ctrl.getAllEmployees);
router.delete('/employee/:id', ctrl.deleteEmployee);

// Baaki routes...
router.get('/salary', ctrl.calculateSalary);
router.get('/settings', ctrl.getSettings);
router.post('/settings', ctrl.updateSettings);

module.exports = router;