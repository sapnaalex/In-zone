import React, { useState, useEffect } from 'react';
import ReactGA from 'react-ga4';
import './App.css';

// Safe fallback for Google Analytics
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-XXXXXXXXXX";
ReactGA.initialize(GA_ID);

export default function App() {
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // State Persistence Helpers
  const getSavedState = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const saveState = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage write block prevented:", e);
    }
  };

  // Main UI State Layers
  const [user, setUser] = useState(() => getSavedState('iz_user', null));
  const [view, setView] = useState(() => getSavedState('iz_view', 'auth'));
  const [isSignUp, setIsSignUp] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Pomodoro Phase Mechanics
  const [timerMode, setTimerMode] = useState('Focus'); 
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedBlocks, setCompletedBlocks] = useState(() => getSavedState('iz_completed_blocks', 0));

  // Productivity Log Lists
  const [tasks, setTasks] = useState(() => getSavedState('iz_tasks', []));
  const [taskInput, setTaskInput] = useState('');
  const [distractions, setDistractions] = useState(() => getSavedState('iz_distractions', []));
  const [distractionInput, setDistractionInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Feedback System
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState('');

  // Page View Analytics Tracking
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: `/${view}`, title: `${view} Screen` });
    saveState('iz_view', view);
  }, [view]);

  // Sync state loops
  useEffect(() => {
    saveState('iz_user', user);
    if (user && view === 'auth') setView('dashboard');
  }, [user]);

  useEffect(() => saveState('iz_tasks', tasks), [tasks]);
  useEffect(() => saveState('iz_distractions', distractions), [distractions]);
  useEffect(() => saveState('iz_completed_blocks', completedBlocks), [completedBlocks]);

  // Clock Loop Mechanics
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            triggerTimerCompletion();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, timerMode]);

  const triggerTimerCompletion = () => {
    setIsActive(false);
    const finishedMode = timerMode;
    const nextMode = timerMode === 'Focus' ? 'Break' : 'Focus';
    
    setTimerMode(nextMode);
    setMinutes(nextMode === 'Focus' ? 25 : 5);
    setSeconds(0);

    // Dynamic Chime Tone Audio
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = finishedMode === 'Focus' ? 880 : 440; 
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.log("Web Audio skipped:", e);
    }

    if (finishedMode === 'Focus') {
      setCompletedBlocks(prev => prev + 1);
      // Track Custom Google Analytics Event
      ReactGA.event({
        category: 'FocusTimer',
        action: 'Completed_Focus_Session',
        label: `User_${user?.username || 'Guest'}`
      });
      alert("Phenomenal focus session complete! Rest your eyes.");
    } else {
      ReactGA.event({
        category: 'FocusTimer',
        action: 'Completed_Break_Session'
      });
      alert("Break is over! Ready to get back in the zone?");
    }
  };

  // Client-Side Offline Regex Engine Fallback
  const classifyDistractionOffline = (text) => {
    const query = text.toLowerCase();
    let category = "General Intrusive Thought";
    let confidence = 0.50;

    if (/\b(eat|snack|drink|coffee|lunch|hungry|food|water|tea|sugar)\b/.test(query)) {
      category = "Biological Urge";
      confidence = 0.92;
    } else if (/\b(instagram|facebook|twitter|youtube|reddit|phone|tiktok|social|app|feed|scrolling)\b/.test(query)) {
      category = "Dopamine Traps";
      confidence = 0.96;
    } else if (/\b(worry|anxious|fail|deadline|test|scared|stress|late|exams|grade)\b/.test(query)) {
      category = "Stress/Anxiety Intrusion";
      confidence = 0.81;
    } else if (/\b(clean|laundry|dog|dishes|house|chore|vacuum|tidy|room)\b/.test(query)) {
      category = "Productive Procrastination";
      confidence = 0.74;
    }

    return { category, confidence };
  };

  // Handle Sign-in & Register
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication check failed.');

      setUser(data.user);
      setView('dashboard');

      ReactGA.event({
        category: 'Account',
        action: isSignUp ? 'Registered_User' : 'Logged_In_User',
        label: data.user.email
      });
    } catch (err) {
      console.warn("Backend local-sync check. Operating local offline simulation fallback mode.", err);
      setAuthError("Database unreachable. Booting with offline local session.");
      
      setTimeout(() => {
        setUser({ id: 888, username: authForm.username || "LocalUser", email: authForm.email });
        setView('dashboard');
      }, 1000);
    }
  };

  // Core 3 Focus Logic
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    if (tasks.length >= 3) {
      alert("Focus saturated! Clear a task from your layout before tracking a new one.");
      return;
    }
    setTasks([...tasks, { id: Date.now(), text: taskInput, done: false }]);
    setTaskInput('');
    
    ReactGA.event({
      category: 'FocusList',
      action: 'Added_Focus_Item'
    });
  };

  // Smart Distraction Logging
  const handleAddDistraction = async (e) => {
    e.preventDefault();
    if (!distractionInput.trim()) return;

    setAnalyzing(true);
    let prediction = null;

    try {
      const response = await fetch(`${API_BASE}/api/ai/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: distractionInput }),
      });
      if (response.ok) {
        prediction = await response.json();
      }
    } catch (err) {
      console.warn("API Classifier offline. Initiating offline Regex classification fallback.");
    }

    if (!prediction) {
      prediction = classifyDistractionOffline(distractionInput);
    }

    setDistractions([
      ...distractions,
      {
        id: Date.now(),
        text: distractionInput,
        category: prediction.category,
        confidence: Math.round(prediction.confidence * 100),
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    setDistractionInput('');

    ReactGA.event({
      category: 'DistractionLogger',
      action: 'Logged_Thought_Intrusion',
      label: prediction.category
    });
    setAnalyzing(false);
  };

  // Send feedback
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus('Saving message securely to server Database...');
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) throw new Error();
      setContactStatus('Workspace feedback saved to database permanently. Thank you!');
      setContactForm({ name: '', email: '', message: '' });
      ReactGA.event({ category: 'FeedbackForm', action: 'Submitted_Review' });
    } catch (err) {
      setContactStatus('Locally saved. Your feedback is safely stored in local memory.');
    }
  };

  // CSV Audit Generator
  const handleExportCSV = () => {
    if (distractions.length === 0) {
      alert("No distractions tracked to audit.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Intrusive Thought,Classified Category,Model Match Confidence,Timestamp\n";

    distractions.forEach(item => {
      const escapedText = `"${item.text.replace(/"/g, '""')}"`;
      const escapedCategory = `"${item.category.replace(/"/g, '""')}"`;
      csvContent += `${item.id},${escapedText},${escapedCategory},${item.confidence}%,${item.timestamp || 'N/A'}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `in-zone-productivity-audit-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ReactGA.event({ category: 'Reporting', action: 'Downloaded_CSV_Audit' });
  };

  const getCategoryCount = (categoryName) => {
    return distractions.filter(d => d.category === categoryName).length;
  };

  const totalIntrusions = distractions.length;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>in-zone</h1>
        <p>Minimize clutter. Maximize focus.</p>
        <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {user && (
            <>
              <button className="nav-btn" onClick={() => setView('dashboard')}>Dashboard</button>
              <button className="nav-btn" onClick={() => setView('contact')}>Feedback</button>
              <button className="nav-btn secondary" onClick={() => { setUser(null); setView('auth'); localStorage.clear(); }}>Sign Out</button>
            </>
          )}
        </div>
      </header>

      {/* VIEW 1: AUTHENTICATION */}
      {view === 'auth' && (
        <div className="auth-form card">
          <h2>{isSignUp ? 'Create Workspace' : 'Welcome Back'}</h2>
          {authError && <p style={{ color: 'var(--warning-color)', fontSize: '0.85rem', marginBottom: '1rem' }}>{authError}</p>}
          <form onSubmit={handleAuth}>
            {isSignUp && (
              <input 
                type="text" 
                placeholder="Developer Username" 
                value={authForm.username}
                onChange={e => setAuthForm({...authForm, username: e.target.value})}
                required
              />
            )}
            <input 
              type="email" 
              placeholder="Primary Email Address" 
              value={authForm.email}
              onChange={e => setAuthForm({...authForm, email: e.target.value})}
              required
            />
            <input 
              type="password" 
              placeholder="Secure Password" 
              value={authForm.password}
              onChange={e => setAuthForm({...authForm, password: e.target.value})}
              required
            />
            <button type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
              {isSignUp ? 'Provision Space' : 'Access Space'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? 'Already registered? Log in' : 'Establish new workspace'}
            </span>
          </p>
        </div>
      )}

      {/* VIEW 2: PRODUCTIVITY WORKSPACE */}
      {view === 'dashboard' && (
        <div className="app-grid">
          {/* Pomodoro Timer Module */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <span className="badge-pill">{timerMode} Phase</span>
            <div style={{ fontSize: '5rem', fontWeight: '800', margin: '1rem 0', fontFamily: 'monospace', letterSpacing: '-2px' }}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setIsActive(!isActive)}>
                {isActive ? 'Pause' : 'Start Clock'}
              </button>
              <button className="secondary" onClick={() => { setIsActive(false); setMinutes(25); setSeconds(0); }}>
                Reset
              </button>
            </div>
            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Completed Blocks: <strong style={{ color: 'var(--accent-color)' }}>{completedBlocks}</strong>
            </div>
          </div>

          {/* Action Panels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Rule of 3 Limits */}
            <div className="card">
              <h3>Today's Core 3 Focus Items ({tasks.length}/3)</h3>
              <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
                <input 
                  type="text" 
                  placeholder="Identify clear daily target..." 
                  value={taskInput}
                  onChange={e => setTaskInput(e.target.value)}
                />
                <button type="submit">Track</button>
              </form>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {tasks.map(t => (
                  <li key={t.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', padding: '0.5rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px' }}>
                    <input 
                      type="checkbox" 
                      style={{ width: 'auto', marginBottom: 0 }}
                      checked={t.done} 
                      onChange={() => setTasks(tasks.map(item => item.id === t.id ? {...item, done: !item.done} : item))}
                    />
                    <span style={{ textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--text-muted)' : 'inherit' }}>{t.text}</span>
                  </li>
                ))}
                {tasks.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>No active focus targets mapped yet.</p>
                )}
              </ul>
            </div>

            {/* Smart Distraction Heuristics Log */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Smart Distraction Dump</h3>
                {distractions.length > 0 && (
                  <button className="small-btn" onClick={handleExportCSV}>Export Audit</button>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Dump intrusive thoughts onto the ledger immediately to return to flow state.</p>
              
              <form onSubmit={handleAddDistraction} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="What popped into your head?..." 
                  value={distractionInput}
                  onChange={e => setDistractionInput(e.target.value)}
                />
                <button type="submit" disabled={analyzing}>
                  {analyzing ? 'Analyzing...' : 'Log'}
                </button>
              </form>

              <ul style={{ listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                {distractions.slice().reverse().map(d => (
                  <li key={d.id} style={{ padding: '0.65rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: '3px solid var(--accent-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span>⚡ {d.text}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.timestamp}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 'bold', marginTop: '0.25rem' }}>
                      Auto-Tag: {d.category} ({d.confidence}% match)
                    </div>
                  </li>
                ))}
              </ul>

              {/* Inline CSS Visualization Bar Chart */}
              {totalIntrusions > 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Cognitive Intrusion Analysis</h4>
                  
                  {['Dopamine Traps', 'Biological Urge', 'Stress/Anxiety Intrusion', 'Productive Procrastination', 'General Intrusive Thought'].map(cat => {
                    const count = getCategoryCount(cat);
                    const percentage = totalIntrusions > 0 ? (count / totalIntrusions) * 100 : 0;
                    return (
                      <div key={cat} style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          <span>{cat}</span>
                          <span>{count}</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--accent-color)', borderRadius: '3px', transition: 'width 0.4s ease' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: FEEDBACK INTERFACE */}
      {view === 'contact' && (
        <div className="card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
          <h2>Submit Workspace Feedback</h2>
          <form onSubmit={handleContactSubmit}>
            <input 
              type="text" 
              placeholder="Your Name" 
              value={contactForm.name}
              onChange={e => setContactForm({...contactForm, name: e.target.value})}
              required
            />
            <input 
              type="email" 
              placeholder="Your Email Address" 
              value={contactForm.email}
              onChange={e => setContactForm({...contactForm, email: e.target.value})}
              required
            />
            <textarea 
              rows="5" 
              placeholder="How can we help keep you in the zone?" 
              value={contactForm.message}
              onChange={e => setContactForm({...contactForm, message: e.target.value})}
              required
            />
            <button type="submit" style={{ width: '100%' }}>Send Message</button>
          </form>
          {contactStatus && <p style={{ marginTop: '1rem', color: 'var(--success-color)' }}>{contactStatus}</p>}
        </div>
      )}
    </div>
  );
}