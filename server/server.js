const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Health Check Route (Crucial for our Day 5 Load Testing)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'in-zone API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});