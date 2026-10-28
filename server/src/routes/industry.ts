import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/industry/supply-demand (Flagship Demand vs Supply matrix)
router.get('/supply-demand', (req: Request, res: Response) => {
  const skills = db.prepare(`SELECT id, name, category, demand_score FROM skills ORDER BY demand_score DESC`).all() as any[];
  const totalStudents = (db.prepare(`SELECT COUNT(*) as count FROM students`).get() as any).count || 1;

  const matrix = skills.map(skill => {
    const supplyRow = db.prepare(`
      SELECT COUNT(DISTINCT student_id) as studentCount
      FROM student_skills
      WHERE skill_id = ? AND proficiency_level >= 3
    `).get(skill.id) as { studentCount: number };

    const studentSupplyCount = supplyRow.studentCount || 0;
    const supplyPct = Math.round((studentSupplyCount / totalStudents) * 100);
    const supplyScore = Math.min(100, Math.round(supplyPct * 2.5)); // Normalized 0-100

    const demandScore = skill.demand_score;
    const gapIndex = demandScore - supplyScore;

    let classification: 'Balanced' | 'Skill Shortage' | 'Oversupplied' = 'Balanced';
    if (gapIndex > 15) {
      classification = 'Skill Shortage';
    } else if (gapIndex < -20) {
      classification = 'Oversupplied';
    }

    return {
      skillId: skill.id,
      skillName: skill.name,
      category: skill.category,
      demandScore,
      studentSupplyScore: supplyScore,
      studentSupplyCount,
      gapIndex,
      classification
    };
  });

  const shortages = matrix.filter(m => m.classification === 'Skill Shortage');
  const oversupplied = matrix.filter(m => m.classification === 'Oversupplied');
  const balanced = matrix.filter(m => m.classification === 'Balanced');

  return res.json({
    summary: {
      totalSkillsEvaluated: matrix.length,
      shortageCount: shortages.length,
      oversuppliedCount: oversupplied.length,
      balancedCount: balanced.length
    },
    matrix,
    shortages,
    oversupplied
  });
});

// GET /api/industry/candidate-pool
router.get('/candidate-pool', (req: Request, res: Response) => {
  const candidates = db.prepare(`
    SELECT s.id, s.full_name, s.college, s.discipline, s.graduation_year, s.preferred_domain, s.student_score
    FROM students s
    ORDER BY s.student_score DESC
    LIMIT 20
  `).all() as any[];

  for (const c of candidates) {
    const skills = db.prepare(`
      SELECT sk.name, ss.proficiency_level
      FROM student_skills ss
      JOIN skills sk ON ss.skill_id = sk.id
      WHERE ss.student_id = ?
      ORDER BY ss.proficiency_level DESC
    `).all(c.id);
    c.skills = skills;
  }

  return res.json({ candidates });
});

export default router;
