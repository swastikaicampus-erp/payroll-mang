const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Settings = require('../models/Settings');

// 1. Calculate Salary
exports.calculateSalary = async (req, res) => {
    try {
        const { empId, month, year } = req.query;
        const config = await Settings.findOne() || { lateFinePerMinute: 2, overtimePayPerHour: 150 };
        const employee = await Employee.findOne({ employeeId: empId });

        if (!employee) return res.status(404).json({ message: "Staff not found" });

        const datePattern = `${year}-${month}`;
        const records = await Attendance.find({
            employeeId: empId,
            date: { $regex: `^${datePattern}` }
        }).sort({ date: 1 });

        let totalLate = 0;
        let totalOT = 0;
        records.forEach(r => {
            totalLate += r.lateMinutes || 0;
            totalOT += r.overtimeMinutes || 0;
        });

        const lateDeduction = Math.round(totalLate * config.lateFinePerMinute);
        const otEarnings = Math.round((totalOT / 60) * config.overtimePayPerHour);
        const finalSalary = (employee.baseSalary - lateDeduction + otEarnings).toFixed(2);

        res.json({
            name: employee.name,
            baseSalary: employee.baseSalary,
            presentDays: records.length,
            totalLateMinutes: Math.round(totalLate),
            totalOTMinutes: Math.round(totalOT),
            deduction: lateDeduction,
            bonus: otEarnings,
            finalSalary,
            attendanceHistory: records
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 2. Register Employee
exports.registerEmployee = async (req, res) => {
    try {
        const newEmp = new Employee(req.body);
        await newEmp.save();
        res.status(201).json(newEmp);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 3. Get All Employees
exports.getAllEmployees = async (req, res) => {
    try {
        const emps = await Employee.find();
        res.json(emps);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// 5. Update Employee Details (Edit)
exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params; // MongoDB ki _id se update karne ke liye
        const updatedData = req.body;

        // new: true ka matlab hai ki response mein updated wala data milega
        const updatedEmp = await Employee.findByIdAndUpdate(
            id, 
            updatedData, 
            { new: true, runValidators: true }
        );

        if (!updatedEmp) {
            return res.status(404).json({ message: "Staff member nahi mila" });
        }

        res.json({
            message: "Employee details updated successfully",
            updatedEmp
        });
    } catch (err) {
        res.status(500).json({ 
            error: "Update failed", 
            details: err.message 
        });
    }
};
exports.deleteEmployee = async (req, res) => {
    try {
        const deleted = await Employee.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Employee not found in Database" });
        }
        res.json({ message: "Deleted Successfully" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
};