import React, { useEffect, useState } from 'react';
import { getHistory, getInsights } from '../api';
import { History as HistoryIcon, Loader2, Calendar, Activity, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

function History({ username }) {
  const [history, setHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [historyRes, insightsRes] = await Promise.allSettled([
          getHistory(username),
          getInsights(username)
        ]);

        if (historyRes.status === 'fulfilled' && historyRes.value.data.success) {
          setHistory(historyRes.value.data.data);
        }

        if (insightsRes.status === 'fulfilled' && insightsRes.value.data.success) {
          setInsights(insightsRes.value.data.data);
        }
      } catch (error) {
        setError('Unable to load history right now.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchHistory();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="glass-card p-12 text-center rounded-2xl border border-white/10 max-w-2xl mx-auto">
        <HistoryIcon size={48} className="mx-auto text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-white">No History Found</h2>
        <p className="text-slate-300 mt-2">You haven't generated any health risk reports yet.</p>
      </div>
    );
  }

  // Prepare chart data (chronological order)
  const chartData = [...history].reverse().map((report) => ({
    date: new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    bmi: report.calculated?.bmi || 0,
    heartRisk: report.calculated?.risks?.heartDisease?.percentage || 0,
    overallRisk: report.calculated?.overallRiskScore || 0
  }));

  const deltaValue = insights?.deltas?.overallRiskScore || 0;
  const DeltaIcon = deltaValue > 0 ? TrendingUp : deltaValue < 0 ? TrendingDown : Minus;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <HistoryIcon className="text-cyan-300" size={28} />
        <h1 className="text-2xl font-bold text-white">Your Health Report History</h1>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-300/20 text-rose-100 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-xl border border-white/10">
            <p className="text-xs uppercase tracking-wider text-slate-400">Latest Risk</p>
            <p className="text-3xl font-black text-cyan-300 mt-1">{insights.latest.overallRiskScore}%</p>
            <p className="text-sm text-slate-300">{insights.latest.riskBand} band</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-white/10">
            <p className="text-xs uppercase tracking-wider text-slate-400">Avg BMI</p>
            <p className="text-3xl font-black text-emerald-300 mt-1">{insights.averages.bmi}</p>
            <p className="text-sm text-slate-300">across last reports</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-white/10">
            <p className="text-xs uppercase tracking-wider text-slate-400">Trend</p>
            <p className="text-2xl font-black text-amber-300 mt-2">{insights.trend}</p>
            <p className="text-sm text-slate-300">risk movement</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-white/10">
            <p className="text-xs uppercase tracking-wider text-slate-400">Change</p>
            <p className="text-2xl font-black text-white mt-2 flex items-center gap-1">
              <DeltaIcon size={18} /> {Math.abs(deltaValue)}
            </p>
            <p className="text-sm text-slate-300">overall score points</p>
          </div>
        </div>
      )}

      {history.length > 1 && (
        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="text-cyan-300" size={20} /> Trends Over Time
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #334155', background: '#0f172a' }}
                />
                <Line yAxisId="left" type="monotone" name="BMI" dataKey="bmi" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" name="Heart Risk (%)" dataKey="heartRisk" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" name="Overall Risk (%)" dataKey="overallRisk" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((report) => (
          <div key={report._id} className="glass-card rounded-xl border border-white/10 overflow-hidden hover:border-cyan-300/30 transition">
            <div className="bg-slate-900/60 px-4 py-3 border-b border-white/10 flex justify-between items-center text-sm text-slate-300">
              <span className="flex items-center gap-1.5 font-medium"><Calendar size={16} /> {new Date(report.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900/60 p-3 rounded-lg text-center border border-white/10">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">BMI</p>
                  <p className="text-xl font-bold text-white">{report.calculated?.bmi || '-'}</p>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg text-center border border-white/10">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Overall Risk</p>
                  <p className={`text-xl font-bold ${(report.calculated?.riskBand || 'Low') === 'High' ? 'text-red-300' : (report.calculated?.riskBand || 'Low') === 'Medium' ? 'text-amber-300' : 'text-emerald-300'}`}>
                    {report.calculated?.overallRiskScore || 0}%
                  </p>
                </div>
              </div>
              
              <div className="text-sm">
                <p className="text-slate-300 mb-1 font-medium">Key Inputs:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-cyan-500/20 text-cyan-100 rounded-md text-xs border border-cyan-300/20">BP: {report.inputs?.systolicBP}/{report.inputs?.diastolicBP}</span>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-100 rounded-md text-xs border border-emerald-300/20">Sugar: {report.inputs?.bloodSugar}</span>
                  {report.inputs?.smoking && <span className="px-2 py-1 bg-rose-500/20 text-rose-100 rounded-md text-xs border border-rose-300/20">Smoker</span>}
                </div>
              </div>

              {report.notes && (
                <p className="mt-3 text-xs text-slate-300 border-t border-white/10 pt-3">Note: {report.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;
