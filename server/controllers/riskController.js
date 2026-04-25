const Report = require('../models/Report');

const LIMITS = {
  age: { min: 5, max: 110 },
  height: { min: 80, max: 250 },
  weight: { min: 10, max: 300 },
  systolicBP: { min: 60, max: 250 },
  diastolicBP: { min: 35, max: 150 },
  bloodSugar: { min: 40, max: 400 },
  sleepHours: { min: 0, max: 14 },
  waterIntakeLiters: { min: 0, max: 8 },
  screenTimeHours: { min: 0, max: 16 }
};

const SAFE_LEVELS = new Set(['Low', 'Medium', 'High']);

const sanitizeUsername = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
};

const inRange = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;

const validationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return Boolean(value);
};

const normalizeInputs = (payload = {}) => {
  const numeric = {
    age: Number(payload.age),
    height: Number(payload.height),
    weight: Number(payload.weight),
    systolicBP: Number(payload.systolicBP),
    diastolicBP: Number(payload.diastolicBP),
    bloodSugar: Number(payload.bloodSugar),
    sleepHours: payload.sleepHours !== undefined ? Number(payload.sleepHours) : 7,
    waterIntakeLiters: payload.waterIntakeLiters !== undefined ? Number(payload.waterIntakeLiters) : 2,
    screenTimeHours: payload.screenTimeHours !== undefined ? Number(payload.screenTimeHours) : 4
  };

  Object.entries(LIMITS).forEach(([field, range]) => {
    if (!inRange(numeric[field], range.min, range.max)) {
      throw validationError(`${field} must be between ${range.min} and ${range.max}.`);
    }
  });

  const gender = String(payload.gender || '').trim().toLowerCase();
  if (!['male', 'female', 'other'].includes(gender)) {
    throw validationError('gender must be Male, Female, or Other.');
  }

  const exercise = String(payload.exercise || '').trim().toLowerCase();
  if (!['low', 'medium', 'high'].includes(exercise)) {
    throw validationError('exercise must be low, medium, or high.');
  }

  const stressLevel = String(payload.stressLevel || 'medium').trim().toLowerCase();
  if (!['low', 'medium', 'high'].includes(stressLevel)) {
    throw validationError('stressLevel must be low, medium, or high.');
  }

  const dietQuality = String(payload.dietQuality || 'average').trim().toLowerCase();
  if (!['poor', 'average', 'good'].includes(dietQuality)) {
    throw validationError('dietQuality must be poor, average, or good.');
  }

  return {
    ...numeric,
    gender: gender[0].toUpperCase() + gender.slice(1),
    smoking: normalizeBoolean(payload.smoking),
    alcohol: normalizeBoolean(payload.alcohol),
    exercise,
    familyHistory: normalizeBoolean(payload.familyHistory),
    chronicCondition: normalizeBoolean(payload.chronicCondition),
    onRegularMedication: normalizeBoolean(payload.onRegularMedication),
    guardianAssisted: normalizeBoolean(payload.guardianAssisted),
    stressLevel,
    dietQuality
  };
};

const getBmiCategory = (bmi) => {
  if (bmi >= 30) return 'Obese';
  if (bmi >= 25) return 'Overweight';
  if (bmi < 18.5) return 'Underweight';
  return 'Healthy';
};

const calculateRisks = (inputs) => {
  const {
    age, gender, height, weight,
    systolicBP, diastolicBP, bloodSugar,
    smoking, alcohol, exercise, familyHistory,
    sleepHours, stressLevel, dietQuality,
    waterIntakeLiters, screenTimeHours,
    chronicCondition, onRegularMedication
  } = inputs;

  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

  const risks = {
    diabetes: { level: 'Low', percentage: 10, explanation: 'Your blood sugar and BMI are within normal ranges.' },
    heartDisease: { level: 'Low', percentage: 10, explanation: 'Your blood pressure and lifestyle factors look good.' },
    hypertension: { level: 'Low', percentage: 10, explanation: 'Your blood pressure is normal.' },
    obesity: { level: 'Low', percentage: 10, explanation: 'Your BMI is in a healthy range.' }
  };

  const recommendations = [];
  const flags = [];

  // Obesity Logic
  if (bmi >= 30) {
    risks.obesity = { level: 'High', percentage: 80, explanation: 'Your BMI indicates obesity.' };
    recommendations.push('Consider a balanced diet and regular exercise to reduce weight.');
    flags.push('BMI is in obese range');
  } else if (bmi >= 25) {
    risks.obesity = { level: 'Medium', percentage: 50, explanation: 'Your BMI indicates you are overweight.' };
    recommendations.push('Monitor your weight and try to maintain a healthy diet.');
    flags.push('BMI is in overweight range');
  } else if (bmi < 18.5) {
    risks.obesity = { level: 'Medium', percentage: 35, explanation: 'Your BMI indicates underweight range.' };
    recommendations.push('Consult a nutrition expert to improve nutritional balance.');
    flags.push('BMI is below healthy range');
  }

  // Hypertension Logic
  if (systolicBP >= 140 || diastolicBP >= 90) {
    risks.hypertension = { level: 'High', percentage: 85, explanation: 'Your blood pressure readings are high.' };
    recommendations.push('Consult a doctor regarding your blood pressure. Reduce sodium intake.');
    flags.push('Blood pressure is in hypertensive range');
  } else if (systolicBP >= 130 || diastolicBP >= 80) {
    risks.hypertension = { level: 'Medium', percentage: 45, explanation: 'Your blood pressure is elevated.' };
    recommendations.push('Monitor your blood pressure regularly and limit salt.');
  }

  // Diabetes Logic
  let diabetesRiskScore = 0;
  if (bloodSugar > 125) diabetesRiskScore += 3;
  else if (bloodSugar >= 100) diabetesRiskScore += 2;
  if (bmi >= 25) diabetesRiskScore += 1;
  if (familyHistory) diabetesRiskScore += 2;
  if (exercise === 'low') diabetesRiskScore += 1;
  if (sleepHours < 6) diabetesRiskScore += 1;
  if (dietQuality === 'poor') diabetesRiskScore += 1;
  if (chronicCondition) diabetesRiskScore += 1;

  if (diabetesRiskScore >= 4) {
    risks.diabetes = { level: 'High', percentage: 75, explanation: 'Multiple factors indicate high risk for diabetes.' };
    recommendations.push('Get a fasting blood sugar test and consult a healthcare provider.');
    flags.push('Diabetes risk markers are elevated');
  } else if (diabetesRiskScore >= 2) {
    risks.diabetes = { level: 'Medium', percentage: 40, explanation: 'Some factors indicate a moderate risk for diabetes.' };
    recommendations.push('Reduce sugar intake and increase physical activity.');
  }

  // Heart Disease Logic
  let heartRiskScore = 0;
  if (smoking) heartRiskScore += 3;
  if (systolicBP >= 140) heartRiskScore += 2;
  if (age > 50) heartRiskScore += 1;
  if (bmi >= 30) heartRiskScore += 1;
  if (alcohol) heartRiskScore += 1;
  if (stressLevel === 'high') heartRiskScore += 1;
  if (sleepHours < 6) heartRiskScore += 1;
  if (chronicCondition) heartRiskScore += 1;

  if (heartRiskScore >= 4) {
    risks.heartDisease = { level: 'High', percentage: 80, explanation: 'Smoking and/or high BP put you at significant risk.' };
    recommendations.push('Quit smoking and manage your blood pressure. A cardiovascular checkup is highly recommended.');
    flags.push('Cardiac risk factors are significantly elevated');
  } else if (heartRiskScore >= 2) {
    risks.heartDisease = { level: 'Medium', percentage: 45, explanation: 'You have some risk factors for heart disease.' };
    recommendations.push('Adopt a heart-healthy diet and avoid smoking.');
  }

  if ((stressLevel === 'high' || sleepHours < 6) && risks.hypertension.level !== 'High') {
    risks.hypertension = {
      level: 'Medium',
      percentage: Math.max(risks.hypertension.percentage, 48),
      explanation: 'Stress and sleep pattern may increase blood pressure risk over time.'
    };
    recommendations.push('Practice stress management and maintain a consistent sleep routine.');
  }

  if (dietQuality === 'poor' && risks.obesity.level !== 'High') {
    risks.obesity = {
      level: risks.obesity.level === 'Low' ? 'Medium' : risks.obesity.level,
      percentage: Math.max(risks.obesity.percentage, 45),
      explanation: 'Diet quality indicates potential long-term weight and metabolic risk.'
    };
    recommendations.push('Increase fiber, protein, fruits, and vegetables in daily meals.');
  }

  if (waterIntakeLiters < 1.2) {
    recommendations.push('Increase hydration throughout the day unless medically restricted.');
  }

  if (screenTimeHours > 8) {
    recommendations.push('Reduce prolonged screen time and take short activity breaks every hour.');
  }

  if (age > 55 && !onRegularMedication && chronicCondition) {
    flags.push('Medication adherence review is recommended for chronic conditions');
    recommendations.push('Discuss medication routine with your physician for better disease control.');
  }

  // Generic Recommendations
  if (exercise === 'low') recommendations.push('Aim for at least 150 minutes of moderate exercise per week.');
  if (recommendations.length === 0) recommendations.push('Keep up the good work! Maintain your healthy lifestyle.');

  // Deduplicate recommendations
  const uniqueRecommendations = [...new Set(recommendations)];
  const uniqueFlags = [...new Set(flags)];

  const weightedScore =
    (risks.diabetes.percentage * 0.28) +
    (risks.heartDisease.percentage * 0.32) +
    (risks.hypertension.percentage * 0.2) +
    (risks.obesity.percentage * 0.2);

  const overallRiskScore = Math.round(weightedScore);
  const riskBand = overallRiskScore >= 70 ? 'High' : overallRiskScore >= 40 ? 'Medium' : 'Low';

  return {
    bmi,
    bmiCategory: getBmiCategory(bmi),
    overallRiskScore,
    riskBand,
    risks,
    flags: uniqueFlags,
    recommendations: uniqueRecommendations,
    generatedAt: new Date()
  };
};

exports.analyzeRisk = (req, res) => {
  try {
    const inputs = normalizeInputs(req.body);
    const result = calculateRisks(inputs);
    res.json({ success: true, data: { inputs, ...result } });
  } catch (error) {
    console.error(error);
    const status = error.statusCode || 500;
    const message = status === 400 ? error.message : 'Server error analyzing risk.';
    res.status(status).json({ success: false, message });
  }
};

exports.saveReport = async (req, res) => {
  try {
    const username = sanitizeUsername(req.body.username);
    const notes = typeof req.body.notes === 'string' ? req.body.notes.trim() : '';
    const inputs = normalizeInputs(req.body.inputs || req.body);
    
    if (!username || username.length < 2 || username.length > 40) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }

    const result = calculateRisks(inputs);
    const safeRiskBand = SAFE_LEVELS.has(result.riskBand) ? result.riskBand : 'Low';

    const report = new Report({
      username,
      inputs,
      calculated: {
        bmi: result.bmi,
        bmiCategory: result.bmiCategory,
        overallRiskScore: result.overallRiskScore,
        riskBand: safeRiskBand,
        risks: result.risks,
        flags: result.flags,
        generatedAt: result.generatedAt
      },
      recommendations: result.recommendations,
      notes
    });

    await report.save();
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error(error);
    const status = error.statusCode || 500;
    const message = status === 400 ? error.message : 'Server error saving report.';
    res.status(status).json({ success: false, message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { username } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const reports = await Report.find({ username: sanitizeUsername(username) }).sort({ createdAt: -1 }).limit(limit);
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching history.' });
  }
};

exports.getInsights = async (req, res) => {
  try {
    const username = sanitizeUsername(req.params.username);
    const reports = await Report.find({ username }).sort({ createdAt: -1 }).limit(20);

    if (reports.length === 0) {
      return res.status(404).json({ success: false, message: 'No reports found for this user.' });
    }

    const latest = reports[0];
    const previous = reports[1] || null;

    const avgBmi = Number((reports.reduce((sum, item) => sum + (item.calculated?.bmi || 0), 0) / reports.length).toFixed(1));
    const avgOverallRisk = Math.round(
      reports.reduce((sum, item) => sum + (item.calculated?.overallRiskScore || 0), 0) / reports.length
    );

    const heartRiskDelta = previous
      ? latest.calculated.risks.heartDisease.percentage - previous.calculated.risks.heartDisease.percentage
      : 0;
    const overallRiskDelta = previous
      ? latest.calculated.overallRiskScore - previous.calculated.overallRiskScore
      : 0;

    const trend = overallRiskDelta > 0 ? 'Worsening' : overallRiskDelta < 0 ? 'Improving' : 'Stable';

    res.json({
      success: true,
      data: {
        totalReports: reports.length,
        latest: {
          createdAt: latest.createdAt,
          bmi: latest.calculated.bmi,
          bmiCategory: latest.calculated.bmiCategory,
          overallRiskScore: latest.calculated.overallRiskScore,
          riskBand: latest.calculated.riskBand,
          heartRiskPercentage: latest.calculated.risks.heartDisease.percentage,
          flags: latest.calculated.flags || []
        },
        averages: {
          bmi: avgBmi,
          overallRiskScore: avgOverallRisk
        },
        deltas: {
          heartRiskPercentage: heartRiskDelta,
          overallRiskScore: overallRiskDelta
        },
        trend
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching insights.' });
  }
};
