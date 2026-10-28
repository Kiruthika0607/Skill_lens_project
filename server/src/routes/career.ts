import { Router, Request, Response } from 'express';
import { db } from '../db';
import crypto from 'crypto';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';
import { RecommendationService } from '../services/recommendation';
import { CareerPathService } from '../services/careerPath';
import { SimulatorService } from '../services/simulator';
import { JobMatchService } from '../services/jobMatch';

const router = Router();

// POST /api/career/onboarding
router.post('/onboarding', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) return res.status(400).json({ error: 'Student ID required.' });

    const { fullName, college, discipline, graduationYear, preferredDomain, skills, projects, certifications } = req.body;

    // Update student profile
    db.prepare(`
      UPDATE students
      SET full_name = ?, college = ?, discipline = ?, graduation_year = ?, preferred_domain = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(fullName, college, discipline, graduationYear, preferredDomain, studentId);

    // Save technical skills
    if (Array.isArray(skills)) {
      db.prepare(`DELETE FROM student_skills WHERE student_id = ?`).run(studentId);
      const insertSkill = db.prepare(`
        INSERT INTO student_skills (id, student_id, skill_id, proficiency_level, source, confidence_score)
        VALUES (?, ?, ?, ?, 'self', 0.85)
      `);
      for (const s of skills) {
        insertSkill.run(`ss_${crypto.randomUUID()}`, studentId, s.skillId, s.proficiencyLevel || 3);
      }
    }

    // Save projects
    if (Array.isArray(projects)) {
      db.prepare(`DELETE FROM projects WHERE student_id = ?`).run(studentId);
      const insertProject = db.prepare(`
        INSERT INTO projects (id, student_id, title, description, skills_used, repo_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const p of projects) {
        insertProject.run(`proj_${crypto.randomUUID()}`, studentId, p.title, p.description, p.skillsUsed, p.repoUrl || null);
      }
    }

    // Save certifications
    if (Array.isArray(certifications)) {
      db.prepare(`DELETE FROM certifications WHERE student_id = ?`).run(studentId);
      const insertCert = db.prepare(`
        INSERT INTO certifications (id, student_id, name, issuing_org, skill_id, verify_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const c of certifications) {
        insertCert.run(`cert_${crypto.randomUUID()}`, studentId, c.name, c.issuingOrg, c.skillId || null, c.verifyUrl || null);
      }
    }

    // Calculate initial recommendations and profile score
    const recs = RecommendationService.getRecommendations(studentId);
    const topScore = recs.length > 0 ? recs[0].compositeScore : 65;

    db.prepare(`UPDATE students SET student_score = ? WHERE id = ?`).run(topScore, studentId);

    return res.json({
      message: 'Onboarding completed successfully',
      studentScore: topScore,
      recommendationCount: recs.length
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/career/recommend
router.post('/recommend', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || req.body.studentId;
    if (!studentId) return res.status(400).json({ error: 'Student ID required.' });

    const recommendations = RecommendationService.getRecommendations(studentId);
    return res.json({ recommendations });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/career/recommendations
router.get('/recommendations', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || 'std_demo_student';
    let recs: any[] = [];
    try {
      recs = RecommendationService.getRecommendations(studentId);
    } catch {
      recs = [];
    }

    const targetRow = db.prepare(`SELECT role_id FROM student_target_careers WHERE student_id = ?`).get(studentId) as any;
    const currentTargetRoleId = targetRow?.role_id || (recs.length > 0 ? recs[0].roleId : null);

    const mapped = recs.map(r => {
      const roleRow = db.prepare(`SELECT * FROM career_roles WHERE id = ?`).get(r.roleId) as any;
      const skills = db.prepare(`
        SELECT s.name FROM career_role_skills crs JOIN skills s ON crs.skill_id = s.id WHERE crs.role_id = ? LIMIT 6
      `).all(r.roleId).map((s: any) => s.name);

      return {
        id: r.roleId,
        title: r.roleTitle,
        category: r.category,
        description: r.description || roleRow?.description || 'Industry-standard technical career role.',
        match_percentage: r.compositeScore,
        matchScore: r.compositeScore,
        demand_score: r.demandScore || 85,
        salary_range: roleRow?.salary_range || '₹6 - 16 LPA',
        skills_required: skills.length > 0 ? skills : ['React', 'Node.js', 'SQL', 'Git']
      };
    });

    return res.json({
      recommendations: mapped,
      currentTargetRoleId
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/career/roles
router.get('/roles', (req: Request, res: Response) => {
  try {
    const roles = db.prepare(`SELECT * FROM career_roles ORDER BY title ASC`).all();
    return res.json({ roles });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET & POST /api/career/skill-gap
const handleSkillGap = (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || req.body?.studentId || req.query?.studentId || 'std_demo_student';
    let roleId = req.body?.roleId || req.query?.roleId;

    if (!roleId) {
      const targetRow = db.prepare(`SELECT role_id FROM student_target_careers WHERE student_id = ?`).get(studentId) as any;
      roleId = targetRow?.role_id || 'role_frontend';
    }

    const recs = RecommendationService.getRecommendations(studentId);
    const target = recs.find(r => r.roleId === roleId) || recs[0];
    if (!target) return res.status(404).json({ error: 'Role recommendation not found for student.' });

    // Fetch required skills with weights from career_role_skills
    const requiredSkillsRows = db.prepare(`
      SELECT DISTINCT crs.skill_id, crs.importance_weight, crs.proficiency_required, crs.is_mandatory,
             s.name as skill_name, s.category, s.demand_score
      FROM career_role_skills crs
      JOIN skills s ON crs.skill_id = s.id
      WHERE crs.role_id = ?
    `).all(target.roleId) as any[];

    // Student's current skills
    const studentSkills = db.prepare(`
      SELECT skill_id, proficiency_level FROM student_skills WHERE student_id = ?
    `).all(studentId) as any[];
    const skillMap = new Map(studentSkills.map((s: any) => [s.skill_id, s.proficiency_level]));

    const skillsAnalysis = requiredSkillsRows.map((reqSkill: any) => {
      const currentProf = (skillMap.get(reqSkill.skill_id) as number) || 0;
      const requiredProf = reqSkill.proficiency_required || 3;
      const weight = reqSkill.importance_weight || 0.5;

      let status = 'MISSING';
      let gapPct = 100;
      if (currentProf >= requiredProf) {
        status = 'MATCHED';
        gapPct = 0;
      } else if (currentProf > 0) {
        status = 'PARTIAL';
        gapPct = Math.round(((requiredProf - currentProf) / requiredProf) * 100);
      }

      let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (reqSkill.is_mandatory === 1 && reqSkill.demand_score >= 50) priority = 'HIGH';
      else if (reqSkill.is_mandatory === 1 || reqSkill.demand_score >= 60 || weight >= 0.7) priority = 'MEDIUM';

      // Recommended action
      let recommendedAction = 'Maintain mastery through project applications.';
      if (status === 'MISSING') {
        recommendedAction = `Prioritize learning foundational ${reqSkill.skill_name} and complete hands-on practice projects.`;
      } else if (status === 'PARTIAL') {
        recommendedAction = `Advance from Level ${currentProf} to Level ${requiredProf} through specialized project assignments.`;
      }

      // Linked learning resources
      const resources = db.prepare(`
        SELECT lr.id, lr.title, lr.provider, lr.url, lr.cost_type, lr.duration_hours
        FROM learning_resources lr
        JOIN skill_resources sr ON lr.id = sr.resource_id
        WHERE sr.skill_id = ?
        LIMIT 3
      `).all(reqSkill.skill_id);

      return {
        skillId: reqSkill.skill_id,
        skillName: reqSkill.skill_name,
        category: reqSkill.category,
        demandScore: reqSkill.demand_score,
        currentProficiency: currentProf,
        requiredProficiency: requiredProf,
        importanceWeight: weight,
        gapPct,
        status,
        priority,
        recommendedAction,
        linkedResources: resources.length > 0 ? resources : [
          { title: `${reqSkill.skill_name} Official Documentation & Guides`, provider: 'Official Open Docs', url: 'https://developer.mozilla.org', cost_type: 'FREE', duration_hours: 15 }
        ]
      };
    });

    const overallGapPct = Math.max(0, 100 - target.compositeScore);

    return res.json({
      roleId: target.roleId,
      roleTitle: target.roleTitle,
      category: target.category,
      compositeScore: target.compositeScore,
      overallGapPct,
      formula: 'OverallGap% = 100% - CompositeScore; CompositeScore = (0.40 * SkillMatch) + (0.25 * DemandIndex) + (0.15 * DomainPref) + (0.10 * Discipline) + (0.10 * Location)',
      formulaVersion: 'v2.4-deterministic',
      isDemoData: true,
      demoDataLabel: 'SAMPLE / DEMO DATASET',
      skillsAnalysis,
      matchedCount: skillsAnalysis.filter(s => s.status === 'MATCHED').length,
      partialCount: skillsAnalysis.filter(s => s.status === 'PARTIAL').length,
      missingCount: skillsAnalysis.filter(s => s.status === 'MISSING').length,
      allRoles: recs.map(r => ({ roleId: r.roleId, roleTitle: r.roleTitle, compositeScore: r.compositeScore }))
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

router.get('/skill-gap', authenticate, handleSkillGap);
router.post('/skill-gap', authenticate, handleSkillGap);

// POST /api/career/career-path
router.post('/career-path', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || req.body.studentId;
    const { targetRoleId } = req.body;
    if (!studentId || !targetRoleId) return res.status(400).json({ error: 'studentId and targetRoleId required.' });

    const plan = CareerPathService.generatePath(studentId, targetRoleId);
    return res.json({ plan });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/career/simulator
router.post('/simulator', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || req.body.studentId;
    const { hypotheticalSkillIds } = req.body;
    if (!studentId || !Array.isArray(hypotheticalSkillIds)) {
      return res.status(400).json({ error: 'studentId and hypotheticalSkillIds array required.' });
    }

    const simulation = SimulatorService.simulateSkillAcquisition(studentId, hypotheticalSkillIds);
    return res.json({ simulation });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/career/job-matches
router.get('/job-matches', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) return res.status(400).json({ error: 'Student ID required.' });

    const matches = JobMatchService.getJobMatches(studentId);
    return res.json({ matches });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
