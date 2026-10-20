import { Router } from 'express';
import { db } from '../data/store.js';
import { config } from '../config.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  draftRtiRequest,
  draftAppealPetition,
  classifyResponseService,
  recommendAuthorityService,
} from '../services/geminiService.js';

const router = Router();

/**
 * GET /api/ai/status
 */
router.get('/status', (req, res) => {
  res.json({
    geminiConfigured: Boolean(config.geminiApiKey),
    model: config.geminiModel,
    provider: config.geminiApiKey ? 'Google Gemini AI' : 'Legal Engine Fallback (Add key in .env)',
  });
});

/**
 * POST /api/recommend-authority
 */
router.post('/recommend-authority', async (req, res) => {
  try {
    const draftText = typeof req.body === 'string' ? req.body : req.body?.draftText || '';
    const authorities = db.getAuthorities();
    const result = await recommendAuthorityService(draftText, authorities);
    res.json(result);
  } catch (err) {
    console.error('Failed to recommend authority:', err);
    res.status(500).json({
      code: 'RECOMMENDATION_FAILED',
      message: err.message || 'Unable to recommend public authority',
    });
  }
});

/**
 * POST /api/classify-response
 */
router.post('/classify-response', async (req, res) => {
  const { responseText, requestContext } = req.body || {};

  if (!responseText || typeof responseText !== 'string' || !responseText.trim()) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Response text is required and must be a non-empty string.',
    });
  }

  if (responseText.length > 5000) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: `Response text exceeds the maximum allowed length of 5000 characters (received ${responseText.length}).`,
    });
  }

  try {
    console.log(`[AI] Classifying response: "${responseText.trim().slice(0, 60)}..."`);
    const result = await classifyResponseService(responseText.trim(), requestContext);
    res.json(result);
  } catch (err) {
    console.error('[AI] Classify response failed:', err);
    const status = err.statusCode || 500;
    res.status(status).json({
      code: err.code || 'AI_CLASSIFICATION_FAILED',
      message: err.message || 'Failed to classify government response.',
    });
  }
});

/**
 * POST /api/draft-request (Requires Authenticated Citizen Session)
 */
router.post('/draft-request', requireAuth, async (req, res) => {
  try {
    const concern = typeof req.body === 'string' ? req.body : req.body?.concern || req.body?.title || '';
    if (!concern.trim()) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Concern description cannot be blank',
      });
    }

    console.log(`[AI] Drafting RTI request for: "${concern.slice(0, 60)}..."`);
    const result = await draftRtiRequest(concern);
    res.json(result);
  } catch (err) {
    console.error('[AI] Draft request failed:', err);
    res.status(500).json({
      code: 'AI_DRAFT_FAILED',
      message: err.message || 'Upstream LLM generation failed. Please try again.',
    });
  }
});

/**
 * POST /api/draft-appeal (Requires Authenticated Citizen Session)
 */
router.post('/draft-appeal', requireAuth, async (req, res) => {
  try {
    const { caseId, appealType, caseDetails } = req.body || {};

    let details = caseDetails;
    if (!details && caseId) {
      details = db.getCaseById(caseId);
    }

    if (!details) {
      details = {
        trackingNumber: caseId || 'RTI-2026-0042',
        authority: db.getAuthorities()[0],
        filingDate: new Date().toISOString(),
      };
    }

    console.log(`[AI] Drafting ${appealType || 'first'} appeal for: ${details.trackingNumber || caseId}`);
    const result = await draftAppealPetition(details, appealType);
    res.json(result);
  } catch (err) {
    console.error('[AI] Draft appeal failed:', err);
    res.status(500).json({
      code: 'AI_APPEAL_DRAFT_FAILED',
      message: err.message || 'Upstream LLM generation failed. Please try again.',
    });
  }
});

export default router;
