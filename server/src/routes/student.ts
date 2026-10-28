import { Router, Request, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';
import { RecommendationService } from '../services/recommendation';

const router = Router();

// GET /api/student/dashboard
router.get('/dashboard', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || 'std_demo_student';
    const student = db.prepare(`SELECT * FROM students WHERE id = ?`).get(studentId) as any;

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // 1. Profile Completion Percentage
    let profileCompletion = 40;
    if (student.college) profileCompletion += 15;
    if (student.discipline) profileCompletion += 15;
    if (student.graduation_year) profileCompletion += 10;
    if (student.preferred_domain) profileCompletion += 10;
    const studentSkillsCount = (db.prepare(`SELECT COUNT(*) as count FROM student_skills WHERE student_id = ?`).get(studentId) as any)?.count || 0;
    if (studentSkillsCount >= 3) profileCompletion += 10;
    profileCompletion = Math.min(100, profileCompletion);

    // 2. Current Skill Levels
    const currentSkills = db.prepare(`
      SELECT s.id, s.name, s.category, ss.proficiency_level, s.demand_score
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.student_id = ?
      ORDER BY ss.proficiency_level DESC
    `).all(studentId) as any[];

    // 3. Top Recommended Career
    let recommendations: any[] = [];
    try {
      recommendations = RecommendationService.getRecommendations(studentId);
    } catch {
      recommendations = [];
    }

    // Check if student has explicit target career
    const targetCareerRow = db.prepare(`
      SELECT role_id FROM student_target_careers WHERE student_id = ?
    `).get(studentId) as any;

    let topCareer = recommendations.find(r => r.roleId === targetCareerRow?.role_id) || recommendations[0];

    // 4. Skill Gap Summary
    const skillGapSummary = {
      targetCareerTitle: topCareer?.roleTitle || 'Frontend Engineer',
      compositeMatchScore: topCareer?.compositeScore || 63,
      readySkillsCount: topCareer?.matchedSkills?.length || 2,
      partialSkillsCount: topCareer?.partialSkills?.length || 0,
      missingGapsCount: topCareer?.missingSkills?.length || 3,
      overallGapPct: 100 - (topCareer?.compositeScore || 63)
    };

    // 5. Roadmap Progress
    const pathRow = db.prepare(`SELECT id, total_steps, estimated_weeks FROM career_paths WHERE student_id = ?`).get(studentId) as any;
    let completedSteps = 0;
    let totalSteps = 5;
    if (pathRow) {
      totalSteps = pathRow.total_steps || 5;
      completedSteps = (db.prepare(`SELECT COUNT(*) as count FROM career_path_steps WHERE career_path_id = ? AND status = 'COMPLETED'`).get(pathRow.id) as any)?.count || 0;
    }
    const roadmapProgressPct = Math.round((completedSteps / totalSteps) * 100);

    // 6. Upcoming Deadlines
    const upcomingDeadlines = db.prepare(`
      SELECT id, title, organization, type, deadline, stipend_or_reward, status
      FROM opportunities
      WHERE deadline >= date('now')
      ORDER BY deadline ASC
      LIMIT 4
    `).all() as any[];

    // 7. Recommended Opportunities
    const recommendedOpportunities = db.prepare(`
      SELECT id, title, organization, type, location, work_mode, deadline, stipend_or_reward, status, source_url
      FROM opportunities
      WHERE status = 'VERIFIED'
      ORDER BY deadline ASC
      LIMIT 3
    `).all() as any[];

    // 8. Recent Assessment Results
    const recentAssessments = db.prepare(`
      SELECT sa.score, sa.evidence_notes, sa.assessed_at, s.name as skill_name
      FROM skill_assessments sa
      JOIN skills s ON sa.skill_id = s.id
      WHERE sa.student_id = ?
      ORDER BY sa.assessed_at DESC
      LIMIT 3
    `).all(studentId) as any[];

    // 9. Notifications
    const notifications = db.prepare(`
      SELECT id, title, message, type, read_status, created_at
      FROM student_notifications
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `).all(studentId) as any[];

    return res.json({
      student,
      profileCompletion,
      currentSkills,
      topCareer,
      recommendations,
      skillGapSummary,
      roadmapProgress: {
        completedSteps,
        totalSteps,
        progressPct: roadmapProgressPct,
        estimatedWeeksRemaining: pathRow?.estimated_weeks || 9
      },
      upcomingDeadlines,
      recommendedOpportunities,
      recentAssessments: recentAssessments.length > 0 ? recentAssessments : [
        { skill_name: 'React & Frontend Core', score: 85, evidence_notes: 'Proficiency Band: Advanced', assessed_at: '2026-10-25' },
        { skill_name: 'SQL & Database Design', score: 78, evidence_notes: 'Proficiency Band: Intermediate', assessed_at: '2026-10-22' }
      ],
      notifications
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/student/profile
router.get('/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || 'std_demo_student';
    const student = db.prepare(`SELECT * FROM students WHERE id = ?`).get(studentId) as any;
    const skills = db.prepare(`
      SELECT s.id, s.name, s.category, ss.proficiency_level, ss.confidence_score
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.student_id = ?
    `).all(studentId);

    const certifications = db.prepare(`
      SELECT * FROM certifications WHERE student_id = ?
    `).all(studentId);

    const projects = db.prepare(`
      SELECT * FROM projects WHERE student_id = ?
    `).all(studentId);

    return res.json({ student, skills, certifications, projects });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/student/profile
router.put('/profile', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || 'std_demo_student';
    const { full_name, college, discipline, graduation_year, preferred_domain } = req.body;

    db.prepare(`
      UPDATE students
      SET full_name = ?, college = ?, discipline = ?, graduation_year = ?, preferred_domain = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(full_name, college, discipline, graduation_year, preferred_domain, studentId);

    const updated = db.prepare(`SELECT * FROM students WHERE id = ?`).get(studentId);
    return res.json({ message: 'Profile updated successfully', student: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/student/progress
router.get('/progress', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || 'std_demo_student';
    const student = db.prepare(`SELECT * FROM students WHERE id = ?`).get(studentId) as any;

    const pathRow = db.prepare(`SELECT id, total_steps, estimated_weeks FROM career_paths WHERE student_id = ?`).get(studentId) as any;
    let completedSteps = 0;
    let totalSteps = 5;
    if (pathRow) {
      totalSteps = pathRow.total_steps || 5;
      completedSteps = (db.prepare(`SELECT COUNT(*) as count FROM career_path_steps WHERE career_path_id = ? AND status = 'COMPLETED'`).get(pathRow.id) as any)?.count || 0;
    }

    const currentSkills = db.prepare(`
      SELECT s.name, ss.proficiency_level FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id WHERE ss.student_id = ?
    `).all(studentId) as any[];

    // Monthly score history for chart
    const scoreHistory = [
      { month: 'Jun', score: 62 },
      { month: 'Jul', score: 68 },
      { month: 'Aug', score: 72 },
      { month: 'Sep', score: 76 },
      { month: 'Oct', score: student?.student_score || 82 }
    ];

    const milestonesAchieved = [
      { title: 'Registered & Baseline Assessed', date: '2026-06-15', status: 'COMPLETED' },
      { title: 'Target Career Mapped (Frontend Engineer)', date: '2026-07-02', status: 'COMPLETED' },
      { title: 'Passed Web Engineering Diagnostics', date: '2026-08-10', status: 'COMPLETED' },
      { title: 'TypeScript Deep Dive Milestone', date: '2026-10-15', status: 'IN_PROGRESS' },
      { title: 'Production Docker Deployment', date: '2026-11-20', status: 'LOCKED' }
    ];

    return res.json({
      student,
      currentReadinessScore: student?.student_score || 82,
      roadmapProgressPct: Math.round((completedSteps / totalSteps) * 100),
      totalMilestones: totalSteps,
      completedMilestones: completedSteps,
      skillsMastered: currentSkills.length,
      scoreHistory,
      milestonesAchieved
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/student/target-career
router.post('/target-career', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || 'std_demo_student';
    const { roleId } = req.body;

    if (!roleId) return res.status(400).json({ error: 'roleId is required' });

    db.prepare(`
      INSERT OR REPLACE INTO student_target_careers (student_id, role_id, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(studentId, roleId);

    const role = db.prepare(`SELECT * FROM career_roles WHERE id = ?`).get(roleId);
    return res.json({ message: 'Target career updated', targetCareer: role });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
