import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import {
  classifyResponseService,
  draftRtiRequest,
  draftAppealPetition,
  recommendAuthorityService,
  getGeminiApiKey,
  getGeminiModel,
} from './services/geminiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;

// Basic In-Memory Rate Limiter (60 requests per minute per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;

function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    record.count += 1;
  }

  rateLimitMap.set(ip, record);

  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again in a few moments.',
    });
  }

  next();
}

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  const apiKey = getGeminiApiKey();
  res.json({
    status: 'ok',
    service: 'rti-assist-llm-service',
    port: PORT,
    geminiConfigured: Boolean(apiKey),
    model: getGeminiModel(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/status', (req, res) => {
  const apiKey = getGeminiApiKey();
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(apiKey),
    model: getGeminiModel(),
    provider: apiKey ? 'Google Gemini AI' : 'Legal Engine Fallback (Add key in .env)',
  });
});

app.get('/', (req, res) => {
  const apiKey = getGeminiApiKey();
  res.json({
    service: 'RTI Assist Dedicated LLM Microservice',
    status: 'ONLINE',
    port: PORT,
    geminiConfigured: Boolean(apiKey),
    model: getGeminiModel(),
    endpoints: [
      'POST /classify-response',
      'POST /draft-request',
      'POST /draft-appeal',
      'POST /recommend-authority',
      'GET /health',
      'GET /status',
    ],
  });
});

/**
 * POST /classify-response
 * Accepts: { responseText: string, requestContext?: object }
 */
app.post('/classify-response', async (req, res) => {
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
    const classification = await classifyResponseService(responseText.trim(), requestContext);
    res.json(classification);
  } catch (err) {
    console.error('[LLM Service] /classify-response error:', err);
    const status = err.statusCode || 500;
    res.status(status).json({
      code: err.code || 'AI_CLASSIFICATION_FAILED',
      message: err.message || 'Failed to classify government response.',
    });
  }
});

/**
 * POST /draft-request
 * Accepts: { concern: string }
 */
app.post('/draft-request', async (req, res) => {
  try {
    const concern = typeof req.body === 'string' ? req.body : req.body?.concern || req.body?.title || '';
    if (!concern.trim()) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Concern description cannot be blank',
      });
    }

    const result = await draftRtiRequest(concern);
    res.json(result);
  } catch (err) {
    console.error('[LLM Service] /draft-request error:', err);
    res.status(500).json({
      code: 'AI_DRAFT_FAILED',
      message: err.message || 'Failed to generate RTI draft.',
    });
  }
});

/**
 * POST /draft-appeal
 * Accepts: { caseId?: string, appealType?: string, caseDetails?: object }
 */
app.post('/draft-appeal', async (req, res) => {
  try {
    const { caseDetails, appealType } = req.body || {};
    const details = caseDetails || {
      trackingNumber: req.body?.caseId || 'RTI-2026-0042',
      filingDate: new Date().toISOString(),
    };

    const result = await draftAppealPetition(details, appealType);
    res.json(result);
  } catch (err) {
    console.error('[LLM Service] /draft-appeal error:', err);
    res.status(500).json({
      code: 'AI_APPEAL_DRAFT_FAILED',
      message: err.message || 'Failed to generate appeal petition.',
    });
  }
});

/**
 * POST /recommend-authority
 * Accepts: { draftText: string, authorities?: array }
 */
app.post('/recommend-authority', async (req, res) => {
  try {
    const draftText = typeof req.body === 'string' ? req.body : req.body?.draftText || '';
    const authorities = req.body?.authorities || [];
    const result = await recommendAuthorityService(draftText, authorities);
    res.json(result);
  } catch (err) {
    console.error('[LLM Service] /recommend-authority error:', err);
    res.status(500).json({
      code: 'RECOMMENDATION_FAILED',
      message: err.message || 'Unable to recommend public authority',
    });
  }
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: err.message || 'An unexpected error occurred in the LLM microservice.',
  });
});

app.listen(PORT, () => {
  const apiKey = getGeminiApiKey();
  console.log(`================================================================`);
  console.log(`🧠 RTI ASSIST LLM MICROSERVICE RUNNING ON http://localhost:${PORT}`);
  console.log(`🔑 Gemini Key: ${apiKey ? '✅ Configured (' + getGeminiModel() + ')' : '⚠️ Fallback rules engine active'}`);
  console.log(`📍 Endpoints:`);
  console.log(`   - POST http://localhost:${PORT}/classify-response`);
  console.log(`   - POST http://localhost:${PORT}/draft-request`);
  console.log(`   - POST http://localhost:${PORT}/draft-appeal`);
  console.log(`   - POST http://localhost:${PORT}/recommend-authority`);
  console.log(`================================================================`);
});
