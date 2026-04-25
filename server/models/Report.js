const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  inputs: {
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    height: { type: Number, required: true }, // in cm
    weight: { type: Number, required: true }, // in kg
    systolicBP: { type: Number, required: true },
    diastolicBP: { type: Number, required: true },
    bloodSugar: { type: Number, required: true },
    smoking: { type: Boolean, required: true },
    alcohol: { type: Boolean, required: true },
    exercise: { type: String, enum: ['low', 'medium', 'high'], required: true },
    familyHistory: { type: Boolean, required: true },
    sleepHours: { type: Number, default: 7 },
    stressLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dietQuality: { type: String, enum: ['poor', 'average', 'good'], default: 'average' },
    waterIntakeLiters: { type: Number, default: 2 },
    screenTimeHours: { type: Number, default: 4 },
    chronicCondition: { type: Boolean, default: false },
    onRegularMedication: { type: Boolean, default: false },
    guardianAssisted: { type: Boolean, default: false }
  },
  calculated: {
    bmi: { type: Number, required: true },
    bmiCategory: { type: String, required: true },
    overallRiskScore: { type: Number, min: 0, max: 100, required: true },
    riskBand: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    risks: {
      diabetes: { level: String, percentage: Number, explanation: String },
      heartDisease: { level: String, percentage: Number, explanation: String },
      hypertension: { level: String, percentage: Number, explanation: String },
      obesity: { level: String, percentage: Number, explanation: String }
    },
    flags: [String],
    generatedAt: Date
  },
  recommendations: [{ type: String, required: true }],
  notes: {
    type: String,
    maxlength: 300,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
