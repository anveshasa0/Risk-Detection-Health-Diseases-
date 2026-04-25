import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeRisk, saveReport } from '../api';
import { Loader2, AlertCircle } from 'lucide-react';

const initialForm = {
  age: 30,
  gender: 'Male',
  height: 170,
  weight: 70,
  systolicBP: 120,
  diastolicBP: 80,
  bloodSugar: 90,
  smoking: false,
  alcohol: false,
  exercise: 'medium',
  familyHistory: false,
};

function RiskForm({ username, setReportData }) {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Analyze Risk
      const { data } = await analyzeRisk(formData);
      if (data.success) {
        // Save to DB
        const reportPayload = {
          username,
          inputs: formData,
          calculated: data.data,
          recommendations: data.data.recommendations
        };
        const saveRes = await saveReport(reportPayload);
        if (saveRes.data.success) {
          setReportData(saveRes.data.data);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('An error occurred while processing your data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper for rendering sliders
  const renderSlider = (label, name, min, max, unit) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold text-primary">{formData[name]} {unit}</span>
      </div>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        value={formData[name]}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
      />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-primary/10 px-6 py-4 border-b border-primary/20">
        <h2 className="text-xl font-bold text-primary-dark">Enter Health Data</h2>
        <p className="text-sm text-gray-600 mt-1">Provide accurate information for the best risk estimation.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Basics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Basic Information</h3>
            {renderSlider('Age', 'age', 18, 100, 'years')}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {renderSlider('Height', 'height', 100, 250, 'cm')}
            {renderSlider('Weight', 'weight', 30, 200, 'kg')}
          </div>

          {/* Vitals */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Vitals & Tests</h3>
            {renderSlider('Systolic Blood Pressure', 'systolicBP', 90, 200, 'mmHg')}
            {renderSlider('Diastolic Blood Pressure', 'diastolicBP', 60, 130, 'mmHg')}
            {renderSlider('Fasting Blood Sugar', 'bloodSugar', 70, 300, 'mg/dL')}
          </div>
        </div>

        {/* Lifestyle */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Lifestyle Factors</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition">
              <input type="checkbox" name="smoking" checked={formData.smoking} onChange={handleChange} className="w-5 h-5 text-primary accent-primary rounded" />
              <span className="text-gray-700 font-medium">Do you smoke?</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition">
              <input type="checkbox" name="alcohol" checked={formData.alcohol} onChange={handleChange} className="w-5 h-5 text-primary accent-primary rounded" />
              <span className="text-gray-700 font-medium">Do you consume alcohol frequently?</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition">
              <input type="checkbox" name="familyHistory" checked={formData.familyHistory} onChange={handleChange} className="w-5 h-5 text-primary accent-primary rounded" />
              <span className="text-gray-700 font-medium">Family history of heart disease/diabetes?</span>
            </label>
            <div className="p-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Exercise Frequency</label>
              <select
                name="exercise"
                value={formData.exercise}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="low">Low (Rarely)</option>
                <option value="medium">Medium (1-2 times/week)</option>
                <option value="high">High (3+ times/week)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none flex items-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : 'Analyze My Risk'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RiskForm;
