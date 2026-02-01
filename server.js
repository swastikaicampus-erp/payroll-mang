const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Add this

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // FormData parsing ke liye

// IMPORTANT: Uploads folder ko public banayein
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/payroll', require('./routes/payrollRoutes'));

const dbURI = 'mongodb+srv://payroll_sys:payroll_sys1010@cluster0.dp8r3pt.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI)
    .then(() => console.log("✅ MongoDB Atlas Connected"))
    .catch(err => console.log("❌ Connection Error:", err));

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));