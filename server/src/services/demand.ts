import { db } from '../db';
import crypto from 'crypto';

export interface SkillDemandMetrics {
  skillId: string;
  skillName: string;
  category: string;
  jobCount: number;
  frequencyScore: number;
  growthRatePct: number;
  growthScore: number;
  industrySpreadCount: number;
  industrySpreadScore: number;
  geoSpreadCount: number;
  geoSpreadScore: number;
  demandScore: number;
  provenance: string;
}

export class DemandService {
  /**
   * Re-evaluates industry demand for all skills across the database.
   */
  static calculateDemandScores(): SkillDemandMetrics[] {
    const totalJobsRow = db.prepare(`SELECT COUNT(*) as count FROM jobs`).get() as { count: number };
    const totalJobs = totalJobsRow.count || 1;

    const skills = db.prepare(`SELECT * FROM skills`).all() as any[];
    const metricsList: SkillDemandMetrics[] = [];

    for (const skill of skills) {
      // 1. Job frequency
      const freqRow = db.prepare(`
        SELECT COUNT(DISTINCT j.id) as jobCount
        FROM job_skills js
        JOIN jobs j ON js.job_id = j.id
        WHERE js.skill_id = ?
      `).get(skill.id) as { jobCount: number };

      const jobCount = freqRow.jobCount || 0;
      const jobFreqRatio = jobCount / totalJobs;
      const frequencyScore = Math.min(100, Math.round(jobFreqRatio * 400)); // Scaled 0-100

      // 2. Growth rate (comparison across historical datasets/snapshots)
      const snapshots = db.prepare(`
        SELECT demand_score, job_count FROM demand_snapshots 
        WHERE skill_id = ? ORDER BY snapshot_date DESC LIMIT 2
      `).all(skill.id) as any[];

      let growthRatePct = 5.0; // Default baseline growth rate
      if (snapshots.length >= 2) {
        const current = snapshots[0].job_count;
        const previous = snapshots[1].job_count || 1;
        growthRatePct = ((current - previous) / previous) * 100;
      }
      const growthScore = Math.min(100, Math.max(0, Math.round(50 + growthRatePct * 2)));

      // 3. Industry Spread (Cross-industry coverage)
      const indRow = db.prepare(`
        SELECT COUNT(DISTINCT j.industry_id) as indCount
        FROM job_skills js
        JOIN jobs j ON js.job_id = j.id
        WHERE js.skill_id = ? AND j.industry_id IS NOT NULL
      `).get(skill.id) as { indCount: number };
      const indCount = indRow.indCount || 1;
      const industrySpreadScore = Math.min(100, indCount * 20);

      // 4. Geo Spread (Location diversity)
      const geoRow = db.prepare(`
        SELECT COUNT(DISTINCT j.location) as geoCount
        FROM job_skills js
        JOIN jobs j ON js.job_id = j.id
        WHERE js.skill_id = ?
      `).get(skill.id) as { geoCount: number };
      const geoCount = geoRow.geoCount || 1;
      const geoSpreadScore = Math.min(100, geoCount * 15);

      // Composite Demand Score = 0.40 * Freq + 0.30 * Growth + 0.15 * IndSpread + 0.15 * GeoSpread
      const rawDemandScore = (0.40 * frequencyScore) + (0.30 * growthScore) + (0.15 * industrySpreadScore) + (0.15 * geoSpreadScore);
      const demandScore = Math.min(100, Math.max(5, Math.round(rawDemandScore)));

      // Update skill record
      db.prepare(`UPDATE skills SET demand_score = ? WHERE id = ?`).run(demandScore, skill.id);

      // Record demand snapshot
      db.prepare(`
        INSERT INTO demand_snapshots (id, skill_id, demand_score, job_count, growth_rate, provenance)
        VALUES (?, ?, ?, ?, ?, 'SYNTHETIC')
      `).run(`snap_${crypto.randomUUID()}`, skill.id, demandScore, jobCount, growthRatePct);

      metricsList.push({
        skillId: skill.id,
        skillName: skill.name,
        category: skill.category,
        jobCount,
        frequencyScore,
        growthRatePct: Math.round(growthRatePct * 10) / 10,
        growthScore,
        industrySpreadCount: indCount,
        industrySpreadScore,
        geoSpreadCount: geoCount,
        geoSpreadScore,
        demandScore,
        provenance: 'SYNTHETIC'
      });
    }

    return metricsList.sort((a, b) => b.demandScore - a.demandScore);
  }
}
