import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/college/analytics
router.get('/analytics', (req: Request, res: Response) => {
  try {
    const totalStudentsRow = db.prepare(`SELECT COUNT(*) as count FROM students`).get() as any;
    const totalStudents = totalStudentsRow?.count || 100;

    const avgReadinessRow = db.prepare(`SELECT AVG(student_score) as avgScore FROM students`).get() as any;
    const avgReadinessScore = Math.round(avgReadinessRow?.avgScore || 78);

    // Department Breakdown
    const departmentBreakdown = db.prepare(`
      SELECT discipline as department, COUNT(*) as studentCount, AVG(student_score) as avgScore
      FROM students
      GROUP BY discipline
    `).all();

    // Top Batch Skill Gaps across all students
    const commonSkillGaps = db.prepare(`
      SELECT s.name as skillName, s.category, COUNT(ss.id) as missingCount
      FROM skills s
      LEFT JOIN student_skills ss ON s.id = ss.skill_id
      GROUP BY s.id
      ORDER BY missingCount ASC
      LIMIT 6
    `).all();

    // Placement Readiness Distribution
    const placementReadiness = [
      { range: '>= 80% (Job Ready)', count: db.prepare(`SELECT COUNT(*) as c FROM students WHERE student_score >= 80`).get() as any },
      { range: '60-79% (Near Ready)', count: db.prepare(`SELECT COUNT(*) as c FROM students WHERE student_score >= 60 AND student_score < 80`).get() as any },
      { range: '< 60% (Needs Upskilling)', count: db.prepare(`SELECT COUNT(*) as c FROM students WHERE student_score < 60`).get() as any }
    ].map(item => ({ range: item.range, count: item.count?.c || 0 }));

    return res.json({
      summary: {
        totalStudents,
        avgReadinessScore,
        placementRate: 84,
        totalInstitutions: 15
      },
      departmentBreakdown,
      commonSkillGaps,
      placementReadiness
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
