import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, ShieldAlert, HeartPulse } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

function Dashboard({ reportData }) {
  const navigate = useNavigate();

  if (!reportData) {
    return <Navigate to="/" />;
  }

  const { calculated = {}, recommendations = [] } = reportData;
  const {
    bmi = 0,
    bmiCategory = 'Unknown',
    overallRiskScore = 0,
    riskBand = 'Low',
    risks = {},
    flags = []
  } = calculated;

  const diseaseKeys = [
    { key: 'diabetes', label: 'Diabetes' },
    { key: 'heartDisease', label: 'Heart Disease' },
    { key: 'hypertension', label: 'Hypertension' },
    { key: 'obesity', label: 'Obesity' }
  ];

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-200 bg-red-500/20 border-red-400/30';
      case 'Medium': return 'text-amber-200 bg-amber-500/20 border-amber-400/30';
      case 'Low': return 'text-emerald-200 bg-emerald-500/20 border-emerald-400/30';
      default: return 'text-slate-200 bg-slate-500/20 border-slate-400/30';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'High': return <XCircle className="text-red-300" size={24} />;
      case 'Medium': return <AlertTriangle className="text-amber-300" size={24} />;
      case 'Low': return <CheckCircle2 className="text-emerald-300" size={24} />;
      default: return null;
    }
  };

  const getBandTone = (band) => {
    if (band === 'High') return 'text-red-300';
    if (band === 'Medium') return 'text-amber-300';
    return 'text-emerald-300';
  };

  const chartData = [
    { name: 'Risk', value: overallRiskScore, fill: riskBand === 'High' ? '#ef4444' : riskBand === 'Medium' ? '#f59e0b' : '#10b981' },
    { name: 'Safe', value: 100 - overallRiskScore, fill: '#334155' }
  ];

  const RiskCard = ({ title, data }) => (
    <div className={`p-5 rounded-xl border ${getRiskColor(data.level)} transition-transform hover:scale-[1.01]`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-lg text-white">{title}</h4>
        {getRiskIcon(data.level)}
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-extrabold">{data.percentage}%</span>
        <span className="text-sm font-medium uppercase tracking-wider">{data.level} Risk</span>
      </div>
      <p className="text-sm opacity-90">{data.explanation}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-cyan-300" /> Health Analysis Results
          </h1>
          <p className="text-slate-300 mt-1">Advanced estimate based on your current profile.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-cyan-200 font-medium hover:bg-cyan-500/10 px-4 py-2 rounded-lg transition"
        >
          <ArrowLeft size={18} /> New Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {diseaseKeys.map(({ key, label }) => (
            <RiskCard
              key={key}
              title={label}
              data={risks[key] || { level: 'Low', percentage: 0, explanation: 'No data available' }}
            />
          ))}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
            <h3 className="text-slate-300 font-medium mb-2 text-center">Your BMI</h3>
            <div className={`text-5xl font-black mb-2 ${bmi >= 30 ? 'text-red-300' : bmi >= 25 ? 'text-amber-300' : 'text-emerald-300'}`}>
              {bmi}
            </div>
            <p className="text-sm text-slate-400 text-center">{bmiCategory}</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10">
             <h3 className="text-white font-bold mb-2 text-center">Overall Risk Score</h3>
             <p className={`text-center font-semibold mb-3 ${getBandTone(riskBand)}`}>{riskBand} Risk Band</p>
             <div className="h-40 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="text-center">
                     <HeartPulse size={28} className="mx-auto text-cyan-300" />
                     <p className="font-extrabold text-xl text-white mt-1">{overallRiskScore}%</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {flags.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-300/20 text-rose-100 p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <ShieldAlert size={20} /> Warning Flags
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {flags.map((flag, index) => (
              <li key={index} className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm">{flag}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-gradient-to-br from-cyan-600/80 to-emerald-600/80 text-white p-8 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          Actionable Recommendations
        </h3>
        <ul className="space-y-3">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3 bg-white/10 p-3 rounded-lg">
              <CheckCircle2 className="shrink-0 mt-0.5 text-teal-200" size={20} />
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
