import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeRisk, saveReport } from '../api';
import { Loader2, AlertCircle, NotebookPen, Sparkles, Accessibility } from 'lucide-react';

const initialForm = {
  age: 28,
  gender: 'Male',
  height: 165,
  weight: 64,
  systolicBP: 120,
  diastolicBP: 80,
  bloodSugar: 90,
  smoking: false,
  alcohol: false,
  exercise: 'medium',
  familyHistory: false,
  sleepHours: 7,
  stressLevel: 'medium',
  dietQuality: 'average',
  waterIntakeLiters: 2,
  screenTimeHours: 4,
  chronicCondition: false,
  onRegularMedication: false,
  guardianAssisted: false,
};

const agePresets = {
  child: {
    label: 'Child (5-12)',
    values: {
      age: 10,
      gender: 'Other',
      height: 135,
      weight: 32,
      systolicBP: 100,
      diastolicBP: 65,
      bloodSugar: 85,
      smoking: false,
      alcohol: false,
      exercise: 'high',
      familyHistory: false,
      sleepHours: 9,
      stressLevel: 'low',
      dietQuality: 'average',
      waterIntakeLiters: 1.4,
      screenTimeHours: 3,
      chronicCondition: false,
      onRegularMedication: false,
      guardianAssisted: true,
    },
  },
  teen: {
    label: 'Teen (13-19)',
    values: {
      age: 16,
      gender: 'Other',
      height: 162,
      weight: 54,
      systolicBP: 110,
      diastolicBP: 70,
      bloodSugar: 88,
      smoking: false,
      alcohol: false,
      exercise: 'medium',
      familyHistory: false,
      sleepHours: 8,
      stressLevel: 'medium',
      dietQuality: 'average',
      waterIntakeLiters: 1.8,
      screenTimeHours: 5,
      chronicCondition: false,
      onRegularMedication: false,
      guardianAssisted: false,
    },
  },
  adult: {
    label: 'Adult (20-59)',
    values: {
      age: 32,
      gender: 'Male',
      height: 170,
      weight: 72,
      systolicBP: 122,
      diastolicBP: 82,
      bloodSugar: 95,
      smoking: false,
      alcohol: false,
      exercise: 'medium',
      familyHistory: false,
      sleepHours: 7,
      stressLevel: 'medium',
      dietQuality: 'average',
      waterIntakeLiters: 2.2,
      screenTimeHours: 6,
      chronicCondition: false,
      onRegularMedication: false,
      guardianAssisted: false,
    },
  },
  senior: {
    label: 'Senior (60+)',
    values: {
      age: 68,
      gender: 'Female',
      height: 158,
      weight: 64,
      systolicBP: 132,
      diastolicBP: 82,
      bloodSugar: 102,
      smoking: false,
      alcohol: false,
      exercise: 'low',
      familyHistory: true,
      sleepHours: 6,
      stressLevel: 'medium',
      dietQuality: 'average',
      waterIntakeLiters: 1.6,
      screenTimeHours: 4,
      chronicCondition: true,
      onRegularMedication: true,
      guardianAssisted: false,
    },
  },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function RiskForm({ username, setReportData }) {
  const [formData, setFormData] = useState(initialForm);
  const [notes, setNotes] = useState('');
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

  const applyPreset = (presetKey) => {
    const preset = agePresets[presetKey];
    if (!preset) return;
    setFormData(preset.values);
    setError(null);
  };

  const updateNumberField = (name, nextValue, min, max) => {
    const safe = clamp(Number(nextValue) || min, min, max);
    setFormData((prev) => ({ ...prev, [name]: safe }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await analyzeRisk(formData);
      if (data.success) {
        const reportPayload = {
          username,
          inputs: data.data.inputs,
          notes,
        };

        const saveRes = await saveReport(reportPayload);
        if (saveRes.data.success) {
          setReportData(saveRes.data.data);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred while processing your data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const bmiPreview = (formData.weight / ((formData.height / 100) * (formData.height / 100))).toFixed(1);

  const getAgeGroupText = (age) => {
    if (age < 13) return 'Child profile';
    if (age < 20) return 'Teen profile';
    if (age < 60) return 'Adult profile';
    return 'Senior profile';
  };

  const renderSlider = (label, name, min, max, unit, step = 1) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-sm font-semibold text-cyan-300">{formData[name]} {unit}</span>
      </div>
      <div className="grid grid-cols-[1fr_88px] gap-3 items-center">
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={formData[name]}
        onChange={handleChange}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
      />
      <input
        type="number"
        value={formData[name]}
        min={min}
        max={max}
        step={step}
        onChange={(e) => updateNumberField(name, e.target.value, min, max)}
        className="w-full px-2 py-2 text-center bg-slate-900/80 border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none"
        aria-label={`${label} number input`}
      />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto glass-card rounded-3xl shadow-2xl shadow-black/30 overflow-hidden border border-white/10">
      <div className="bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 px-6 py-5 border-b border-white/10">
        <h2 className="text-2xl font-bold text-white">Health Risk Intake Form</h2>
        <p className="text-sm text-slate-200 mt-1">Accurate inputs produce better predictions and better recommendations.</p>
        <p className="text-xs text-cyan-200 mt-2">Designed for all age groups from child to older adults.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        {error && (
          <div className="bg-rose-500/20 border border-rose-400/30 text-rose-100 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-slate-900/70 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-300" /> Quick Start by Age Group
            </p>
            <span className="text-xs text-slate-400">Current: {getAgeGroupText(formData.age)}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(agePresets).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(key)}
                className="px-3 py-2 rounded-lg border border-white/15 bg-slate-800/70 hover:bg-cyan-500/20 hover:border-cyan-300/40 text-sm"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-300/20 rounded-xl p-4 flex items-start gap-3">
          <Accessibility size={18} className="text-cyan-300 mt-0.5" />
          <div className="text-sm text-cyan-100 space-y-1">
            <p className="font-semibold">Easy Fill Mode</p>
            <p>Use sliders or number boxes. Child profile ke liye guardian assistance checkbox use karein.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900/70 border border-white/10 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Preview BMI</p>
            <p className="text-3xl font-extrabold text-cyan-300 mt-1">
              {bmiPreview}
            </p>
          </div>
          <div className="bg-slate-900/70 border border-white/10 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Pressure Profile</p>
            <p className="text-3xl font-extrabold text-emerald-300 mt-1">{formData.systolicBP}/{formData.diastolicBP}</p>
          </div>
          <div className="bg-slate-900/70 border border-white/10 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Blood Sugar</p>
            <p className="text-3xl font-extrabold text-amber-300 mt-1">{formData.bloodSugar}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 mb-4">Basic Information</h3>
            {renderSlider('Age', 'age', 5, 100, 'years')}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-200 mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/70 border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {renderSlider('Height', 'height', 80, 220, 'cm')}
            {renderSlider('Weight', 'weight', 10, 220, 'kg')}
            {formData.age < 18 && (
              <label className="flex items-center gap-2 p-3 mt-2 rounded-lg border border-cyan-300/20 bg-cyan-500/10 text-cyan-100 text-sm">
                <input
                  type="checkbox"
                  name="guardianAssisted"
                  checked={formData.guardianAssisted}
                  onChange={handleChange}
                  className="w-4 h-4 accent-cyan-400"
                />
                Filled with parent/guardian assistance
              </label>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 mb-4">Vitals & Tests</h3>
            {renderSlider('Systolic Blood Pressure', 'systolicBP', 60, 220, 'mmHg')}
            {renderSlider('Diastolic Blood Pressure', 'diastolicBP', 35, 140, 'mmHg')}
            {renderSlider('Fasting Blood Sugar', 'bloodSugar', 40, 320, 'mg/dL')}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 mb-4">Lifestyle Factors</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/15 bg-slate-900/50 hover:bg-slate-800/70 cursor-pointer transition">
              <input type="checkbox" name="smoking" checked={formData.smoking} onChange={handleChange} className="w-5 h-5 text-primary accent-primary rounded" />
              <span className="text-slate-200 font-medium">Do you smoke?</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/15 bg-slate-900/50 hover:bg-slate-800/70 cursor-pointer transition">
              <input type="checkbox" name="alcohol" checked={formData.alcohol} onChange={handleChange} className="w-5 h-5 text-primary accent-primary rounded" />
              <span className="text-slate-200 font-medium">Do you consume alcohol frequently?</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/15 bg-slate-900/50 hover:bg-slate-800/70 cursor-pointer transition">
              <input type="checkbox" name="familyHistory" checked={formData.familyHistory} onChange={handleChange} className="w-5 h-5 text-primary accent-primary rounded" />
              <span className="text-slate-200 font-medium">Family history of heart disease/diabetes?</span>
            </label>
            <div className="p-3">
              <label className="block text-sm font-medium text-slate-200 mb-2">Exercise Frequency</label>
              <select
                name="exercise"
                value={formData.exercise}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/70 border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none"
              >
                <option value="low">Low (Rarely)</option>
                <option value="medium">Medium (1-2 times/week)</option>
                <option value="high">High (3+ times/week)</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 mb-4">Additional Easy Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border border-white/15 bg-slate-900/50">
              {renderSlider('Sleep Hours / Day', 'sleepHours', 0, 14, 'hrs', 0.5)}
            </div>
            <div className="p-3 rounded-lg border border-white/15 bg-slate-900/50">
              {renderSlider('Water Intake / Day', 'waterIntakeLiters', 0, 8, 'L', 0.1)}
            </div>
            <div className="p-3 rounded-lg border border-white/15 bg-slate-900/50">
              {renderSlider('Screen Time / Day', 'screenTimeHours', 0, 16, 'hrs', 0.5)}
            </div>

            <div className="p-3 rounded-lg border border-white/15 bg-slate-900/50">
              <label className="block text-sm font-medium text-slate-200 mb-2">Stress Level</label>
              <select
                name="stressLevel"
                value={formData.stressLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/70 border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <label className="block text-sm font-medium text-slate-200 mt-4 mb-2">Diet Quality</label>
              <select
                name="dietQuality"
                value={formData.dietQuality}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-900/70 border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none"
              >
                <option value="good">Good</option>
                <option value="average">Average</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/15 bg-slate-900/50 hover:bg-slate-800/70 cursor-pointer transition">
              <input type="checkbox" name="chronicCondition" checked={formData.chronicCondition} onChange={handleChange} className="w-5 h-5 accent-cyan-400 rounded" />
              <span className="text-slate-200 font-medium">Any chronic condition diagnosed?</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-white/15 bg-slate-900/50 hover:bg-slate-800/70 cursor-pointer transition">
              <input type="checkbox" name="onRegularMedication" checked={formData.onRegularMedication} onChange={handleChange} className="w-5 h-5 accent-cyan-400 rounded" />
              <span className="text-slate-200 font-medium">On regular medication plan?</span>
            </label>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
            <NotebookPen size={16} /> Optional notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 300))}
            rows={3}
            placeholder="Any symptoms, fatigue patterns, stress level, medications, child/senior context, etc."
            className="w-full resize-y px-3 py-2 bg-slate-900/80 border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none"
          />
          <p className="text-xs text-slate-400 mt-1">{notes.length}/300</p>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none flex items-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : 'Analyze My Risk'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RiskForm;
