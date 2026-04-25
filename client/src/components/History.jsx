import React, { useEffect, useState } from 'react';
import { getHistory } from '../api';
import { History as HistoryIcon, Loader2, Calendar, Activity } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await getHistory(username);
        if (data.success) {
          setHistory(data.data);
        }
      } catch (error) {
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
      <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
        <HistoryIcon size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700">No History Found</h2>
        <p className="text-gray-500 mt-2">You haven't generated any health risk reports yet.</p>
      </div>
    );
  }

  // Prepare chart data (chronological order)
  const chartData = [...history].reverse().map(report => ({
    date: new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    bmi: report.calculated.bmi,
    heartRisk: report.calculated.risks.heartDisease.percentage,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <HistoryIcon className="text-primary" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">Your Health Report History</h1>
      </div>

      {history.length > 1 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="text-primary" size={20} /> Trends Over Time
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line yAxisId="left" type="monotone" name="BMI" dataKey="bmi" stroke="#0d9488" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" name="Heart Risk (%)" dataKey="heartRisk" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((report) => (
          <div key={report._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center text-sm text-gray-600">
              <span className="flex items-center gap-1.5 font-medium"><Calendar size={16} /> {new Date(report.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">BMI</p>
                  <p className="text-xl font-bold text-gray-800">{report.calculated.bmi}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Heart Risk</p>
                  <p className={`text-xl font-bold ${report.calculated.risks.heartDisease.level === 'High' ? 'text-red-500' : 'text-gray-800'}`}>
                    {report.calculated.risks.heartDisease.level}
                  </p>
                </div>
              </div>
              
              <div className="text-sm">
                <p className="text-gray-500 mb-1 font-medium">Key Inputs:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-md text-xs">BP: {report.inputs.systolicBP}/{report.inputs.diastolicBP}</span>
                  <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-md text-xs">Sugar: {report.inputs.bloodSugar}</span>
                  {report.inputs.smoking && <span className="px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs">Smoker</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;
