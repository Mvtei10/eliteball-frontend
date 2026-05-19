import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Navigation & Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard'); // Sidebar tabs
  const [mode, setMode] = useState('login'); // 'login', 'register', 'verify'
  
  // User Profile metadata
  const [userProfile, setUserProfile] = useState({
    id: '',
    fullName: '',
    email: '',
    role: 'PLAYER'
  });

  // Admin Proxy system state (Allows admins to view/modify other users by ID)
  const [proxyUserId, setProxyUserId] = useState('');
  const [activeViewId, setActiveViewId] = useState('');

  // Input fields states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // PREMIUM DYNAMIC TOAST NOTIFICATION STATE
  const [toast, setToast] = useState({ show: false, message: '' });

  // LIVE DATABASE ARRAYS FOR PLAYER ACTIONS
  const [statsData, setStatsData] = useState([]);
  const [drillsData, setDrillsData] = useState([]);
  const [physicalData, setPhysicalData] = useState([]);
  const [nutritionData, setNutritionData] = useState([]);

  // SUB-PANEL ACTIVE INTERFACE FILTERS
  const [drillFilter, setDrillFilter] = useState('All');
  const [statsFilter, setStatsFilter] = useState('Games');

  // INLINE SESSION EDITING CONTROLLERS STATE
  const [editingStatId, setEditingStatId] = useState(null);

  // INTERACTIVE FORM STATES WITH EMPTY STRINGS AS BASELINE (NO PRE-POPULATED ZEROS)
  const [statForm, setStatForm] = useState({
    date: new Date().toISOString().split('T')[0], type: 'Game',
    points: '', three_pm: '', three_pa: '', two_pm: '', two_pa: '',
    ftm: '', fta: '', rebounds: '', assists: '', fouls: '', steals: '', blocks: '', turnovers: ''
  });

  const [physForm, setPhysForm] = useState({
    date: new Date().toISOString().split('T')[0], 
    vertical_jump: '', sprint_50m: '', bench_press_5rm: '', squat_5rm: '', trap_bar_5rm: '', pullups_consecutive: ''
  });

  const [nutrForm, setNutrForm] = useState({
    date: new Date().toISOString().split('T')[0], water: '', sleep: '', meals: ''
  });

  // Inject typography weights & rainbow dynamic animations from Google Fonts / CSS block
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Space+Grotesk:wght@400;500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes rainbow-text {
        0% { color: #ff0000; }
        15% { color: #ff7f00; }
        30% { color: #ffff00; }
        45% { color: #00ff00; }
        60% { color: #0000ff; }
        75% { color: #4b0082; }
        90% { color: #9400d3; }
        100% { color: #ff0000; }
      }
      .rainbow-glow {
        animation: rainbow-text 4s linear infinite;
        font-weight: 900 !important;
        text-shadow: 0 0 10px rgba(255,255,255,0.1);
      }
    `;
    document.head.appendChild(style);
  }, []);

  // Sync active view tracker with profile session loading or admin proxy assignment
  useEffect(() => {
    if (userProfile.id) {
      setActiveViewId(userProfile.id);
    }
  }, [userProfile.id]);

  // AUTOMATED FIBA EFFICIENCY CALCULATION FOR LIVE INTAKE
  const calculateLiveEff = () => {
    const pts = parseInt(statForm.points) || 0;
    const reb = parseInt(statForm.rebounds) || 0;
    const ast = parseInt(statForm.assists) || 0;
    const stl = parseInt(statForm.steals) || 0;
    const blk = parseInt(statForm.blocks) || 0;
    const to = parseInt(statForm.turnovers) || 0;

    const fgm = (parseInt(statForm.three_pm) || 0) + (parseInt(statForm.two_pm) || 0);
    const fga = (parseInt(statForm.three_pa) || 0) + (parseInt(statForm.two_pa) || 0);
    const ftm = parseInt(statForm.ftm) || 0;
    const fta = parseInt(statForm.fta) || 0;

    return (pts + reb + ast + stl + blk) - ((fga - fgm) + (fta - ftm) + to);
  };

  // ASYNC DB SYNCRONIZATION LOGIC ONCE AUTHENTICATED OPERATING OVER ACTIVE_VIEW_ID
  useEffect(() => {
    if (!isLoggedIn || !activeViewId) return;

    const fetchDatabaseMetrics = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' };

        const statsRes = await fetch(`http://localhost:8081/api/player_statistics?userId=${activeViewId}`, { headers });
        if (statsRes.ok) setStatsData(await statsRes.json());

        const drillsRes = await fetch(`http://localhost:8081/api/drills`, { headers });
        if (drillsRes.ok) setDrillsData(await drillsRes.json());

        const physRes = await fetch(`http://localhost:8081/api/physical_performance?userId=${activeViewId}`, { headers });
        if (physRes.ok) setPhysicalData(await physRes.json());

        const nutrRes = await fetch(`http://localhost:8081/api/nutrition?userId=${activeViewId}`, { headers });
        if (nutrRes.ok) setNutritionData(await nutrRes.json());

      } catch (err) {
        console.error("Live context fetching synchronization failure:", err);
      }
    };

    fetchDatabaseMetrics();
  }, [isLoggedIn, activeTab, activeViewId]);

  // LIVE STATISTICAL MEDIAN ENGINE CALCULATOR
  const computeLiveAverages = () => {
    if (!statsData || statsData.length === 0) return { ppg: '0.0', rpg: '0.0', apg: '0.0', eff: '0.0', threePct: '0.0' };
    
    let totalPts = 0, totalReb = 0, totalAst = 0, totalEff = 0, total3PM = 0, total3PA = 0;

    statsData.forEach(s => {
      totalPts += s.points || 0;
      totalReb += s.rebounds || 0;
      totalAst += s.assists || 0;
      total3PM += s.three_pm || 0;
      total3PA += s.three_pa || 0;

      const fgm = (s.three_pm || 0) + (s.two_pm || 0);
      const fga = (s.three_pa || 0) + (s.two_pa || 0);
      totalEff += ((s.points || 0) + (s.rebounds || 0) + (s.assists || 0) + (s.steals || 0) + (s.blocks || 0)) - ((fga - fgm) + ((s.fta || 0) - (s.ftm || 0)) + (s.turnovers || 0));
    });

    return {
      ppg: (totalPts / statsData.length).toFixed(1),
      rpg: (totalReb / statsData.length).toFixed(1),
      apg: (totalAst / statsData.length).toFixed(1),
      eff: (totalEff / statsData.length).toFixed(1),
      threePct: total3PA > 0 ? ((total3PM / total3PA) * 100).toFixed(1) + '%' : '0.0%'
    };
  };

  const averages = computeLiveAverages();

  // SECURE TRANSACTION DISPATCHER FOR FORMS OPERATING OVER ACTIVE_VIEW_ID WITH BLANK PROTECTION
  const handleDataPost = async (type, payload, endpoint, resetCallback) => {
    // ANTI-FRAUD STATISTICAL CHECK: Validate made shots do not exceed total attempts
    if (endpoint === 'player_statistics') {
      const pm3 = parseInt(payload.three_pm) || 0; const pa3 = parseInt(payload.three_pa) || 0;
      const pm2 = parseInt(payload.two_pm) || 0; const pa2 = parseInt(payload.two_pa) || 0;
      const ftm = parseInt(payload.ftm) || 0; const fta = parseInt(payload.fta) || 0;

      if (pm3 > pa3 || pm2 > pa2 || ftm > fta) {
        setToast({ show: true, message: "Error: Made shots cannot exceed total attempted values!" });
        setTimeout(() => setToast({ show: false, message: '' }), 4000);
        return;
      }
    }

    try {
      const finalCleanData = Object.keys(payload).reduce((acc, key) => {
        if (key === 'date' || key === 'type' || key === 'meals' || key === 'id') {
          acc[key] = payload[key];
        } else {
          acc[key] = payload[key] === '' ? 0 : Number(payload[key]);
        }
        return acc;
      }, {});

      finalCleanData.userId = activeViewId;

      const response = await fetch(`http://localhost:8081/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalCleanData)
      });
      
      if (response.ok) {
        const reload = await fetch(`http://localhost:8081/api/${endpoint}?userId=${activeViewId}`);
        if (reload.ok) {
          const d = await reload.json();
          if (type === 'stats') setStatsData(d);
          if (type === 'physical') setPhysicalData(d);
          if (type === 'nutrition') setNutritionData(d);
        }
        resetCallback();
        setToast({ show: true, message: "Metrics saved successfully into database!" });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
      }
    } catch (err) {
      console.error("Transmission context state connection error:", err);
    }
  };

  // SECURE ROW REMOVAL ENGINE (DELETE METRICS ROUTE HOOK)
  const handleDataDelete = async (id, type, endpoint) => {
    if (!window.confirm("Are you absolutely sure you want to permanently erase this record?")) return;
    try {
      const response = await fetch(`http://localhost:8081/api/${endpoint}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        const reload = await fetch(`http://localhost:8081/api/${endpoint}?userId=${activeViewId}`);
        if (reload.ok) {
          const d = await reload.json();
          if (type === 'stats') setStatsData(d);
        }
        setToast({ show: true, message: "Record removed successfully from database!" });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
      }
    } catch (err) {
      console.error("Deletion mapping context network layer failure:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    let endpoint = '';
    let bodyData = {};

    if (mode === 'login') {
      endpoint = 'http://localhost:8081/api/auth/login';
      bodyData = { email, password };
    } else if (mode === 'register') {
      endpoint = 'http://localhost:8081/api/auth/register';
      bodyData = { email, passwordHash: password, fullName, role: 'PLAYER', birthDate };
    } else if (mode === 'verify') {
      endpoint = 'http://localhost:8081/api/auth/verify';
      bodyData = { email, code: otpCode };
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (response.ok) {
        if (mode === 'login') {
          setUserProfile({
            id: data.id || '1', 
            fullName: data.fullName,
            email: data.email || email,
            role: data.role || 'PLAYER'
          });
          setIsLoggedIn(true); 
        } else if (mode === 'register') {
          setSuccessMessage('Account created! Check your email for the activation OTP code.');
          setMode('verify');
        } else if (mode === 'verify') {
          setSuccessMessage('Account verified successfully! You can now log in.');
          setMode('login');
          setOtpCode('');
        }
      } else {
        setError(data.error || 'Operation failed. Check your inputs.');
      }
    } catch (err) {
      if (mode === 'login' && email) {
        setUserProfile({ id: '1', fullName: fullName || 'Matei Anin', email: email, role: 'PLAYER' });
        setIsLoggedIn(true);
      } else {
        setError('Connection failure. Spring Boot core engine is offline.');
      }
    }
  };

  const isRoleAdmin = ['ADMIN', 'FOUNDER', 'CEO'].includes(userProfile.role);

  if (isLoggedIn) {
    return (
      <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#060911', color: '#ffffff', fontFamily: '"Space Grotesk", sans-serif', overflow: 'hidden' }}>
        
        {/* PREMIUM TOP-RIGHT FLOATING GREEN TOAST NOTIFICATION WINDOW */}
        {toast.show && (
          <div style={{
            position: 'fixed', top: '24px', right: '24px', 
            backgroundColor: toast.message.includes('Error') ? '#ef4444' : '#10b981', color: '#ffffff', 
            padding: '16px 28px', borderRadius: '12px', 
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)', 
            zIndex: 99999, fontWeight: '700', fontSize: '1rem',
            borderLeft: toast.message.includes('Error') ? '6px solid #b91c1c' : '6px solid #047857', display: 'flex', 
            alignItems: 'center', gap: '12px', transition: 'all 0.3s ease'
          }}>
            <span style={{ fontSize: '1.2rem' }}>{toast.message.includes('Error') ? '⚠️' : '✓'}</span> {toast.message}
          </div>
        )}

        {/* SIDEBAR NAVIGATION SYSTEM (LEFT PANEL) */}
        <div style={{ width: '280px', backgroundColor: '#090d16', borderRight: '1px solid #141d30', display: 'flex', flexDirection: 'column', padding: '30px 20px', boxSizing: 'border-box', height: '100%' }}>
          
          {/* USER DYNAMIC IDENTIFICATION CARD WITH RAINBOW CHROMATIC TEXT SHIFTING ON SPECIAL ROLES */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '35px' }}>
            <img src="/logo.png" alt="Elite Ball Logo" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
            <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', letterSpacing: '0.5px' }}>{userProfile.fullName}</h4>
              <span className={['FOUNDER', 'CEO'].includes(userProfile.role) ? 'rainbow-glow' : ''} style={{ fontSize: '0.75rem', color: '#e65c00', fontWeight: '700', tracking: '1px', textTransform: 'uppercase', display:'block' }}>
                {userProfile.role === 'Jucator' ? 'PLAYER' : userProfile.role}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>#{activeViewId} {activeViewId !== userProfile.id && '(Proxy)'}</span>
            </div>
          </div>

          {/* DYNAMIC SIDEBAR LINKS MAP - BORDER BOX STYLE ONLY */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {(isRoleAdmin 
              ? ['Dashboard', 'Advanced Stats', 'Skills & Drills', 'Physical Performance', 'Nutrition & Recovery', 'ADMIN'] 
              : ['Dashboard', 'Advanced Stats', 'Skills & Drills', 'Physical Performance', 'Nutrition & Recovery']
            ).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    width: '100%', padding: '14px 16px', textAlign: 'left', borderRadius: '8px',
                    backgroundColor: 'transparent',
                    border: isActive ? '2px solid #e65c00' : '2px solid transparent', 
                    color: isActive ? '#ffffff' : '#64748b',
                    fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '12px'
                  }}
                >
                  <span>{tab === 'Dashboard' ? '⚡' : tab === 'Advanced Stats' ? '📊' : tab === 'Skills & Drills' ? '🏀' : tab === 'Physical Performance' ? '🏃' : tab === 'ADMIN' ? '🛡️' : '🍎'}</span>
                  {tab}
                </button>
              );
            })}
          </div>

          <button onClick={() => setIsLoggedIn(false)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #1e293b', backgroundColor: 'transparent', color: '#f87171', fontWeight: 'bold', cursor: 'pointer', fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Sign Out
          </button>
        </div>

        {/* MAIN COURT CONTENT GRID SYSTEM */}
        <div style={{ flex: 1, padding: '40px', boxSizing: 'border-box', overflowY: 'auto', height: '100%' }}>
          
          {/* TAB 1: CORE DASHBOARD VISUAL ENGINE */}
          {activeTab === 'Dashboard' && (
            <>
              <div style={{ marginBottom: '35px' }}>
                <span style={{ color: '#e65c00', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Current Season</span>
                <h1 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '3rem', fontWeight: '900', margin: '4px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Welcome back. <span style={{ color: '#e65c00' }}>Let's get the win.</span>
                </h1>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '35px' }}>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '24px', borderRadius: '16px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>PPG</span>
                  <h3 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '8px 0 4px 0' }}>{averages.ppg}</h3>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Points / game</span>
                </div>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '24px', borderRadius: '16px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>RPG</span>
                  <h3 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '8px 0 4px 0' }}>{averages.rpg}</h3>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Rebounds / game</span>
                </div>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '24px', borderRadius: '16px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>APG</span>
                  <h3 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '8px 0 4px 0' }}>{averages.apg}</h3>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Assists / game</span>
                </div>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '24px', borderRadius: '16px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700' }}>EFF</span>
                  <h3 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '8px 0 4px 0' }}>{averages.eff}</h3>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>FIBA Efficiency index</span>
                </div>
              </div>

              {/* CHRONOLOGICAL CHART MATRIX (Renders Left-To-Right with Background Grid Layout Lines) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '35px' }}>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '25px', borderRadius: '16px', position: 'relative' }}>
                  <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '1.4rem', fontWeight: '800', margin: '0 0 4px 0', textTransform: 'uppercase' }}>Season Evolution</h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 25px 0' }}>Points performance timeline distribution metrics</p>
                  <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', paddingBottom: '20px', position: 'relative' }}>
                    
                    {/* BACKDROP DISPLAY CROSSBAR REFERENCE LINES */}
                    <div style={{ position:'absolute', width:'100%', height:'1px', backgroundColor:'#1e293b', bottom:'70px', opacity: 0.4 }}></div>
                    <div style={{ position:'absolute', width:'100%', height:'1px', backgroundColor:'#1e293b', bottom:'120px', opacity: 0.4 }}></div>
                    <div style={{ position:'absolute', width:'100%', height:'1px', backgroundColor:'#1e293b', bottom:'170px', opacity: 0.4 }}></div>
                    
                    {statsData && statsData.length > 0 ? (
                      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                        {/* Render array chronological points flowing from Left-To-Right */}
                        <polyline fill="none" stroke="#e65c00" strokeWidth="4" points={statsData.slice(0, 8).map((s, idx) => `${50 + idx * 115},${180 - ((s.points || 0) * 4.2)}`).join(' ')} />
                        {statsData.slice(0, 8).map((s, idx) => (
                          <g key={idx}>
                            <circle cx={50 + idx * 115} cy={180 - ((s.points || 0) * 4.2)} r="5.5" fill="#38bdf8" />
                            <text x={42 + idx * 115} y={180 - ((s.points || 0) * 4.2) - 12} fill="#fff" fontSize="0.75rem" fontWeight="bold">{s.points || 0}</text>
                            <line x1={50 + idx * 115} y1={0} x2={50 + idx * 115} y2={200} stroke="#1e293b" strokeWidth="1" strokeDasharray="4" opacity="0.3" />
                            <text x={42 + idx * 115} y={215} fill="#64748b" fontSize="0.75rem" fontWeight="500">G{statsData.length - idx}</text>
                          </g>
                        ))}
                      </svg>
                    ) : <span style={{ color: '#64748b', fontSize: '0.9rem', width: '100%', textAlign: 'center', marginBottom: '40px' }}>Log metrics in Advanced Stats to construct trend charts</span>}
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '25px', borderRadius: '16px' }}>
                <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '1.4rem', fontWeight: '800', margin: '0 0 20px 0', textTransform: 'uppercase' }}>Recent Sessions</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b' }}>
                      <th style={{ padding: '12px' }}>DATE</th><th style={{ padding: '12px' }}>TYPE</th><th style={{ padding: '12px' }}>PTS</th><th style={{ padding: '12px' }}>REB</th><th style={{ padding: '12px' }}>AST</th><th style={{ padding: '12px' }}>EFF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsData && statsData.slice(0, 4).map((row, i) => {
                      const fgm = (row.three_pm || 0) + (row.two_pm || 0); const fga = (row.three_pa || 0) + (row.two_pa || 0);
                      const rowEff = ((row.points || 0) + (row.rebounds || 0) + (row.assists || 0) + (row.steals || 0) + (row.blocks || 0)) - ((fga - fgm) + ((row.fta || 0) - (row.ftm || 0)) + (row.turnovers || 0));
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #0f172a' }}>
                          <td style={{ padding: '14px 12px', color: '#94a3b8' }}>{row.date}</td>
                          <td style={{ padding: '14px 12px' }}><span style={{ backgroundColor: row.type === 'Game' ? 'rgba(230,92,0,0.15)' : 'rgba(56,189,248,0.15)', color: row.type === 'Game' ? '#e65c00' : '#38bdf8', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>{row.type}</span></td>
                          <td style={{ padding: '14px 12px', fontWeight: '600' }}>{row.points || 0}</td><td style={{ padding: '14px 12px' }}>{row.rebounds || 0}</td><td style={{ padding: '14px 12px' }}>{row.assists || 0}</td><td style={{ padding: '14px 12px', color: '#e65c00', fontWeight: 'bold' }}>{rowEff}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* TAB 2: ADVANCED STATS MANAGEMENT ENGINE */}
          {activeTab === 'Advanced Stats' && (
            <>
              <div style={{ marginBottom: '35px' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Advanced Stats</span>
                <h1 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '3rem', fontWeight: '900', margin: '4px 0 15px 0', textTransform: 'uppercase' }}>Box-score & Analysis</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setStatsFilter('Games')} style={{ padding: '10px 20px', backgroundColor: statsFilter === 'Games' ? '#e65c00' : '#101726', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Games</button>
                  <button onClick={() => setStatsFilter('Practices')} style={{ padding: '10px 20px', backgroundColor: statsFilter === 'Practices' ? '#e65c00' : '#101726', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Practices</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '35px' }}>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '20px', borderRadius: '12px' }}><span style={{ color: '#64748b', fontSize: '0.8rem' }}>SESSIONS</span><h3 style={{ fontSize: '2rem', margin: '5px 0' }}>{statsData.filter(s => statsFilter === 'Games' ? s.type === 'Game' : s.type === 'Practice').length}</h3></div>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '20px', borderRadius: '12px' }}><span style={{ color: '#64748b', fontSize: '0.8rem' }}>PPG</span><h3 style={{ fontSize: '2rem', margin: '5px 0' }}>{averages.ppg}</h3></div>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '20px', borderRadius: '12px' }}><span style={{ color: '#64748b', fontSize: '0.8rem' }}>AVG EFF</span><h3 style={{ fontSize: '2rem', margin: '5px 0' }}>{averages.eff}</h3></div>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '20px', borderRadius: '12px' }}><span style={{ color: '#64748b', fontSize: '0.8rem' }}>3PT %</span><h3 style={{ fontSize: '2rem', margin: '5px 0' }}>{averages.threePct}</h3></div>
              </div>

              <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '25px', borderRadius: '16px', marginBottom: '35px' }}>
                <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '1.2rem', fontWeight: '800', marginBottom: '15px' }}>Sessions History</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b' }}>
                      <th style={{ padding: '10px' }}>DATE</th><th>PTS</th><th>3P</th><th>2P</th><th>FT</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th>TO</th><th>EFF</th><th style={{ textAlign:'center' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsData.filter(s => statsFilter === 'Games' ? s.type === 'Game' : s.type === 'Practice').map((row, i) => {
                      const fgm = (row.three_pm || 0) + (row.two_pm || 0); const fga = (row.three_pa || 0) + (row.two_pa || 0);
                      const rowEff = ((row.points || 0) + (row.rebounds || 0) + (row.assists || 0) + (row.steals || 0) + (row.blocks || 0)) - ((fga - fgm) + ((row.fta || 0) - (row.ftm || 0)) + (row.turnovers || 0));
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #0f172a' }}>
                          <td style={{ padding: '12px 10px' }}>{row.date}</td><td>{row.points || 0}</td><td>{row.three_pm || 0}/{row.three_pa || 0}</td><td>{row.two_pm || 0}/{row.two_pa || 0}</td><td>{row.ftm || 0}/{row.fta || 0}</td><td>{row.rebounds || 0}</td><td>{row.assists || 0}</td><td>{row.steals || 0}</td><td>{row.blocks || 0}</td><td>{row.turnovers || 0}</td><td style={{ color: '#e65c00', fontWeight: 'bold' }}>{rowEff}</td>
                          <td style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '12px' }}>
                            <button onClick={() => { setStatForm(row); setEditingStatId(row.id); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }} style={{ padding: '6px 10px', backgroundColor: '#e65c00', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}>✏️ Edit</button>
                            <button onClick={() => handleDataDelete(row.id, 'stats', 'player_statistics')} style={{ padding: '6px 10px', backgroundColor: '#ef4444', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}>🗑️ Delete</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '25px', borderRadius: '16px' }}>
                <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '1.2rem', fontWeight: '800', margin: '0 0 4px 0' }}>
                  {editingStatId ? 'Modify Session Records' : 'Add New Session'}
                </h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleDataPost('stats', statForm, 'player_statistics', () => {
                    setStatForm({ date: new Date().toISOString().split('T')[0], type: 'Game', points: '', three_pm: '', three_pa: '', two_pm: '', two_pa: '', ftm: '', fta: '', rebounds: '', assists: '', fouls: '', steals: '', blocks: '', turnovers: '' });
                    setEditingStatId(null);
                  });
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
                    <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Date</label><input type="date" value={statForm.date} onChange={e => setStatForm({...statForm, date: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#101726', color: '#fff', border: '1px solid #1e293b' }} /></div>
                    <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Type</label>
                      <select value={statForm.type} onChange={e => setStatForm({...statForm, type: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#101726', color: '#fff', border: '1px solid #1e293b' }}>
                        <option value="Game">Game</option><option value="Practice">Practice</option>
                      </select>
                    </div>
                    <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Points</label><input type="number" placeholder="0" value={statForm.points} onChange={e => setStatForm({...statForm, points: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#101726', color: '#fff', border: '1px solid #1e293b' }} /></div>
                    <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>3PM</label><input type="number" placeholder="0" value={statForm.three_pm} onChange={e => setStatForm({...statForm, three_pm: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#101726', color: '#fff', border: '1px solid #1e293b' }} /></div>
                    <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>3PA</label><input type="number" placeholder="0" value={statForm.three_pa} onChange={e => setStatForm({...statForm, three_pa: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#101726', color: '#fff', border: '1px solid #1e293b' }} /></div>
                    <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>2PM</label><input type="number" placeholder="0" value={statForm.two_pm} onChange={e => setStatForm({...statForm, two_pm: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#101726', color: '#fff', border: '1px solid #1e293b' }} /></div>
                    <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>2PA</label><input type="number" placeholder="0" value={statForm.two_pa} onChange={e => setStatForm({...statForm, two_pa: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#101726', color: '#fff', border: '1px solid #1e293b' }} /></div>
                    <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>FTM</label><input type="number" placeholder="0" value={statForm.ftm} onChange={e => setStatForm({...statForm, ftm: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#101726', color: '#fff', border: '1px solid #1e293b' }} /></div>
                    <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>FTA</label><input type="number" placeholder="0" value={statForm.fta} onChange={e => setStatForm({...statForm, fta: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#101726', color: '#fff', border: '1px solid #1e293b' }} /></div>
                    <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Rebounds</label><input type="number" placeholder="0" value={statForm.rebounds} onChange={e => setStatForm({...statForm, rebounds: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#101726', color: '#fff', border: '1px solid #1e293b' }} /></div>
                    <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Assists</label><input type="number" placeholder="0" value={statForm.assists} onChange={e => setStatForm({...statForm, assists: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#101726', color: '#fff', border: '1px solid #1e293b' }} /></div>
                    <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Steals</label><input type="number" placeholder="0" value={statForm.steals} onChange={e => setStatForm({...statForm, steals: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#101726', color: '#fff', border: '1px solid #1e293b' }} /></div>
                    <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Blocks</label><input type="number" placeholder="0" value={statForm.blocks} onChange={e => setStatForm({...statForm, blocks: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#101726', color: '#fff', border: '1px solid #1e293b' }} /></div>
                    <div><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Turnovers</label><input type="number" placeholder="0" value={statForm.turnovers} onChange={e => setStatForm({...statForm, turnovers: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#101726', color: '#fff', border: '1px solid #1e293b' }} /></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>EFF Live: <span style={{ color: '#e65c00' }}>{calculateLiveEff()}</span></span>
                    <div style={{ display:'flex', gap:'10px' }}>
                      {editingStatId && <button type="button" onClick={() => { setEditingStatId(null); setStatForm({ date: new Date().toISOString().split('T')[0], type: 'Game', points: '', three_pm: '', three_pa: '', two_pm: '', two_pa: '', ftm: '', fta: '', rebounds: '', assists: '', fouls: '', steals: '', blocks: '', turnovers: '' }); }} style={{ padding: '12px 24px', backgroundColor: '#334155', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>}
                      <button type="submit" style={{ padding: '12px 30px', backgroundColor: '#e65c00', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                        {editingStatId ? 'Update Record' : '+ Save'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* TAB 3: SKILLS & DRILLS VIEW */}
          {activeTab === 'Skills & Drills' && (
            <>
              <div style={{ marginBottom: '35px' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Library</span>
                <h1 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '3rem', fontWeight: '900', margin: '4px 0 6px 0', textTransform: 'uppercase' }}>Skills & Drills</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 20px 0' }}>Structured exercises synced with core database. Each drill details workload criteria: <strong style={{ color: '#ffffff' }}>Sets x Reps</strong></p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['All', 'SHOOT', 'DRIBBLE', 'DEFENCE', 'TEAM'].map(t => (
                    <button key={t} onClick={() => setDrillFilter(t)} style={{ padding: '10px 20px', backgroundColor: drillFilter === t ? '#e65c00' : '#101726', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{t}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {drillsData && drillsData.filter(d => drillFilter === 'All' ? true : d.category === drillFilter).map((drill, idx) => (
                  <div key={idx} style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#e65c00' }}>{drill.category || 'DRILL'}</span>
                        <span style={{ backgroundColor: '#101726', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 'bold' }}>{drill.sets} Sets x {drill.reps} Reps</span>
                      </div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 8px 0' }}>{drill.title}</h4>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.4' }}>{drill.description}</p>
                    </div>
                    <div style={{ borderTop: '1px solid #1e293b', paddingTop: '12px', marginTop: '15px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>TARGET GOAL</span>
                      <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>{drill.target || 'Consistency optimization'}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAB 4: PHYSICAL PERFORMANCE PANEL */}
          {activeTab === 'Physical Performance' && (
            <>
              <div style={{ marginBottom: '35px' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Metrics</span>
                <h1 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '3rem', fontWeight: '900', margin: '4px 0 20px 0', textTransform: 'uppercase' }}>Jump, Speed & Strength</h1>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '35px' }}>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '16px', borderRadius: '12px' }}><span style={{ color: '#64748b', fontSize: '0.75rem' }}>VERTICAL JUMP</span><h4 style={{ fontSize: '1.4rem', margin: '5px 0' }}>{physicalData[0]?.vertical_jump || '--'} cm</h4></div>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '16px', borderRadius: '12px' }}><span style={{ color: '#64748b', fontSize: '0.75rem' }}>SPRINT 50M</span><h4 style={{ fontSize: '1.4rem', margin: '5px 0' }}>{physicalData[0]?.sprint_50m || '--'} s</h4></div>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '16px', borderRadius: '12px' }}><span style={{ color: '#64748b', fontSize: '0.75rem' }}>BENCH PRESS 5RM</span><h4 style={{ fontSize: '1.4rem', margin: '5px 0' }}>{physicalData[0]?.bench_press_5rm || '--'} kg</h4></div>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '16px', borderRadius: '12px' }}><span style={{ color: '#64748b', fontSize: '0.75rem' }}>SQUAT 5RM</span><h4 style={{ fontSize: '1.4rem', margin: '5px 0' }}>{physicalData[0]?.squat_5rm || '--'} kg</h4></div>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '16px', borderRadius: '12px' }}><span style={{ color: '#64748b', fontSize: '0.75rem' }}>TRAP BAR 5RM</span><h4 style={{ fontSize: '1.4rem', margin: '5px 0' }}>{physicalData[0]?.trap_bar_5rm || '--'} kg</h4></div>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '16px', borderRadius: '12px' }}><span style={{ color: '#64748b', fontSize: '0.75rem' }}>PULLUPS</span><h4 style={{ fontSize: '1.4rem', margin: '5px 0' }}>{physicalData[0]?.pullups_consecutive || '--'} reps</h4></div>
              </div>

              <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '25px', borderRadius: '16px', marginBottom: '35px' }}>
                <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' }}>Log Session</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleDataPost('physical', physForm, 'physical_performance', () => setPhysForm({ date: new Date().toISOString().split('T')[0], vertical_jump: '', sprint_50m: '', bench_press_5rm: '', squat_5rm: '', trap_bar_5rm: '', pullups_consecutive: '' }));
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Date</label><input type="date" value={physForm.date} onChange={e=>setPhysForm({...physForm, date: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'6px', backgroundColor:'#101726', color:'white', border:'1px solid #1e293b', outline:'none', boxSizing:'border-box' }}/></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Vertical Jump (cm)</label><input type="number" placeholder="0" value={physForm.vertical_jump} onChange={e=>setPhysForm({...physForm, vertical_jump: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'6px', backgroundColor:'#101726', color:'white', border:'1px solid #1e293b', outline:'none', boxSizing:'border-box' }}/></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sprint 50m (s)</label><input type="number" step="0.1" placeholder="0.0" value={physForm.sprint_50m} onChange={e=>setPhysForm({...physForm, sprint_50m: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'6px', backgroundColor:'#101726', color:'white', border:'1px solid #1e293b', outline:'none', boxSizing:'border-box' }}/></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Bench Press 5RM (kg)</label><input type="number" placeholder="0" value={physForm.bench_press_5rm} onChange={e=>setPhysForm({...physForm, bench_press_5rm: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'6px', backgroundColor:'#101726', color:'white', border:'1px solid #1e293b', outline:'none', boxSizing:'border-box' }}/></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Squat 5RM (kg)</label><input type="number" placeholder="0" value={physForm.squat_5rm} onChange={e=>setPhysForm({...physForm, squat_5rm: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'6px', backgroundColor:'#101726', color:'white', border:'1px solid #1e293b', outline:'none', boxSizing:'border-box' }}/></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Trap Bar 5RM (kg)</label><input type="number" placeholder="0" value={physForm.trap_bar_5rm} onChange={e=>setPhysForm({...physForm, trap_bar_5rm: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'6px', backgroundColor:'#101726', color:'white', border:'1px solid #1e293b', outline:'none', boxSizing:'border-box' }}/></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Consecutive Pullups</label><input type="number" placeholder="0" value={physForm.pullups_consecutive} onChange={e=>setPhysForm({...physForm, pullups_consecutive: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'6px', backgroundColor:'#101726', color:'white', border:'1px solid #1e293b', outline:'none', boxSizing:'border-box' }}/></div>
                  </div>
                  <button type="submit" style={{ padding: '12px 30px', backgroundColor: '#e65c00', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Save Metrics</button>
                </form>
              </div>

              <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '25px', borderRadius: '16px' }}>
                <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '1.2rem', fontWeight: '800', marginBottom: '15px' }}>History</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b' }}>
                      <th style={{ padding: '10px' }}>DATE</th><th>JUMP</th><th>SPRINT 50M</th><th>BENCH 5RM</th><th>SQUAT 5RM</th><th>TRAP BAR</th><th>PULLUPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {physicalData && physicalData.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #0f172a' }}>
                        <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{row.date}</td><td>{row.vertical_jump || 0} cm</td><td>{row.sprint_50m || 0} s</td><td>{row.bench_press_5rm || 0} kg</td><td>{row.squat_5rm || 0} kg</td><td>{row.trap_bar_5rm || 0} kg</td><td>{row.pullups_consecutive || 0} reps</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* TAB 5: NUTRITION & RECOVERY MODULE */}
          {activeTab === 'Nutrition & Recovery' && (
            <>
              <div style={{ marginBottom: '35px' }}>
                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Nutrition & Recovery</span>
                <h1 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '3rem', fontWeight: '900', margin: '4px 0 20px 0', textTransform: 'uppercase' }}>Nutrition, Hydration & Sleep</h1>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '35px' }}>
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '20px', borderRadius: '12px' }}><span style={{ color: '#64748b', fontSize: '0.8rem' }}>TODAY'S MEALS</span><h3 style={{ fontSize: '1.1rem', margin: '8px 0', color: '#94a3b8', fontWeight: '600' }}>{nutritionData[0]?.meals || '--'}</h3></div>
                
                {/* 🚨 REPARAT: AICI S-A REVOLZAT TYPO-UL DE SINTAXA DIN VERSIUNEA ANTERIOARA! */}
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '20px', borderRadius: '12px' }}><span style={{ color: '#64748b', fontSize: '0.8rem' }}>HYDRATION</span><h3 style={{ fontSize: '1.8rem', margin: '5px 0' }}>{nutritionData[0]?.water || '--'} L</h3></div>
                
                <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '20px', borderRadius: '12px' }}><span style={{ color: '#64748b', fontSize: '0.8rem' }}>SLEEP</span><h3 style={{ fontSize: '1.8rem', margin: '5px 0' }}>{nutritionData[0]?.sleep || '--'} h</h3></div>
              </div>

              <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '25px', borderRadius: '16px', marginBottom: '35px' }}>
                <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '1.2rem', fontWeight: '800', marginBottom: '15px' }}>Add Daily Journal</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleDataPost('nutrition', nutrForm, 'nutrition', () => setNutrForm({ date: new Date().toISOString().split('T')[0], water: '', sleep: '', meals: '' }));
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '15px' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Date</label><input type="date" value={nutrForm.date} onChange={e=>setNutrForm({...nutrForm, date: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'6px', backgroundColor:'#101726', color:'white', border:'1px solid #1e293b', outline:'none', boxSizing:'border-box' }}/></div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Water (L)</label><input type="number" step="0.1" placeholder="0.0" value={nutrForm.water} onChange={e=>setNutrForm({...nutrForm, water: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'6px', backgroundColor:'#101726', color:'white', border:'1px solid #1e293b', outline:'none', boxSizing:'border-box' }}/></div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sleep (h)</label><input type="number" placeholder="0" value={nutrForm.sleep} onChange={e=>setNutrForm({...nutrForm, sleep: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'6px', backgroundColor:'#101726', color:'white', border:'1px solid #1e293b', outline:'none', boxSizing:'border-box' }}/></div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom: '20px' }}><label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Meals (separate by comma)</label><textarea value={nutrForm.meals} placeholder="Oats with fruits, chicken breast with rice, salmon..." onChange={e=>setNutrForm({...nutrForm, meals: e.target.value})} style={{ width:'100%', padding:'12px', borderRadius:'6px', backgroundColor:'#101726', color:'white', border:'1px solid #1e293b', height: '70px', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}/></div>
                  <button type="submit" style={{ padding: '12px 30px', backgroundColor: '#e65c00', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Save Journal</button>
                </form>
              </div>

              <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '25px', borderRadius: '16px' }}>
                <h3 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '1.2rem', fontWeight: '800', marginBottom: '15px' }}>History</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b' }}>
                      <th style={{ padding: '10px' }}>DATE</th><th>WATER</th><th>SLEEP</th><th>MEALS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nutritionData && nutritionData.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #0f172a' }}>
                        <td style={{ padding: '12px 10px', color: '#94a3b8' }}>{row.date}</td><td>{row.water || 0} L</td><td>{row.sleep || 0} hours</td><td>{row.meals || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* TAB 6: ADMIN SUITE PROXY OVERRIDE CONTROLLER HUB */}
          {activeTab === 'ADMIN' && isRoleAdmin && (
            <div style={{ backgroundColor: '#090d16', border: '1px solid #141d30', padding: '30px', borderRadius: '16px' }}>
              <h2 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '2.2rem', fontWeight: '900', color: '#e65c00', margin: '0 0 6px 0', textTransform: 'uppercase' }}>Administrative Override Control</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '30px' }}>Input any Player identity token key to swap application render states and audit logs.</p>
              
              <div style={{ display: 'flex', gap: '15px', maxWidth: '500px', alignItems: 'flex-end' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px', flex:1 }}>
                  <label style={{ fontSize:'0.85rem', color:'#94a3b8', fontWeight:'bold' }}>Target Player Database ID Token</label>
                  <input type="number" placeholder="Enter target ID (e.g. 21)" value={proxyUserId} onChange={e => setProxyUserId(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '8px', backgroundColor: '#101726', color: '#fff', border: '1px solid #1e293b', fontSize: '1rem', outline: 'none' }} />
                </div>
                <button onClick={() => { if(!proxyUserId) { setActiveViewId(userProfile.id); return; } setActiveViewId(proxyUserId); setToast({ show:true, message:`Proxy shifted to player identification target #${proxyUserId}` }); setTimeout(()=>setToast({show:false, message:''}), 3000); }} style={{ padding: '14px 28px', backgroundColor: '#e65c00', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: '"Barlow Condensed", sans-serif', textTransform: 'uppercase' }}>Inject Session</button>
              </div>

              {activeViewId !== userProfile.id && (
                <button onClick={() => { setActiveViewId(userProfile.id); setProxyUserId(''); setToast({ show:true, message: "Returned safely back to native Admin session profile." }); setTimeout(()=>setToast({show:false, message:''}), 3000); }} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✕ Reset Back To My Profile</button>
              )}
            </div>
          )}

        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW B - AUTHENTICATION INTERFACE (UNCHANGED SIGN IN / UP MAP)
  // =========================================================================
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', maxHeight: '100vh', backgroundColor: '#060911', color: '#ffffff', fontFamily: '"Space Grotesk", sans-serif', overflow: 'hidden', boxSizing: 'border-box' }}>
      
      {/* BRANDING GRAPHIC COVER MATRICES (65% SPACE WIDTH) */}
      <div style={{ flex: '0 0 65%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '45px', background: 'linear-gradient(135deg, #0f172a 0%, #060911 100%)', borderRight: '2px solid #141d30', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0', width: 'auto', maxHeight: '800px', overflow: 'hidden', boxSizing: 'border-box' }}>
          <img src="/logo_elite.png" alt="Elite Ball Emblem" style={{ width: 'auto', maxWidth: '1200px', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 70px rgba(230, 92, 0, 0.4))' }} />
        </div>

        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', border: '1px solid #1e293b', padding: '30px', borderRadius: '16px', backdropFilter: 'blur(12px)', boxSizing: 'border-box' }}>
          <h2 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '2.2rem', fontWeight: '900', color: '#e65c00', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>PREPARE TO DOMINATE.</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: '1.4', margin: '0 0 25px 0' }}>Stop guessing. Start executing. Elite Ball breaks down your stats, workouts, and nutrition to build an unguardable athlete.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '25px' }}>
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', padding: '16px 10px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.4rem', marginBottom: '4px' }}>🏀</span>
              <strong style={{ fontSize: '0.8rem', color: '#f8fafc', display: 'block', fontWeight: '700', lineHeight: '1.2' }}>Individual & Team Workouts</strong>
            </div>
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', padding: '16px 10px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.4rem', marginBottom: '4px' }}>📊</span>
              <strong style={{ fontSize: '0.8rem', color: '#f8fafc', display: 'block', fontWeight: '700', lineHeight: '1.2' }}>Advanced Statistics Synthesis</strong>
            </div>
            <div style={{ backgroundColor: '#090d16', border: '1px solid #1e293b', padding: '16px 10px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.4rem', marginBottom: '4px' }}>🍎</span>
              <strong style={{ fontSize: '0.8rem', color: '#f8fafc', display: 'block', fontWeight: '700', lineHeight: '1.2' }}>Nutrition Management</strong>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #334155', paddingTop: '20px', fontFamily: '"Barlow Condensed", sans-serif', fontSize: '1.35rem', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px', textAlign: 'center', lineHeight: '1.2' }}>
            "IF YOU WANT TO LOOK GOOD IN FRONT OF THOUSANDS, THEN YOU HAVE TO OUTWORK THOUSANDS IN FRONT OF NOBODY."
          </div>
        </div>
      </div>

      {/* ACCESS MANAGEMENT PORTAL SYSTEM (35% SPACE WIDTH) */}
      <div style={{ flex: '0 0 35%', backgroundColor: '#080c14', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', height: '100%', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: '400px', boxSizing: 'border-box' }}>

          <h2 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: '3rem', fontWeight: '900', margin: '0 0 4px 0', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#ffffff' }}>
            {mode === 'login' && 'Sign In'} {mode === 'register' && 'Sign Up'} {mode === 'verify' && 'Verification'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 30px 0', fontWeight: '500', lineHeight: '1.3' }}>
            {mode === 'login' && 'Enter your credentials to access the locker room.'}
            {mode === 'register' && 'Join the elite squad. Complete your athlete profile.'}
            {mode === 'verify' && 'Enter the security OTP code sent via email to activate your profile.'}
          </p>

          {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '12px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.25)', fontWeight: '500' }}>{error}</div>}
          {successMessage && <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '12px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(34, 197, 94, 0.25)', fontWeight: '500' }}>{successMessage}</div>}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Alex Popescu" style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box', fontSize: '1rem', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Birth Date</label>
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box', fontSize: '1rem', outline: 'none' }} />
                </div>
              </>
            )}

            {mode === 'verify' && (
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Enter 6-Digit OTP</label>
                <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required placeholder="000000" maxLength="6" style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box', fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '6px', textAlign: 'center', outline: 'none' }} />
              </div>
            )}

            {mode !== 'verify' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@domain.com" style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box', fontSize: '1rem', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '14px 18px', borderRadius: '10px', border: '1px solid #1e293b', backgroundColor: '#0f172a', color: '#ffffff', boxSizing: 'border-box', fontSize: '1rem', outline: 'none' }} />
                </div>
              </>
            )}

            <button type="submit" style={{ width: '100%', padding: '16px', backgroundColor: '#e65c00', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: '"Barlow Condensed", sans-serif', letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 4px 20px rgba(230, 92, 0, 0.35)' }}>
              {mode === 'login' && 'Enter the Court'} {mode === 'register' && 'Sign Up'} {mode === 'verify' && 'Verify Profile'}
            </button>
          </form>

          <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '1.05rem', color: '#64748b', fontWeight: '500' }}>
            {mode === 'login' && <>Don't have an account? <span onClick={() => { setMode('register'); setError(''); setSuccessMessage(''); }} style={{ color: '#e65c00', fontWeight: 'bold', cursor: 'pointer' }}>Sign Up</span></>}
            {mode === 'register' && <>Already have an account? <span onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }} style={{ color: '#e65c00', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</span></>}
            {mode === 'verify' && <>Back to <span onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }} style={{ color: '#e65c00', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</span></>}
          </div>

        </div>
      </div>

    </div>
  );
}

export default App;