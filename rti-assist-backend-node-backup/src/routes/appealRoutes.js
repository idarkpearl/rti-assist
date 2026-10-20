import { Router } from 'express';
import { db } from '../data/store.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * GET /api/appeals
 * Query params: caseId
 */
router.get('/', optionalAuth, (req, res) => {
  const { caseId } = req.query;
  const list = db.getAppeals(caseId);
  res.json(list);
});

/**
 * GET /api/appeals/:id
 */
router.get('/:id', optionalAuth, (req, res) => {
  const appeal = db.getAppealById(req.params.id);
  if (!appeal) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Appeal draft not found with id: ${req.params.id}`,
    });
  }
  res.json(appeal);
});

/**
 * POST /api/appeals
 */
router.post('/', optionalAuth, (req, res) => {
  const data = req.body || {};
  const appeal = db.createAppeal(data);
  res.status(201).json(appeal);
});

/**
 * PATCH /api/appeals/:id
 */
router.patch('/:id', optionalAuth, (req, res) => {
  const updated = db.updateAppeal(req.params.id, req.body || {});
  if (!updated) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Appeal draft not found with id: ${req.params.id}`,
    });
  }
  res.json(updated);
});

/**
 * DELETE /api/appeals/:id
 */
router.delete('/:id', optionalAuth, (req, res) => {
  const success = db.deleteAppeal(req.params.id);
  if (!success) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Appeal draft not found with id: ${req.params.id}`,
    });
  }
  res.json({ success: true, message: 'Appeal deleted successfully' });
});

export default router;
