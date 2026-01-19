const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const startMachineSync = require('./utils/biometric');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/payrollDB')
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("MongoDB Error:", err));

// Routes
app.use('/api/payroll', require('./routes/payrollRoutes'));

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    
    
});