const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payrollController');

router.post('/employee', ctrl.registerEmployee);
router.get('/employees', ctrl.getAllEmployees);
router.get('/salary', ctrl.calculateSalary);
router.put('/employee/:id', ctrl.updateEmployee);

// YE LINE ADD KAREIN 👇
router.delete('/employee/:id', ctrl.deleteEmployee); 

module.exports = router;