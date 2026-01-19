const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payrollController');

router.post('/employee', ctrl.registerEmployee);
router.get('/employees', ctrl.getAllEmployees);
router.get('/salary', ctrl.calculateSalary);

module.exports = router;