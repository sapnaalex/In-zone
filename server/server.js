const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// File paths for JSON "Database" tables
const USERS_FILE = path.join(__dirname, 'db_users.json');
const FEEDBACK_FILE = path.join(__dirname, 'db_feedback.json');

// Helper to safely load data from JSON files
function readData(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([]));
        }
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        console.error(`Database read failure at ${filePath}:`, e);
        return [];
    }
}

// Helper to safely save data to JSON files
function writeData(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(`Database write failure at ${filePath}:`, e);
    }
}

// Simulated Welcome Email Dispatcher
function sendWelcomeEmail(userEmail, username) {
    console.log(`\n========================================`);
    console.log(`📨 DATABASE ENGINE DISPATCHED EMAIL:`);
    console.log(`To: ${userEmail}`);
    console.log(`Subject: Welcome back to flow-state, ${username}!`);
    console.log(`Body: Your space is secure. Let's block out distractions.`);
    console.log(`========================================\n`);
}

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Day 3 Persistent Cluster is active.' });
});

// Authentication: Secure Sign-Up with File-Based DB
app.post('/api/auth/signup', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const users = readData(USERS_FILE);
    const userExists = users.find(u => u.email === email);
    if (userExists) {
        return res.status(400).json({ error: 'Email already registered.' });
    }

    const newUser = { id: Date.now(), username, email, password };
    users.push(newUser);
    writeData(USERS_FILE, users);

    sendWelcomeEmail(email, username);

    res.status(201).json({ message: 'User stored in database!', user: { id: newUser.id, username, email } });
});

// Authentication: Secure Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const users = readData(USERS_FILE);
    
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
    }
    res.status(200).json({ message: 'Welcome back!', user: { id: user.id, username: user.username, email: user.email } });
});

// Contact & Support Feedback Route
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All form fields are required.' });
    }

    const feedback = readData(FEEDBACK_FILE);
    feedback.push({ id: Date.now(), name, email, message });
    writeData(FEEDBACK_FILE, feedback);

    console.log(`📩 Saved message from ${name} to persistent feedback.json`);
    res.status(200).json({ success: true, message: 'Message recorded permanently.' });
});

// AI Heuristic Classifier API
app.post('/api/ai/classify', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Evaluation query text required.' });

    let category = "General Distraction";
    let score = 0.5;

    const lowerText = text.toLowerCase();
    if (/\b(eat|snack|drink|coffee|lunch|hungry|food)\b/.test(lowerText)) {
        category = "Biological Need";
        score = 0.92;
    } else if (/\b(instagram|facebook|twitter|youtube|reddit|phone|tiktok|social)\b/.test(lowerText)) {
        category = "Social Media Impulse";
        score = 0.96;
    } else if (/\b(worry|anxious|fail|deadline|test|scared|stress)\b/.test(lowerText)) {
        category = "Stress/Anxiety Intrusion";
        score = 0.81;
    } else if (/\b(clean|laundry|dog|dishes|house|chore)\b/.test(lowerText)) {
        category = "Chore Avoidance";
        score = 0.74;
    }

    res.json({ category, confidence: score });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 Day 3 Secure JSON Database active on port ${PORT}`);
    console.log(`========================================`);
});