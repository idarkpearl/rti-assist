import { Router } from 'express';
import { db } from '../data/store.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * GET /api/deadlines
 * Query params: caseId, status
 */
router.get('/', optionalAuth, (req, res) => {
  const { caseId, status } = req.query;
  const deadlines = db.getDeadlines({ caseId, status });
  res.json(deadlines);
});

/**
 * GET /api/deadlines/:id
 */
router.get('/:id', optionalAuth, (req, res) => {
  const deadline = db.getDeadlineById(req.params.id);
  if (!deadline) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Deadline not found with id: ${req.params.id}`,
    });
  }
  res.json(deadline);
});

/**
 * POST /api/deadlines
 */
router.post('/', optionalAuth, (req, res) => {
  const data = req.body || {};
  const deadline = db.createDeadline(data);
  res.status(201).json(deadline);
});

/**
 * PATCH /api/deadlines/:id
 */
router.patch('/:id', optionalAuth, (req, res) => {
  const updated = db.updateDeadline(req.params.id, req.body || {});
  if (!updated) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Deadline not found with id: ${req.params.id}`,
    });
  }
  res.json(updated);
});

/**
 * PATCH /api/deadlines/:id/complete
 */
router.patch('/:id/complete', optionalAuth, (req, res) => {
  const completed = db.completeDeadline(req.params.id);
  if (!completed) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Deadline not found with id: ${req.params.id}`,
    });
  }
  res.json(completed);
});

/**
 * DELETE /api/deadlines/:id
 */
router.delete('/:id', optionalAuth, (req, res) => {
  const success = db.deleteDeadline(req.params.id);
  if (!success) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Deadline not found with id: ${req.params.id}`,
    });
  }
  res.json({ success: true, message: 'Deadline deleted successfully' });
});

export default router;
