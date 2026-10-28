import { Router, Request, Response } from 'express';
import { db } from '../db';
import { DemandService } from '../services/demand';

const router = Router();

// POST /api/demand/analyze
router.post('/analyze', (req: Request, res: Response) => {
  const metrics = DemandService.calculateDemandScores();
  return res.json({
    message: 'Demand calculation complete.',
    methodology: 'DemandScore = 0.40 * Freq + 0.30 * Growth + 0.15 * IndSpread + 0.15 * GeoSpread',
    topDemandedSkills: metrics.slice(0, 10),
    totalEvaluated: metrics.length
  });
});

// GET /api/demand/top
router.get('/top', (req: Request, res: Response) => {
  const top = db.prepare(`
    SELECT id, name, category, demand_score, description
    FROM skills
    ORDER BY demand_score DESC
    LIMIT 15
  `).all();
  return res.json({ topSkills: top });
});

// GET /api/demand/forecast
router.get('/forecast', (req: Request, res: Response) => {
  const forecasts = db.prepare(`
    SELECT sf.*, s.name as skill_name, s.category
    FROM skill_forecasts sf
    JOIN skills s ON sf.skill_id = s.id
    ORDER BY sf.predicted_demand_score DESC
  `).all();
  return res.json({ forecasts });
});

// GET /api/demand/resources
router.get('/resources', (req: Request, res: Response) => {
  try {
    const raw = db.prepare(`
      SELECT lr.*, s.name as skill_name, s.category as skill_category
      FROM learning_resources lr
      LEFT JOIN skill_resources sr ON lr.id = sr.resource_id
      LEFT JOIN skills s ON sr.skill_id = s.id
      ORDER BY lr.title ASC
    `).all() as any[];

    const resources = raw.map(r => ({
      ...r,
      cost: r.cost_type === 'FREE' ? 0 : 'PAID',
      type: r.difficulty || 'COURSE',
      rating: 4.8
    }));

    return res.json({ resources });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
