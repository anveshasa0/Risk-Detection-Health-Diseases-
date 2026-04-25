const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  inputs: {
    age: Number,
    gender: String,
    height: Number, // in cm
    weight: Number, // in kg
    systolicBP: Number,
    diastolicBP: Number,
    bloodSugar: Number,
    smoking: Boolean,
    alcohol: Boolean,
    exercise: String, // 'low', 'medium', 'high'
    familyHistory: Boolean
  },
  calculated: {
    bmi: Number,
    risks: {
      diabetes: { level: String, percentage: Number, explanation: String },
      heartDisease: { level: String, percentage: Number, explanation: String },
      hypertension: { level: String, percentage: Number, explanation: String },
      obesity: { level: String, percentage: Number, explanation: String }
    }
  },
  recommendations: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);
