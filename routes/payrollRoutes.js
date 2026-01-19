const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payrollController');

// Employee Routes
router.post('/employee', ctrl.registerEmployee);
router.get('/employees', ctrl.getAllEmployees);
router.put('/employee/:id', ctrl.updateEmployee);
router.delete('/employee/:id', ctrl.deleteEmployee);

// Salary Route
router.get('/salary', ctrl.calculateSalary);

// Settings Routes (Naya add kiya)
router.get('/settings', ctrl.getSettings);
router.post('/settings', ctrl.updateSettings);
router.delete('/settings/:id', ctrl.deleteSettings);

module.exports = router;