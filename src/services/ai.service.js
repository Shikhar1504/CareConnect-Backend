import axios from 'axios';
import ClinicalNote from '../models/ClinicalNote.js';
import RiskAssessment from '../models/RiskAssessment.js';
import Patient from '../models/Patient.js';

// Axios instance with timeout
const axiosInstance = axios.create({
  timeout: 5000,
});


// =======================
// 1️⃣ Predict Risk (ML Layer)
// =======================
const predictRisk = async (patient, noteText) => {
  try {
    if (!patient) throw new Error('Invalid patient data');

    // 🔹 Real Databricks Call (future)
    /*
    const response = await axiosInstance.post(
      process.env.DATABRICKS_HOST + '/model/predict',
      {
        data: {
          age: patient.age,
          vitals: patient.vitals,
          text: noteText,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DATABRICKS_TOKEN}`,
        },
      }
    );
    return response.data;
    */

    // 🔥 Realistic mock logic
    const heartRate = patient.vitals?.heartRate || 70;
    const oxygen = patient.vitals?.oxygenLevel || 98;

    let score =
      30 +
      patient.age * 0.5 +
      heartRate * 0.2 -
      oxygen * 0.3;

    score = Math.max(0, Math.min(100, score));

    const shapFactors = [
      { feature: 'age', impact: patient.age * 0.3 },
      { feature: 'heartRate', impact: heartRate * 0.2 },
      { feature: 'oxygenLevel', impact: -oxygen * 0.2 },
    ];

    // 🔥 Save to DB
    await RiskAssessment.create({
      patientId: patient._id,
      baseScore: score,
      shapFactors,
      inputFeatures: {
        age: patient.age,
        vitals: patient.vitals,
      },
    });

    // 🔥 Update patient status based on risk
    await Patient.findByIdAndUpdate(patient._id, {
      status: score > 80 ? 'critical' : 'admitted',
    });

    return {
      score,
      shapFactors,
    };
  } catch (error) {
    console.error('Risk Prediction Error:', {
      message: error.message,
      patientId: patient?._id,
    });
    throw new Error('Failed to compute risk score');
  }
};


// =======================
// 2️⃣ Simulate Risk (What-if)
// =======================
const simulateRisk = async (patientId, modifiedParams) => {
  try {
    const patient = await Patient.findById(patientId);
    if (!patient) throw new Error('Patient not found');

    const previousRisk = await RiskAssessment.findOne({ patientId })
      .sort({ createdAt: -1 });

    let newScore = previousRisk ? previousRisk.baseScore : 50;

    // 🔥 Simulation logic
    if (modifiedParams.homeNurse) newScore -= 15;
    if (modifiedParams.medicationAdherence === false) newScore += 20;
    if (modifiedParams.dietImprovement) newScore -= 10;

    newScore = Math.max(0, Math.min(100, newScore));

    const delta = previousRisk
      ? newScore - previousRisk.baseScore
      : 0;

    return {
      previousScore: previousRisk?.baseScore || null,
      simulatedScore: newScore,
      delta,
      explanation:
        delta > 0
          ? 'Risk increased due to negative factors'
          : delta < 0
          ? 'Risk reduced due to positive interventions'
          : 'No significant change in risk',
    };
  } catch (error) {
    throw new Error('Simulation failed: ' + error.message);
  }
};


// =======================
// 3️⃣ Chat with LLM (RAG)
// =======================
const chatWithLLM = async (patientId, query) => {
  try {
    const notes = await ClinicalNote.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(10); // 🔥 prevent prompt explosion

    const recordsText = notes
      .map(
        (n) =>
          `[${n.createdAt.toISOString()}] (${n.type}) ${n.text}`
      )
      .join('\n');

    const prompt = `
You are a clinical AI assistant helping a doctor.

Patient History:
${recordsText}

Instructions:
- Be concise and medically relevant
- Highlight risks and important patterns
- Do NOT hallucinate

Doctor's Question:
${query}

Answer:
`;

    // 🔹 Real LLM Call (future)
    /*
    const response = await axiosInstance.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
    */

    // 🔥 Mock response
    return `Based on recent clinical notes, patient shows ${
      notes.length > 0 ? 'ongoing monitoring needs' : 'limited history'
    }. Recommend continued observation and vitals tracking.`;

  } catch (error) {
    throw new Error('LLM Chat failed: ' + error.message);
  }
};


// =======================
// 4️⃣ Analyze Dictation
// =======================
const analyzeDictation = async (patientId, text) => {
  try {
    const patient = await Patient.findById(patientId);
    if (!patient) throw new Error('Patient not found');

    // 🔥 Smarter keyword logic
    const lowerText = text.toLowerCase();

    const improvingKeywords = ['better', 'stable', 'improving'];
    const decliningKeywords = ['worse', 'declining', 'critical'];

    let trajectory = 'stable';

    if (improvingKeywords.some((k) => lowerText.includes(k))) {
      trajectory = 'improving';
    } else if (decliningKeywords.some((k) =>
      lowerText.includes(k)
    )) {
      trajectory = 'declining';
    }

    // 🔥 Save note with AI analysis
    const note = await ClinicalNote.create({
      patientId,
      text,
      type: 'dictation',
      aiAnalysis: {
        trajectory,
      },
    });

    // 🔥 Update patient trajectory
    await Patient.findByIdAndUpdate(patientId, {
      trajectory,
    });

    return {
      trajectory,
      savedNote: note,
    };
  } catch (error) {
    throw new Error(
      'Dictation analysis failed: ' + error.message
    );
  }
};


export {
  predictRisk,
  simulateRisk,
  chatWithLLM,
  analyzeDictation,
};