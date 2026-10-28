import { db } from '../db';
import crypto from 'crypto';

export interface CareerMatchDetail {
  roleId: string;
  roleTitle: string;
  category: string;
  description: string;
  compositeScore: number;
  skillMatchScore: number;
  demandScore: number;
  prefScore: number;
  eduScore: number;
  locScore: number;
  matchedSkills: { skillId: string; skillName: string; proficiency: number }[];
  partialSkills: { skillId: string; skillName: string; current: number; required: number }[];
  missingSkills: { skillId: string; skillName: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; demandScore: number }[];
  compatibilityReason: string;
  confidence: number;
}

export class RecommendationService {
  /**
   * Generates career recommendations for a specific student.
   */
  static getRecommendations(studentId: string): CareerMatchDetail[] {
    const student = db.prepare(`SELECT * FROM students WHERE id = ?`).get(studentId) as any;
    if (!student) throw new Error('Student not found');

    const studentSkills = db.prepare(`
      SELECT ss.skill_id, ss.proficiency_level, s.name as skill_name, s.demand_score
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.student_id = ?
    `).all(studentId) as any[];

    const studentSkillMap = new Map<string, number>();
    studentSkills.forEach(s => studentSkillMap.set(s.skill_id, s.proficiency_level));

    const roles = db.prepare(`SELECT * FROM career_roles`).all() as any[];
    const recommendations: CareerMatchDetail[] = [];

    for (const role of roles) {
      const requiredSkills = db.prepare(`
        SELECT DISTINCT crs.skill_id, crs.importance_weight, crs.proficiency_required, crs.is_mandatory, s.name as skill_name, s.demand_score
        FROM career_role_skills crs
        JOIN skills s ON crs.skill_id = s.id
        WHERE crs.role_id = ?
      `).all(role.id) as any[];

      if (requiredSkills.length === 0) continue;

      let totalWeight = 0;
      let matchedWeight = 0;
      const matchedSkillsList: any[] = [];
      const partialSkillsList: any[] = [];
      const missingSkillsList: any[] = [];

      for (const req of requiredSkills) {
        const weight = req.importance_weight || 0.5;
        totalWeight += weight;

        const currentProf = studentSkillMap.get(req.skill_id) || 0;
        if (currentProf >= req.proficiency_required) {
          matchedWeight += weight;
          matchedSkillsList.push({ skillId: req.skill_id, skillName: req.skill_name, proficiency: currentProf });
        } else if (currentProf > 0) {
          matchedWeight += weight * (currentProf / req.proficiency_required);
          partialSkillsList.push({ skillId: req.skill_id, skillName: req.skill_name, current: currentProf, required: req.proficiency_required });
        } else {
          // Determine Priority
          let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
          if (req.is_mandatory === 1 && req.demand_score >= 50) {
            priority = 'HIGH';
          } else if (req.is_mandatory === 1 || req.demand_score >= 60 || weight >= 0.7) {
            priority = 'MEDIUM';
          }

          missingSkillsList.push({
            skillId: req.skill_id,
            skillName: req.skill_name,
            priority,
            demandScore: req.demand_score
          });
        }
      }

      missingSkillsList.sort((a, b) => {
        const prioOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        if (prioOrder[b.priority] !== prioOrder[a.priority]) {
          return prioOrder[b.priority] - prioOrder[a.priority];
        }
        return b.demandScore - a.demandScore;
      });

      const skillMatchScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

      const roleDemandAvg = requiredSkills.reduce((acc, curr) => acc + (curr.demand_score || 50), 0) / requiredSkills.length;
      const demandScore = Math.round(roleDemandAvg);

      let prefScore = 50;
      if (student.preferred_domain && role.category.toLowerCase().includes(student.preferred_domain.toLowerCase())) {
        prefScore = 95;
      } else if (student.preferred_domain && role.title.toLowerCase().includes(student.preferred_domain.toLowerCase())) {
        prefScore = 90;
      }

      const eduScore = student.discipline.includes('Computer') || student.discipline.includes('Information') || student.discipline.includes('Engineering') ? 90 : 75;
      const locScore = 85;

      const rawComposite = (0.40 * skillMatchScore) + (0.25 * demandScore) + (0.15 * prefScore) + (0.10 * eduScore) + (0.10 * locScore);
      const compositeScore = Math.min(100, Math.round(rawComposite));

      const compatibilityReason = `${role.title} — ${compositeScore}% compatibility based on current technical skills (${skillMatchScore}% match), industry demand index (${demandScore}/100), domain preference (${student.preferred_domain}), and engineering discipline background.`;

      db.prepare(`
        INSERT OR REPLACE INTO career_recommendations (id, student_id, role_id, composite_score, skill_match_score, demand_score, pref_score, edu_score, loc_score, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(`rec_${studentId}_${role.id}`, studentId, role.id, compositeScore, skillMatchScore, demandScore, prefScore, eduScore, locScore);

      missingSkillsList.forEach(m => {
        db.prepare(`
          INSERT OR REPLACE INTO skill_gaps (id, student_id, role_id, skill_id, status, priority, updated_at)
          VALUES (?, ?, ?, ?, 'MISSING', ?, CURRENT_TIMESTAMP)
        `).run(`gap_${studentId}_${role.id}_${m.skillId}`, studentId, role.id, m.skillId, m.priority);
      });

      partialSkillsList.forEach(p => {
        db.prepare(`
          INSERT OR REPLACE INTO skill_gaps (id, student_id, role_id, skill_id, status, priority, updated_at)
          VALUES (?, ?, ?, ?, 'PARTIAL', 'MEDIUM', CURRENT_TIMESTAMP)
        `).run(`gap_${studentId}_${role.id}_${p.skillId}`, studentId, role.id, p.skillId);
      });

      matchedSkillsList.forEach(m => {
        db.prepare(`
          INSERT OR REPLACE INTO skill_gaps (id, student_id, role_id, skill_id, status, priority, updated_at)
          VALUES (?, ?, ?, ?, 'MATCHED', 'LOW', CURRENT_TIMESTAMP)
        `).run(`gap_${studentId}_${role.id}_${m.skillId}`, studentId, role.id, m.skillId);
      });

      recommendations.push({
        roleId: role.id,
        roleTitle: role.title,
        category: role.category,
        description: role.description,
        compositeScore,
        skillMatchScore,
        demandScore,
        prefScore,
        eduScore,
        locScore,
        matchedSkills: matchedSkillsList,
        partialSkills: partialSkillsList,
        missingSkills: missingSkillsList,
        compatibilityReason,
        confidence: 0.92
      });
    }

    return recommendations.sort((a, b) => b.compositeScore - a.compositeScore);
  }
}
