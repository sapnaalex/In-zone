# In-zone ⏱️

A minimalist full-stack flow-state dashboard built with ReactJS and Node.js/Express.js designed to eliminate productivity overwhelm and keep you completely locked into deep work.

## 🚀 Key Features

### Core Productivity Suite
- **Flow Timer:** A customizable countdown timer for deep work sessions and recovery breaks.
- **The Rule of 3:** A task manager restricted to a maximum of 3 absolute priorities to prevent cognitive overload.
- **Distraction Dump (AI-Powered):** A rapid-capture input to offload passing thoughts. Intrusive thoughts are auto-categorized by a machine learning model to help you track what breaks your focus.

### Mandatory Production Infrastructure
- **Secure Authentication:** User sign-up and login capabilities using secure session management.
- **Interactive Contact Page:** A working feedback/support form for user inquiries.
- **Automated Email Engine:** Triggered email notifications (such as system welcome emails or contact form acknowledgments).
- **User Analytics:** Deep integration tracking user retention, interaction metrics, and dashboard performance.
- **High-Load Performance:** Backend architecture load-tested to handle over 1,000 concurrent users seamlessly.

---

## 🛠️ Tech Stack

- **Frontend:** ReactJS, Vite, React Router, React-GA4 (Google Analytics)
- **Backend:** Node.js, Express.js
- **Load Testing:** k6 / Artillery
- **Deployment:** Vercel (Client) & Render (Server)

---

## 📦 Project Directory Layout

```text
In-zone/
├── client/          # ReactJS Frontend Application
├── server/          # Node.js / Express.js Backend API
├── CONTRIBUTING.md  # Guidelines for open-source contributors
└── README.md        # Project overview and setup instructions

1. Clone the Repository
Bash
git clone [https://github.com/sapnaalex/In-zone.git]
cd In-zone

2. Setup the Backend Server
Bash
cd server
npm install
npm start
The backend server runs on http://localhost:5000 by default.

3. Setup the Frontend Client
Open a new terminal window or tab, then run:

Bash
cd client
npm install
npm run dev
The frontend application will open on http://localhost:5173.

🤝 Contributing
We welcome contributions! Please review our CONTRIBUTING.md file for details on our code of conduct, branching strategies, and the process for submitting pull requests.

If you encounter any bugs or have feature ideas, please open an issue in the GitHub Issues tab using our standard feature/bug templates.


---

### What to do next in your terminal:

Now that you have your code files (`App.css`, `App.jsx`, `server.js`) and your `README.md` file saved in your folder, run this final chain of commands to push everything up:

```bash
git add .
git commit -m "Docs: Add comprehensive full-stack README"
git push
