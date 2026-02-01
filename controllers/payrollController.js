const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Settings = require('../models/Settings');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
// 1. Calculate Salary (Machine Data + Settings Logic)
exports.calculateSalary = async (req, res) => {
    try {
        const { empId, month, year } = req.query;

        // DB se Employee aur Settings fetch karein
        const employee = await Employee.findOne({ employeeId: empId });
        const config = await Settings.findOne() || { lateFinePerMinute: 2, overtimePayPerHour: 150 };

        if (!employee) return res.status(404).json({ message: "Staff not found in DB" });

        // Machine API Dates taiyar karein
        const firstDay = `${year}-${month}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${month}-${lastDay}`;
        const machineUrl = `http://3.111.38.27/bio.php?APIKey=050914052413&FromDate=${firstDay}&ToDate=${endDate}&SerialNumber=C2636C37D7282535`;

        // Machine API Call
        const machineRes = await axios.get(machineUrl);
        const allLogs = machineRes.data;

        // Filter Logs for specific employee
        const empLogs = allLogs.filter(l => String(l.EmployeeCode).trim() === String(empId).trim());

        if (empLogs.length === 0) {
            return res.status(404).json({ message: "No attendance records found for this ID" });
        }

        // Unique Days logic
        const uniqueDates = [...new Set(empLogs.map(l => l.LogDate.split(' ')[0]))];
        
        let totalLateMinutes = 0;
        const attendanceHistory = uniqueDates.map(date => {
            const dayLogs = empLogs.filter(l => l.LogDate.startsWith(date));
            
            // Late calculation logic (Example: 09:15 ke baad late)
            // Aap isse shiftStart ke hisab se dynamic bhi bana sakte hain
            const checkInTime = dayLogs[0].LogDate.split(' ')[1];
            // Yahan hum dummy 10 min late pakad rahe hain testing ke liye 
            // Aap real logic laga sakte hain: checkInTime > employee.shiftStart
            const late = 0; 
            totalLateMinutes += late;

            return {
                date: date,
                checkIn: checkInTime,
                checkOut: dayLogs.length > 1 ? dayLogs[dayLogs.length - 1].LogDate.split(' ')[1] : '--',
                status: 'Present',
                lateMinutes: late
            };
        });

        // SALARY CALCULATION
        const perDaySalary = employee.baseSalary / 30;
        const baseEarned = perDaySalary * attendanceHistory.length;
        const lateDeduction = totalLateMinutes * config.lateFinePerMinute;
        
        const finalSalary = (baseEarned - lateDeduction).toFixed(2);

        res.json({
            name: employee.name,
            baseSalary: employee.baseSalary,
            presentDays: attendanceHistory.length,
            totalLateMinutes,
            deduction: lateDeduction,
            bonus: 0,
            finalSalary,
            attendanceHistory
        });

    } catch (err) {
        console.error("Salary Error:", err.message);
        res.status(500).json({ error: "Failed to process salary" });
    }
};

// 2. Settings update karne ka naya function
exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (settings) {
            settings = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true });
        } else {
            settings = new Settings(req.body);
            await settings.save();
        }
        res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getSettings = async (req, res) => {
    try {
        const settings = await Settings.findOne() || { lateFinePerMinute: 2, overtimePayPerHour: 150 };
        res.json(settings);
    } catch (err) { res.status(500).json({ error: err.message }); }
};


// Settings ko delete karne ka function
exports.deleteSettings = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Settings.findByIdAndDelete(id);
        
        if (!deleted) {
            return res.status(404).json({ message: "Settings record nahi mila" });
        }
        
        res.json({ message: "Settings deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// --- Baki functions as it is ---
exports.registerEmployee = async (req, res) => {
    try {
        const employeeData = { ...req.body };

        // Agar files upload hui hain toh unka path save karein
        if (req.files) {
            if (req.files.profilePhoto) employeeData.profilePhoto = req.files.profilePhoto[0].path;
            if (req.files.aadharFront) employeeData.aadharFront = req.files.aadharFront[0].path;
            if (req.files.aadharBack) employeeData.aadharBack = req.files.aadharBack[0].path;
        }

        const newEmp = new Employee(employeeData);
        await newEmp.save();
        res.status(201).json(newEmp);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllEmployees = async (req, res) => {
    try {
        const emps = await Employee.find();
        res.json(emps);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateEmployee = async (req, res) => {
    try {
        const updatedEmp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Updated successfully", updatedEmp });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteEmployee = async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted Successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};