const Employee = require('../models/Employee');
const Settings = require('../models/Settings');
const axios = require('axios');
// Zaroori: Multer ko yahan require karna hoga agar niche storage use kar rahe ho
const multer = require('multer'); 

// 1. Register Employee
exports.registerEmployee = async (req, res) => {
    try {
        const employeeData = { ...req.body };

        // Types fix karein (String to Number)
        if(employeeData.baseSalary) employeeData.baseSalary = Number(employeeData.baseSalary);
        if(employeeData.employeeId) employeeData.employeeId = Number(employeeData.employeeId);

        // Files paths save karein
        if (req.files) {
            if (req.files.profilePhoto) employeeData.profilePhoto = req.files.profilePhoto[0].path;
            if (req.files.aadharFront) employeeData.aadharFront = req.files.aadharFront[0].path;
            if (req.files.aadharBack) employeeData.aadharBack = req.files.aadharBack[0].path;
        }

        const newEmp = new Employee(employeeData);
        await newEmp.save();
        res.status(201).json(newEmp);
    } catch (err) {
        console.error("❌ Register Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// 2. Update Employee
exports.updateEmployee = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if(updateData.baseSalary) updateData.baseSalary = Number(updateData.baseSalary);

        if (req.files) {
            if (req.files.profilePhoto) updateData.profilePhoto = req.files.profilePhoto[0].path;
            if (req.files.aadharFront) updateData.aadharFront = req.files.aadharFront[0].path;
            if (req.files.aadharBack) updateData.aadharBack = req.files.aadharBack[0].path;
        }

        const updatedEmp = await Employee.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json({ message: "Updated successfully", updatedEmp });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Get All Employees
exports.getAllEmployees = async (req, res) => {
    try {
        const emps = await Employee.find();
        res.json(emps);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 4. Delete Employee
exports.deleteEmployee = async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted Successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 5. Calculate Salary (Machine Integration)
exports.calculateSalary = async (req, res) => {
    try {
        const { empId, month, year } = req.query;
        const employee = await Employee.findOne({ employeeId: empId });
        const config = await Settings.findOne() || { lateFinePerMinute: 2, overtimePayPerHour: 150 };

        if (!employee) return res.status(404).json({ message: "Staff not found in DB" });

        const firstDay = `${year}-${month}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${month}-${lastDay}`;
        const machineUrl = `http://3.111.38.27/bio.php?APIKey=050914052413&FromDate=${firstDay}&ToDate=${endDate}&SerialNumber=C2636C37D7282535`;

        const machineRes = await axios.get(machineUrl);
        const empLogs = machineRes.data.filter(l => String(l.EmployeeCode).trim() === String(empId).trim());

        if (empLogs.length === 0) return res.status(404).json({ message: "No attendance found" });

        const uniqueDates = [...new Set(empLogs.map(l => l.LogDate.split(' ')[0]))];
        const perDaySalary = employee.baseSalary / 30;
        const finalSalary = (perDaySalary * uniqueDates.length).toFixed(2);

        res.json({
            name: employee.name,
            baseSalary: employee.baseSalary,
            presentDays: uniqueDates.length,
            finalSalary,
            attendanceHistory: uniqueDates
        });
    } catch (err) {
        res.status(500).json({ error: "Salary process failed" });
    }
};

// 6. Settings Functions
exports.getSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne() || { lateFinePerMinute: 2, overtimePayPerHour: 150 };
        res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateSettings = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate({}, req.body, { upsert: true, new: true });
        res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteSettings = async (req, res) => {
    try {
        await Settings.findByIdAndDelete(req.params.id);
        res.json({ message: "Settings deleted successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- Multer Storage (Backup for Route Middleware) ---
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});