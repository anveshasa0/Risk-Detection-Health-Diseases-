import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Activity, History as HistoryIcon, Home, User } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Navigation */}
      <nav className="bg-primary text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Activity size={24} />
            <span>HealthRisk Detect</span>
          </Link>
          
          {username && (
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-1 hover:text-teal-200 transition">
                <Home size={18} /> New Analysis
              </Link>
              <Link to="/history" className="flex items-center gap-1 hover:text-teal-200 transition">
                <HistoryIcon size={18} /> History
              </Link>
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-teal-600">
                <div className="flex items-center gap-1 bg-teal-800 px-3 py-1 rounded-full text-sm">
                  <User size={14} /> {username}
                </div>
                <button onClick={handleLogout} className="text-sm hover:underline text-teal-200">
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {!username ? (
          <div className="flex items-center justify-center h-full mt-20">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
              <div className="text-center mb-6">
                <Activity size={48} className="mx-auto text-primary mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Welcome to HealthRisk Detect</h2>
                <p className="text-gray-500 mt-2 text-sm">Enter a username to start tracking your health risks over time.</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                    placeholder="e.g. JohnDoe"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition shadow-md"
                >
                  Continue
                </button>
              </form>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<RiskForm username={username} setReportData={setReportData} />} />
            <Route path="/dashboard" element={<Dashboard reportData={reportData} />} />
            <Route path="/history" element={<History username={username} />} />
          </Routes>
        )}
      </main>

      {/* Footer & Disclaimer */}
      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm">
        <p className="mb-2 font-medium text-gray-300">Disclaimer</p>
        <p className="max-w-2xl mx-auto px-4">
          This system provides health risk estimates based on general algorithms and is 
          <span className="text-white font-semibold"> NOT a medical diagnosis tool</span>. 
          Please consult a healthcare professional for accurate medical advice.
        </p>
      </footer>
    </div>
  );
}

export default App;
