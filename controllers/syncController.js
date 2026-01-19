const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

exports.syncDailyLog = async (req, res) => {
    try {
        const { empId, time, date } = req.body; // Machine se ID, Time aur Date aayega
        const employee = await Employee.findOne({ employeeId: empId });

        if (!employee) return res.status(404).send("Employee not registered");

        // Aaj ka record check karo
        let attendance = await Attendance.findOne({ employeeId: empId, date: date });

        if (!attendance) {
            // Agar pehli baar finger lagayi to "Check-In"
            let lateMin = 0;
            const shiftStart = "09:00"; // Aap employee model se bhi le sakte hain
            
            if (time > shiftStart) {
                const diff = (new Date(`2025-01-01 ${time}`) - new Date(`2025-01-01 ${shiftStart}`)) / 60000;
                lateMin = diff > 0 ? diff : 0;
            }

            attendance = new Attendance({
                employeeId: empId,
                date: date,
                checkIn: time,
                lateMinutes: lateMin
            });
        } else {
            // Agar dobara finger lagayi to "Check-Out"
            attendance.checkOut = time;

            // Overtime calculation (After 8 hours)
            const workHours = (new Date(`2025-01-01 ${time}`) - new Date(`2025-01-01 ${attendance.checkIn}`)) / 3600000;
            if (workHours > 8) {
                attendance.overtimeMinutes = (workHours - 8) * 60;
            }
        }

        await attendance.save();
        res.status(200).json({ message: "Sync Successful", data: attendance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};