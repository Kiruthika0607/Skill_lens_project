import { Router, Request, Response } from 'express';
import { db } from '../db';
import crypto from 'crypto';

const router = Router();

// GET /api/opportunities
router.get('/', (req: Request, res: Response) => {
  try {
    const { type, location, work_mode, scope, setting, search, status } = req.query;

    let query = `SELECT * FROM opportunities WHERE 1=1`;
    const params: any[] = [];

    if (type && type !== 'ALL') {
      query += ` AND type = ?`;
      params.push(type);
    }
    if (location && location !== 'ALL') {
      query += ` AND location LIKE ?`;
      params.push(`%${location}%`);
    }
    if (work_mode && work_mode !== 'ALL') {
      query += ` AND work_mode = ?`;
      params.push(work_mode);
    }
    if (scope && scope !== 'ALL') {
      query += ` AND scope = ?`;
      params.push(scope);
    }
    if (setting && setting !== 'ALL') {
      query += ` AND setting = ?`;
      params.push(setting);
    }
    if (status && status !== 'ALL') {
      query += ` AND status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (title LIKE ? OR organization LIKE ? OR description LIKE ? OR skills_required LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ` ORDER BY deadline ASC`;

    const opportunities = db.prepare(query).all(...params);

    // Calculate category counts for badges/tabs
    const counts = {
      ALL: (db.prepare(`SELECT COUNT(*) as count FROM opportunities`).get() as any)?.count || 0,
      JOB: (db.prepare(`SELECT COUNT(*) as count FROM opportunities WHERE type = 'JOB'`).get() as any)?.count || 0,
      INTERNSHIP: (db.prepare(`SELECT COUNT(*) as count FROM opportunities WHERE type = 'INTERNSHIP'`).get() as any)?.count || 0,
      SCHOLARSHIP: (db.prepare(`SELECT COUNT(*) as count FROM opportunities WHERE type = 'SCHOLARSHIP'`).get() as any)?.count || 0,
      HACKATHON: (db.prepare(`SELECT COUNT(*) as count FROM opportunities WHERE type = 'HACKATHON'`).get() as any)?.count || 0,
    };

    return res.json({ opportunities, counts });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/opportunities/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const opp = db.prepare(`SELECT * FROM opportunities WHERE id = ?`).get(req.params.id);
    if (!opp) return res.status(404).json({ error: 'Opportunity not found' });
    return res.json({ opportunity: opp });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
