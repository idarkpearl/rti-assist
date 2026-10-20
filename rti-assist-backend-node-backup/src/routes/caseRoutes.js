import { Router } from 'express';
import { db } from '../data/store.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import { recommendAuthorityService } from '../services/geminiService.js';

const router = Router();

/**
 * GET /api/cases
 */
router.get('/', optionalAuth, (req, res) => {
  const { status, search } = req.query;
  const cases = db.getCases({ status, search });
  res.json(cases);
});

/**
 * POST /api/cases/recommend-authority
 * Can be called under /api/cases/recommend-authority or /api/recommend-authority
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
 * GET /api/cases/:id
 */
router.get('/:id', optionalAuth, (req, res) => {
  const caseItem = db.getCaseById(req.params.id);
  if (!caseItem) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Case not found with id: ${req.params.id}`,
    });
  }
  res.json(caseItem);
});

/**
 * POST /api/cases
 */
router.post('/', optionalAuth, (req, res) => {
  const data = req.body || {};

  // If user is authenticated, attach applicant details
  if (req.user && !data.applicant) {
    data.applicant = {
      fullName: req.user.name,
      email: req.user.email,
    };
  }

  const newCase = db.createCase(data);
  res.status(201).json(newCase);
});

/**
 * PATCH /api/cases/:id
 */
router.patch('/:id', optionalAuth, (req, res) => {
  const updated = db.updateCase(req.params.id, req.body || {});
  if (!updated) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Case not found with id: ${req.params.id}`,
    });
  }
  res.json(updated);
});

/**
 * GET /api/cases/:id/appeals
 */
router.get('/:id/appeals', optionalAuth, (req, res) => {
  const caseItem = db.getCaseById(req.params.id);
  if (!caseItem) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Case not found with id: ${req.params.id}`,
    });
  }
  const appeals = db.getAppeals(req.params.id);
  res.json(appeals);
});

/**
 * GET /api/cases/:id/deadlines
 */
router.get('/:id/deadlines', optionalAuth, (req, res) => {
  const caseItem = db.getCaseById(req.params.id);
  if (!caseItem) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Case not found with id: ${req.params.id}`,
    });
  }
  const deadlines = db.getDeadlines({ caseId: req.params.id });
  res.json(deadlines);
});

/**
 * GET /api/cases/:id/documents
 */
router.get('/:id/documents', optionalAuth, (req, res) => {
  const caseItem = db.getCaseById(req.params.id);
  if (!caseItem) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Case not found with id: ${req.params.id}`,
    });
  }
  res.json(caseItem.documents || []);
});

/**
 * POST /api/cases/:id/documents
 */
router.post('/:id/documents', optionalAuth, (req, res) => {
  const doc = db.addDocumentToCase(req.params.id, req.body || {});
  if (!doc) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Case not found with id: ${req.params.id}`,
    });
  }
  res.status(201).json(doc);
});

/**
 * DELETE /api/cases/:id
 */
router.delete('/:id', optionalAuth, (req, res) => {
  const success = db.deleteCase(req.params.id);
  if (!success) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Case not found with id: ${req.params.id}`,
    });
  }
  res.json({ success: true, message: 'Case deleted successfully' });
});

export default router;
