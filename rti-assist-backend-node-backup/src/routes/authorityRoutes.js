import { Router } from 'express';
import { db } from '../data/store.js';

const router = Router();

/**
 * GET /api/authorities
 * Query: search, jurisdiction, level
 */
router.get('/', (req, res) => {
  const { search, jurisdiction, level } = req.query;
  const authorities = db.getAuthorities({ search, jurisdiction, level });
  res.json(authorities);
});

/**
 * GET /api/authorities/:id
 */
router.get('/:id', (req, res) => {
  const authority = db.getAuthorityById(req.params.id);
  if (!authority) {
    return res.status(404).json({
      code: 'NOT_FOUND',
      message: `Authority not found with id: ${req.params.id}`,
    });
  }
  res.json(authority);
});

export default router;
