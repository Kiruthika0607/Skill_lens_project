import { Router, Request, Response } from 'express';
import { db } from '../db';
import crypto from 'crypto';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';
import { CareerPathService } from '../services/careerPath';

const router = Router();

// GET /api/roadmap
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || 'std_demo_student';
    const targetRoleRow = db.prepare(`SELECT role_id FROM student_target_careers WHERE student_id = ?`).get(studentId) as any;
    const targetRoleId = targetRoleRow?.role_id || 'role_frontend';

    let plan = CareerPathService.generatePath(studentId, targetRoleId);

    // Ensure step dependencies locked/unlocked status
    let previousStepCompleted = true;
    const milestones = plan.steps.map((step: any, index: number) => {
      const isLocked = index > 0 && !previousStepCompleted && step.status !== 'COMPLETED';
      if (step.status !== 'COMPLETED') {
        previousStepCompleted = false;
      }

      return {
        ...step,
        id: step.id || `step_${step.stepOrder}`,
        is_locked: isLocked,
        isLocked,
        timeline: `Stage ${step.stepOrder} (~${Math.ceil((step.estimatedHours || 30) / 15)} weeks)`
      };
    });

    const completedCount = milestones.filter((m: any) => m.status === 'COMPLETED').length;
    const progressPct = Math.round((completedCount / (milestones.length || 1)) * 100);

    return res.json({
      targetRoleId,
      targetRoleTitle: plan.targetRoleTitle,
      careerTitle: plan.targetRoleTitle,
      totalSteps: plan.totalSteps,
      totalEstimatedHours: plan.totalEstimatedHours,
      estimatedWeeks: plan.estimatedWeeks,
      completedCount,
      progressPct,
      progressPercentage: progressPct,
      milestones
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/roadmap/toggle-step
router.post('/toggle-step', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || 'std_demo_student';
    const { stepId, stepOrder, targetRoleId = 'role_frontend', status } = req.body;

    const currentPath = db.prepare(`
      SELECT id FROM career_paths WHERE student_id = ? AND target_role_id = ?
    `).get(studentId, targetRoleId) as any;

    if (currentPath) {
      let stepRow: any = null;
      if (stepId) {
        stepRow = db.prepare(`SELECT id, status, step_order FROM career_path_steps WHERE id = ? AND career_path_id = ?`).get(stepId, currentPath.id);
      }
      if (!stepRow && (stepOrder || stepId)) {
        const orderNum = parseInt(stepOrder || stepId);
        if (!isNaN(orderNum)) {
          stepRow = db.prepare(`SELECT id, status, step_order FROM career_path_steps WHERE career_path_id = ? AND step_order = ?`).get(currentPath.id, orderNum);
        }
      }

      if (stepRow) {
        const newStatus = status || (stepRow.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED');
        db.prepare(`UPDATE career_path_steps SET status = ? WHERE id = ?`).run(newStatus, stepRow.id);
      }
    }

    // Refresh roadmap
    const plan = CareerPathService.generatePath(studentId, targetRoleId);
    let previousStepCompleted = true;
    const milestones = plan.steps.map((step: any, index: number) => {
      const isLocked = index > 0 && !previousStepCompleted && step.status !== 'COMPLETED';
      if (step.status !== 'COMPLETED') {
        previousStepCompleted = false;
      }

      return {
        ...step,
        id: step.id || `step_${step.stepOrder}`,
        is_locked: isLocked,
        isLocked,
        timeline: `Stage ${step.stepOrder} (~${Math.ceil((step.estimatedHours || 30) / 15)} weeks)`
      };
    });

    const completedCount = milestones.filter((m: any) => m.status === 'COMPLETED').length;
    const progressPct = Math.round((completedCount / (milestones.length || 1)) * 100);

    return res.json({
      message: 'Milestone updated',
      completedCount,
      progressPct,
      progressPercentage: progressPct,
      milestones
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
