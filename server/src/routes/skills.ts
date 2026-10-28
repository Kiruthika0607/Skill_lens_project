import { Router, Request, Response } from 'express';
import { db } from '../db';
import { TaxonomyService } from '../services/taxonomy';

const router = Router();

// POST /api/skills/normalize
router.post('/normalize', (req: Request, res: Response) => {
  const { skill } = req.body;
  if (!skill) return res.status(400).json({ error: 'Skill text is required.' });

  const result = TaxonomyService.normalizeSkill(skill);
  if (!result) {
    return res.json({
      normalized: false,
      inputSkill: skill,
      message: 'No taxonomy match found. Logged for admin data quality review.'
    });
  }

  return res.json({
    normalized: true,
    inputSkill: skill,
    ...result
  });
});

// GET /api/skills
router.get('/', (req: Request, res: Response) => {
  const { category, search } = req.query;
  let query = `SELECT * FROM skills WHERE 1=1`;
  const params: any[] = [];

  if (category) {
    query += ` AND category = ?`;
    params.push(category);
  }
  if (search) {
    query += ` AND (name LIKE ? OR normalized_name LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY demand_score DESC, name ASC`;
  const skills = db.prepare(query).all(...params);
  return res.json({ skills, count: skills.length });
});

// GET /api/skills/:id
router.get('/:id', (req: Request, res: Response) => {
  const skill = db.prepare(`SELECT * FROM skills WHERE id = ?`).get(req.params.id);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });

  const aliases = db.prepare(`SELECT alias FROM skill_aliases WHERE skill_id = ?`).all(req.params.id);
  const resources = db.prepare(`
    SELECT lr.* FROM learning_resources lr
    JOIN skill_resources sr ON lr.id = sr.resource_id
    WHERE sr.skill_id = ?
  `).all(req.params.id);

  return res.json({
    skill,
    aliases: aliases.map((a: any) => a.alias),
    learningResources: resources
  });
});

// GET /api/skills/:id/related
router.get('/:id/related', (req: Request, res: Response) => {
  const related = db.prepare(`
    SELECT s.id, s.name, s.category, s.demand_score, sr.relationship_type, sr.weight
    FROM skill_relationships sr
    JOIN skills s ON (sr.skill_id_b = s.id AND sr.skill_id_a = ?) OR (sr.skill_id_a = s.id AND sr.skill_id_b = ?)
    WHERE s.id != ?
  `).all(req.params.id, req.params.id, req.params.id);

  return res.json({ skillId: req.params.id, relatedSkills: related });
});

export default router;
