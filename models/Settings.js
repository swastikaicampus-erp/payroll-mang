const mongoose = require('mongoose');
const SettingsSchema = new mongoose.Schema({
    lateFinePerMinute: { type: Number, default: 2 },
    overtimePayPerHour: { type: Number, default: 150 },
});
module.exports = mongoose.model('Settings', SettingsSchema);