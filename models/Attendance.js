const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
    checkIn: { type: String },
    checkOut: { type: String },
    lateMinutes: { type: Number, default: 0 },
    overtimeMinutes: { type: Number, default: 0 },
    isManual: { type: Boolean, default: false }
});

// Ek employee ka ek din mein ek hi record rahega
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);