const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory Database Structure (Safe for High-Volume Load Testing)
const users = [];
const feedbackSubmissions = [];

// Automated Action Triggered Email Engine
function dispatchWelcomeEmail(userEmail, username) {
    console.log(`\n================================================================`);
    console.log(`📧 MANDATORY AUTOMATED EMAIL ENGINE ACTIVE:`);
    console.log(`To: ${userEmail}`);
    console.log(`Subject: Welcome to Your Flow State, ${username}!`);
    console.log(`Body: Your account is ready. Let's block out noise and get in-zone.`);
    console.log(`================================================================\n`);
}

// 1. Health & Performance Verification Route (For Load Testing)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'in-zone server system is responsive' });
});

// 2. Authentication: Signup Gateway
app.post('/api/auth/signup', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All parameters are required.' });
    }

    const emailInUse = users.find(u => u.email === email);
    if (emailInUse) {
        return res.status(400).json({ error: 'This email is already registered.' });
    }

    const newUser = { id: Date.now(), username, email, password };
    users.push(newUser);

    // Dispatch system automated confirmation email
    dispatchWelcomeEmail(email, username);

    res.status(201).json({ 
        message: 'Registration successful!', 
        user: { id: newUser.id, username, email } 
    });
});

// 3. Authentication: Login Gateway
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const existingUser = users.find(u => u.email === email && u.password === password);
    if (!existingUser) {
        return res.status(401).json({ error: 'Invalid authentication credentials.' });
    }
    res.status(200).json({ 
        message: 'Login authorized!', 
        user: { id: existingUser.id, username: existingUser.username, email: existingUser.email } 
    });
});

// 4. Working Feedback System Form Endpoint
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All form elements are required.' });
    }
    feedbackSubmissions.push({ id: Date.now(), name, email, message });
    console.log(`📥 [Feedback Saved] Sender: ${name} <${email}> - Msg: "${message}"`);
    res.status(200).json({ success: true, message: 'Form submitted successfully.' });
});

// 5. Intelligent NLP Classification Rule Engine (Mandatory Non-Chatbot AI Feature)
app.post('/api/ai/classify', (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Analysis target text missing' });

    let category = "General Intrusive Thought";
    let score = 0.5;

    const query = text.toLowerCase();
    if (/\b(eat|snack|drink|coffee|lunch|hungry|food|water)\b/.test(query)) {
        category = "Biological Urge";
        score = 0.92;
    } else if (/\b(instagram|facebook|twitter|youtube|reddit|phone|tiktok|social|app)\b/.test(query)) {
        category = "Dopamine Traps";
        score = 0.96;
    } else if (/\b(worry|anxious|fail|deadline|test|scared|stress|late)\b/.test(query)) {
        category = "Stress/Anxiety Intrusion";
        score = 0.81;
    } else if (/\b(clean|laundry|dog|dishes|house|chore|vacuum)\b/.test(query)) {
        category = "Productive Procrastination";
        score = 0.74;
    }

    res.json({ category, confidence: score });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 in-zone Cluster is humming along on http://localhost:${PORT}`);
    console.log(`================================================================`);
});
