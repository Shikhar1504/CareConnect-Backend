import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import * as aiService from '../services/ai.service.js';


// =======================
// Predict Risk
// =======================
const predictRisks = async (req, res, next) => {
  try {
    const { patientId, noteText } = req.body;

    if (!patientId) {
      return res.status(400).json({
        message: 'patientId is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        message: 'Invalid patient ID'
      });
    }

    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        message: 'Patient not found'
      });
    }

    const result = await aiService.predictRisk(patient, noteText);

    res.status(200).json(result);

  } catch (error) {
    next(error);
  }
};


// =======================
// Simulate Risk
// =======================
const simulateRisk = async (req, res, next) => {
  try {
    const { patientId, modifiedParams } = req.body;

    if (!patientId) {
      return res.status(400).json({
        message: 'patientId is required'
      });
    }

    const result = await aiService.simulateRisk(
      patientId,
      modifiedParams || {}
    );

    res.status(200).json(result);

  } catch (error) {
    next(error);
  }
};


// =======================
// Chat (RAG)
// =======================
const chat = async (req, res, next) => {
  try {
    const { patientId, query } = req.body;

    if (!patientId || !query) {
      return res.status(400).json({
        message: 'patientId and query are required'
      });
    }

    const answer = await aiService.chatWithLLM(
      patientId,
      query
    );

    res.status(200).json({ answer });

  } catch (error) {
    next(error);
  }
};


// =======================
// Dictation (AI analysis)
// =======================
const dictation = async (req, res, next) => {
  try {
    const { patientId, text } = req.body;

    if (!patientId || !text) {
      return res.status(400).json({
        message: 'patientId and text are required'
      });
    }

    const result = await aiService.analyzeDictation(
      patientId,
      text
    );

    res.status(200).json(result);

  } catch (error) {
    next(error);
  }
};


export {
  predictRisks,
  simulateRisk,
  chat,
  dictation
};