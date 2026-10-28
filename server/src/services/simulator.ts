import { db } from '../db';
import { RecommendationService, CareerMatchDetail } from './recommendation';

export interface SimulationResult {
  addedSkillIds: string[];
  addedSkillNames: string[];
  originalRecommendations: CareerMatchDetail[];
  simulatedRecommendations: CareerMatchDetail[];
  roleDeltas: {
    roleId: string;
    roleTitle: string;
    oldScore: number;
    newScore: number;
    scoreDelta: number;
    isNewlyUnlocked: boolean;
    remainingGapsCount: number;
  }[];
  unlockedRoleTitles: string[];
  maxScoreGainRole: string;
  maxScoreGainDelta: number;
}

export class SimulatorService {
  /**
   * Runs a hypothetical "What-If" skill simulation for a student.
   */
  static simulateSkillAcquisition(studentId: string, hypotheticalSkillIds: string[]): SimulationResult {
    // 1. Get baseline recommendations
    const baseline = RecommendationService.getRecommendations(studentId);

    // 2. Fetch existing student skills to restore later
    const originalSkills = db.prepare(`SELECT skill_id, proficiency_level FROM student_skills WHERE student_id = ?`).all(studentId) as any[];

    try {
      // 3. Temporarily inject hypothetical skills into student_skills table
      for (const skillId of hypotheticalSkillIds) {
        db.prepare(`
          INSERT INTO student_skills (id, student_id, skill_id, proficiency_level, source, confidence_score)
          VALUES (?, ?, ?, 4, 'simulated', 1.0)
          ON CONFLICT(id) DO UPDATE SET proficiency_level = 4
        `).run(`sim_${studentId}_${skillId}`, studentId, skillId);
      }

      // 4. Recalculate simulated recommendations
      const simulated = RecommendationService.getRecommendations(studentId);

      // 5. Build comparative deltas
      const baselineMap = new Map<string, CareerMatchDetail>();
      baseline.forEach(b => baselineMap.set(b.roleId, b));

      const roleDeltas: SimulationResult['roleDeltas'] = [];
      const unlockedRoleTitles: string[] = [];
      let maxDelta = -1;
      let maxRole = '';

      for (const sim of simulated) {
        const base = baselineMap.get(sim.roleId);
        const oldScore = base ? base.compositeScore : 0;
        const newScore = sim.compositeScore;
        const scoreDelta = newScore - oldScore;

        const isNewlyUnlocked = oldScore < 70 && newScore >= 70;
        if (isNewlyUnlocked) {
          unlockedRoleTitles.push(sim.roleTitle);
        }

        if (scoreDelta > maxDelta) {
          maxDelta = scoreDelta;
          maxRole = sim.roleTitle;
        }

        roleDeltas.push({
          roleId: sim.roleId,
          roleTitle: sim.roleTitle,
          oldScore,
          newScore,
          scoreDelta,
          isNewlyUnlocked,
          remainingGapsCount: sim.missingSkills.length
        });
      }

      const addedSkills = db.prepare(`
        SELECT id, name FROM skills WHERE id IN (${hypotheticalSkillIds.map(() => '?').join(',')})
      `).all(...hypotheticalSkillIds) as any[];

      return {
        addedSkillIds: hypotheticalSkillIds,
        addedSkillNames: addedSkills.map(s => s.name),
        originalRecommendations: baseline,
        simulatedRecommendations: simulated,
        roleDeltas: roleDeltas.sort((a, b) => b.scoreDelta - a.scoreDelta),
        unlockedRoleTitles,
        maxScoreGainRole: maxRole,
        maxScoreGainDelta: Math.max(0, maxDelta)
      };
    } finally {
      // 6. Cleanup temporary simulated skills
      db.prepare(`DELETE FROM student_skills WHERE student_id = ? AND source = 'simulated'`).run(studentId);
      // Re-run baseline to keep DB consistent
      RecommendationService.getRecommendations(studentId);
    }
  }
}
