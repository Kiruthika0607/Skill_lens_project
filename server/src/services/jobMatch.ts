import { db } from '../db';

export interface StudentJobMatchResult {
  jobId: string;
  jobCode: string;
  title: string;
  company: string;
  location: string;
  experienceLevel: string;
  employmentType: string;
  industryName: string;
  provenance: string;
  overallMatchPct: number;
  skillMatchPct: number;
  locationMatchPct: number;
  matchedSkills: string[];
  missingSkills: { skillId: string; skillName: string }[];
  postedDate: string;
  sourceUrl?: string;
}

export class JobMatchService {
  /**
   * Matches all open jobs against a student's skill profile.
   */
  static getJobMatches(studentId: string): StudentJobMatchResult[] {
    const student = db.prepare(`SELECT * FROM students WHERE id = ?`).get(studentId) as any;
    if (!student) throw new Error('Student not found');

    const studentSkills = db.prepare(`
      SELECT ss.skill_id, s.name as skill_name
      FROM student_skills ss
      JOIN skills s ON ss.skill_id = s.id
      WHERE ss.student_id = ?
    `).all(studentId) as any[];

    const studentSkillSet = new Set(studentSkills.map(s => s.skill_id));

    const jobs = db.prepare(`
      SELECT j.*, i.name as industry_name
      FROM jobs j
      LEFT JOIN industries i ON j.industry_id = i.id
      ORDER BY j.posted_date DESC
    `).all() as any[];

    const results: StudentJobMatchResult[] = [];

    for (const job of jobs) {
      const jobSkills = db.prepare(`
        SELECT js.skill_id, s.name as skill_name
        FROM job_skills js
        JOIN skills s ON js.skill_id = s.id
        WHERE js.job_id = ?
      `).all(job.id) as any[];

      if (jobSkills.length === 0) continue;

      const matchedSkills: string[] = [];
      const missingSkills: { skillId: string; skillName: string }[] = [];

      jobSkills.forEach(js => {
        if (studentSkillSet.has(js.skill_id)) {
          matchedSkills.push(js.skill_name);
        } else {
          missingSkills.push({ skillId: js.skill_id, skillName: js.skill_name });
        }
      });

      const skillMatchPct = Math.round((matchedSkills.length / jobSkills.length) * 100);
      const locationMatchPct = (job.location.includes('Chennai') || job.location.includes('Coimbatore') || job.location.includes('Bengaluru') || job.location.includes('Remote')) ? 90 : 70;
      const overallMatchPct = Math.round(0.70 * skillMatchPct + 0.30 * locationMatchPct);

      db.prepare(`
        INSERT OR REPLACE INTO student_job_matches (id, student_id, job_id, overall_match_pct, skill_match_pct, location_match_pct, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(`jm_${studentId}_${job.id}`, studentId, job.id, overallMatchPct, skillMatchPct, locationMatchPct);

      results.push({
        jobId: job.id,
        jobCode: job.job_code,
        title: job.title,
        company: job.company,
        location: job.location,
        experienceLevel: job.experience_level,
        employmentType: job.employment_type,
        industryName: job.industry_name || 'General Engineering',
        provenance: job.provenance,
        overallMatchPct,
        skillMatchPct,
        locationMatchPct,
        matchedSkills,
        missingSkills,
        postedDate: job.posted_date,
        sourceUrl: job.source_url
      });
    }

    return results.sort((a, b) => b.overallMatchPct - a.overallMatchPct);
  }
}
