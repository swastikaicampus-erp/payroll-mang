const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const startMachineSync = require('./utils/biometric');

const app = express();
app.use(cors());
app.use(express.json());



// MongoDB Connection
const dbURI = 'mongodb+srv://payroll_sys:payroll_sys1010@cluster0.dp8r3pt.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
    .then(() => console.log("✅ MongoDB Atlas Connected Successfully"))
    .catch(err => console.log("❌ Connection Error:", err));

// Routes
app.use('/api/payroll', require('./routes/payrollRoutes'));

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    
});