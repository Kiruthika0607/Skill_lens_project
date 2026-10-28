import { db } from '../db';
import crypto from 'crypto';

export interface CareerPathStep {
  stepOrder: number;
  skillId: string;
  skillName: string;
  category: string;
  rationale: string;
  prereqSkillId?: string;
  prereqSkillName?: string;
  estimatedHours: number;
  projectTask: string;
  validationMethod: string;
  resources: { title: string; provider: string; url: string; costType: string; durationHours: number }[];
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface CareerPathPlan {
  pathId: string;
  studentId: string;
  targetRoleId: string;
  targetRoleTitle: string;
  totalSteps: number;
  totalEstimatedHours: number;
  estimatedWeeks: number;
  steps: CareerPathStep[];
}

export class CareerPathService {
  /**
   * Generates a dependency-graph ordered career learning path for a target role.
   */
  static generatePath(studentId: string, targetRoleId: string): CareerPathPlan {
    const role = db.prepare(`SELECT * FROM career_roles WHERE id = ?`).get(targetRoleId) as any;
    if (!role) throw new Error('Target career role not found');

    const gaps = db.prepare(`
      SELECT sg.skill_id, sg.status, sg.priority, s.name as skill_name, s.category, s.demand_score
      FROM skill_gaps sg
      JOIN skills s ON sg.skill_id = s.id
      WHERE sg.student_id = ? AND sg.role_id = ? AND sg.status IN ('MISSING', 'PARTIAL')
      ORDER BY CASE sg.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END, s.demand_score DESC
    `).all(studentId, targetRoleId) as any[];

    const pathId = `path_${studentId}_${targetRoleId}`;

    db.prepare(`
      INSERT OR REPLACE INTO career_paths (id, student_id, target_role_id, total_steps, estimated_weeks, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(pathId, studentId, targetRoleId, gaps.length, Math.max(2, Math.ceil(gaps.length * 1.5)));

    db.prepare(`DELETE FROM career_path_steps WHERE career_path_id = ?`).run(pathId);

    const steps: CareerPathStep[] = [];
    let cumulativeHours = 0;

    gaps.forEach((gap, index) => {
      const stepOrder = index + 1;

      const prereq = db.prepare(`
        SELECT sr.skill_id_a as prereq_id, s.name as prereq_name
        FROM skill_relationships sr
        JOIN skills s ON sr.skill_id_a = s.id
        WHERE sr.skill_id_b = ? AND sr.relationship_type = 'PREREQUISITE_FOR'
        LIMIT 1
      `).get(gap.skill_id) as any;

      const estimatedHours = gap.status === 'PARTIAL' ? 15 : (gap.priority === 'HIGH' ? 30 : 20);
      cumulativeHours += estimatedHours;

      const resources = db.prepare(`
        SELECT lr.title, lr.provider, lr.url, lr.cost_type as costType, lr.duration_hours as durationHours
        FROM skill_resources sr
        JOIN learning_resources lr ON sr.resource_id = lr.id
        WHERE sr.skill_id = ?
        LIMIT 3
      `).all(gap.skill_id) as any[];

      const projectTask = `Build a functional ${gap.skill_name} module addressing a real-world ${role.title} requirement with unit tests and repository documentation.`;
      const validationMethod = `Automated code review, unit test suite pass rate >= 90%, and peer evaluation of project artifact.`;
      const rationale = `Essential ${gap.priority} priority skill for target role ${role.title}. Ingested demand index: ${gap.demand_score}/100.`;

      const stepId = `step_${pathId}_${stepOrder}`;

      db.prepare(`
        INSERT OR REPLACE INTO career_path_steps (id, career_path_id, step_order, skill_id, rationale, prereq_skill_id, estimated_hours, project_task, validation_method, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NOT_STARTED')
      `).run(stepId, pathId, stepOrder, gap.skill_id, rationale, prereq ? prereq.prereq_id : null, estimatedHours, projectTask, validationMethod);

      steps.push({
        stepOrder,
        skillId: gap.skill_id,
        skillName: gap.skill_name,
        category: gap.category,
        rationale,
        prereqSkillId: prereq ? prereq.prereq_id : undefined,
        prereqSkillName: prereq ? prereq.prereq_name : undefined,
        estimatedHours,
        projectTask,
        validationMethod,
        resources: resources.length > 0 ? resources : [
          { title: `${gap.skill_name} Official Documentation & Developer Guide`, provider: 'Open Docs', url: `https://developer.example.org/${gap.skill_name.toLowerCase()}`, costType: 'FREE', durationHours: 10 },
          { title: `Mastering ${gap.skill_name} for Industry Applications`, provider: 'NPTEL / OpenCourseWare', url: `https://nptel.ac.in/courses/${gap.skill_name.toLowerCase()}`, costType: 'FREE', durationHours: 20 }
        ],
        status: 'NOT_STARTED'
      });
    });

    const totalEstimatedWeeks = Math.max(1, Math.ceil(cumulativeHours / 15));

    return {
      pathId,
      studentId,
      targetRoleId,
      targetRoleTitle: role.title,
      totalSteps: steps.length,
      totalEstimatedHours: cumulativeHours,
      estimatedWeeks: totalEstimatedWeeks,
      steps
    };
  }
}
