const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    lateFinePerMinute: { type: Number, default: 2 },
    overtimePayPerHour: { type: Number, default: 150 },
    halfDayThresholdHours: { type: Number, default: 4 }, 
    halfDayPayFactor: { type: Number, default: 0.5 }   
});

module.exports = mongoose.model('Settings', SettingsSchema);