import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Activity, History as HistoryIcon, Home, LogOut, ShieldPlus, Sparkles, User } from 'lucide-react';
import RiskForm from './components/RiskForm';
import Dashboard from './components/Dashboard';
import History from './components/History';

function App() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [reportData, setReportData] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const name = e.target.username.value.trim();
    if (name) {
      setUsername(name);
      localStorage.setItem('username', name);
    }
  };

  const handleLogout = () => {
    setUsername('');
    localStorage.removeItem('username');
    setReportData(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative overflow-x-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-float-delayed" />

      <nav className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center gap-3">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 text-slate-900 shadow-lg shadow-cyan-500/20">
              <ShieldPlus size={22} />
            </span>
            <span>RiskGuard Health</span>
          </Link>

          {username && (
            <div className="flex items-center gap-2 sm:gap-4 text-sm">
              <Link to="/" className="inline-flex items-center gap-1 rounded-lg px-3 py-2 hover:bg-white/10 transition">
                <Home size={18} /> New Analysis
              </Link>
              <Link to="/history" className="inline-flex items-center gap-1 rounded-lg px-3 py-2 hover:bg-white/10 transition">
                <HistoryIcon size={18} /> History
              </Link>
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                  <User size={14} /> {username}
              </div>
              <button onClick={handleLogout} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-rose-200 hover:bg-rose-500/15 transition">
                <LogOut size={16} />
                  Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        {!username ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mt-8">
            <section className="space-y-5">
              <p className="inline-flex items-center gap-2 text-cyan-200 bg-cyan-400/10 border border-cyan-300/20 rounded-full px-4 py-1.5 text-sm">
                <Sparkles size={16} /> Predictive Wellness Companion
              </p>
              <h1 className="text-4xl sm:text-5xl font-black leading-tight text-balance">
                Detect early risk patterns before they turn serious.
              </h1>
              <p className="text-slate-300 max-w-xl">
                RiskGuard combines vitals and lifestyle indicators to estimate disease risk, track progression, and provide practical next actions.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="glass-card p-4">
                  <p className="text-2xl font-bold text-cyan-300">4</p>
                  <p className="text-sm text-slate-300">Core disease models</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-2xl font-bold text-emerald-300">20</p>
                  <p className="text-sm text-slate-300">Recent reports tracked</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-2xl font-bold text-amber-300">24/7</p>
                  <p className="text-sm text-slate-300">Instant analysis</p>
                </div>
              </div>
            </section>

            <section className="glass-card p-8 rounded-3xl shadow-2xl shadow-black/30 max-w-lg w-full mx-auto">
              <div className="text-center mb-6">
                <Activity size={44} className="mx-auto text-cyan-300 mb-3" />
                <h2 className="text-2xl font-bold">Start Your Health Risk Journey</h2>
                <p className="text-slate-300 mt-2 text-sm">Enter a username to save reports and monitor risk trends over time.</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full px-4 py-2.5 border border-white/20 bg-slate-900/70 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none transition"
                    placeholder="e.g. JohnDoe"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-400 to-emerald-500 text-slate-950 font-bold py-2.5 rounded-lg transition shadow-lg hover:shadow-cyan-500/30"
                >
                  Continue
                </button>
              </form>
            </section>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<RiskForm username={username} setReportData={setReportData} />} />
            <Route path="/dashboard" element={<Dashboard reportData={reportData} />} />
            <Route path="/history" element={<History username={username} />} />
          </Routes>
        )}
      </main>

      <footer className="border-t border-white/10 bg-slate-950/90 text-slate-400 py-6 text-center text-sm">
        <p className="mb-2 font-medium text-slate-300">Medical Disclaimer</p>
        <p className="max-w-2xl mx-auto px-4 leading-relaxed">
          This system provides health risk estimates based on general algorithms and is 
          <span className="text-white font-semibold"> NOT a medical diagnosis tool</span>.
          Please consult a healthcare professional for accurate medical advice.
        </p>
      </footer>
    </div>
  );
}

export default App;
