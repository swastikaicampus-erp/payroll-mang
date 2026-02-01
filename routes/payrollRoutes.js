const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payrollController');
const multer = require('multer');
const fs = require('fs');

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const uploadFields = upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'aadharFront', maxCount: 1 },
    { name: 'aadharBack', maxCount: 1 }
]);

router.post('/employee', uploadFields, ctrl.registerEmployee);
router.put('/employee/:id', uploadFields, ctrl.updateEmployee);

// Baki routes...
router.get('/employees', ctrl.getAllEmployees);
router.delete('/employee/:id', ctrl.deleteEmployee);
router.get('/salary', ctrl.calculateSalary);
router.get('/settings', ctrl.getSettings);
router.post('/settings', ctrl.updateSettings);

module.exports = router;