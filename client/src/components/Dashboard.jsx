import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, Heart, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
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

  const { calculated, recommendations } = reportData;
  const { bmi, risks } = calculated;

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-100 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'High': return <XCircle className="text-red-600" size={24} />;
      case 'Medium': return <AlertTriangle className="text-yellow-600" size={24} />;
      case 'Low': return <CheckCircle2 className="text-green-600" size={24} />;
      default: return null;
    }
  };

  const chartData = [
    { name: 'Risk', value: risks.heartDisease.percentage, fill: risks.heartDisease.level === 'High' ? '#ef4444' : risks.heartDisease.level === 'Medium' ? '#f59e0b' : '#10b981' },
    { name: 'Safe', value: 100 - risks.heartDisease.percentage, fill: '#e5e7eb' }
  ];

  const RiskCard = ({ title, data }) => (
    <div className={`p-5 rounded-xl border ${getRiskColor(data.level)} transition-transform hover:scale-105`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-lg text-gray-800">{title}</h4>
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
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-primary" /> Health Analysis Results
          </h1>
          <p className="text-gray-500 mt-1">Based on the data you provided.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-primary font-medium hover:bg-teal-50 px-4 py-2 rounded-lg transition"
        >
          <ArrowLeft size={18} /> New Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RiskCard title="Diabetes" data={risks.diabetes} />
          <RiskCard title="Heart Disease" data={risks.heartDisease} />
          <RiskCard title="Hypertension" data={risks.hypertension} />
          <RiskCard title="Obesity" data={risks.obesity} />
        </div>

        {/* Sidebar Data */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-gray-500 font-medium mb-2 text-center">Your BMI</h3>
            <div className={`text-5xl font-black mb-2 ${bmi >= 30 ? 'text-red-500' : bmi >= 25 ? 'text-yellow-500' : 'text-green-500'}`}>
              {bmi}
            </div>
            <p className="text-sm text-gray-400 text-center">
              {bmi >= 30 ? 'Obese range' : bmi >= 25 ? 'Overweight range' : 'Healthy range'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-gray-800 font-bold mb-4 text-center">Overall Heart Risk</h3>
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
                   <Heart size={28} className={risks.heartDisease.level === 'High' ? 'text-red-500 animate-pulse' : 'text-gray-400'} fill={risks.heartDisease.level === 'High' ? '#ef4444' : 'none'} />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-8 rounded-2xl shadow-lg">
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
