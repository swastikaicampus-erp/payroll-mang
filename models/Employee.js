const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    employeeId: { type: String, unique: true, required: true }, // Machine ID
    baseSalary: { type: Number, required: true },
    shiftStart: { type: String, default: "09:00" }, // Format: HH:mm
    shiftEnd: { type: String, default: "18:00" },   // Format: HH:mm
});

module.exports = mongoose.model('Employee', EmployeeSchema);