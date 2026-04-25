const Report = require('../models/Report');

const calculateRisks = (inputs) => {
  const {
    age, gender, height, weight,
    systolicBP, diastolicBP, bloodSugar,
    smoking, alcohol, exercise, familyHistory
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

  // Obesity Logic
  if (bmi >= 30) {
    risks.obesity = { level: 'High', percentage: 80, explanation: 'Your BMI indicates obesity.' };
    recommendations.push('Consider a balanced diet and regular exercise to reduce weight.');
  } else if (bmi >= 25) {
    risks.obesity = { level: 'Medium', percentage: 50, explanation: 'Your BMI indicates you are overweight.' };
    recommendations.push('Monitor your weight and try to maintain a healthy diet.');
  }

  // Hypertension Logic
  if (systolicBP >= 140 || diastolicBP >= 90) {
    risks.hypertension = { level: 'High', percentage: 85, explanation: 'Your blood pressure readings are high.' };
    recommendations.push('Consult a doctor regarding your blood pressure. Reduce sodium intake.');
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

  if (diabetesRiskScore >= 4) {
    risks.diabetes = { level: 'High', percentage: 75, explanation: 'Multiple factors indicate high risk for diabetes.' };
    recommendations.push('Get a fasting blood sugar test and consult a healthcare provider.');
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

  if (heartRiskScore >= 4) {
    risks.heartDisease = { level: 'High', percentage: 80, explanation: 'Smoking and/or high BP put you at significant risk.' };
    recommendations.push('Quit smoking and manage your blood pressure. A cardiovascular checkup is highly recommended.');
  } else if (heartRiskScore >= 2) {
    risks.heartDisease = { level: 'Medium', percentage: 45, explanation: 'You have some risk factors for heart disease.' };
    recommendations.push('Adopt a heart-healthy diet and avoid smoking.');
  }

  // Generic Recommendations
  if (exercise === 'low') recommendations.push('Aim for at least 150 minutes of moderate exercise per week.');
  if (recommendations.length === 0) recommendations.push('Keep up the good work! Maintain your healthy lifestyle.');

  // Deduplicate recommendations
  const uniqueRecommendations = [...new Set(recommendations)];

  return { bmi, risks, recommendations: uniqueRecommendations };
};

exports.analyzeRisk = (req, res) => {
  try {
    const inputs = req.body;
    const result = calculateRisks(inputs);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error analyzing risk.' });
  }
};

exports.saveReport = async (req, res) => {
  try {
    const { username, inputs, calculated, recommendations } = req.body;
    
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }

    const report = new Report({
      username,
      inputs,
      calculated,
      recommendations
    });

    await report.save();
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error saving report.' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { username } = req.params;
    const reports = await Report.find({ username }).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching history.' });
  }
};
