import { Router, Request, Response } from 'express';
import { db } from '../db';
import crypto from 'crypto';
import { TaxonomyService } from '../services/taxonomy';
import { DemandService } from '../services/demand';

const router = Router();

// GET /api/jobs/stats
router.get('/stats', (req: Request, res: Response) => {
  const totalJobs = db.prepare(`SELECT COUNT(*) as count FROM jobs`).get() as any;
  const provenanceBreakdown = db.prepare(`
    SELECT provenance, COUNT(*) as count FROM jobs GROUP BY provenance
  `).all();
  const industryBreakdown = db.prepare(`
    SELECT i.name, COUNT(j.id) as count
    FROM jobs j
    LEFT JOIN industries i ON j.industry_id = i.id
    GROUP BY j.industry_id
    ORDER BY count DESC
  `).all();

  return res.json({
    totalJobs: totalJobs.count,
    provenanceBreakdown,
    industryBreakdown
  });
});

// GET /api/jobs
router.get('/', (req: Request, res: Response) => {
  const { page = '1', limit = '10', search, industry, provenance } = req.query;
  const p = parseInt(page as string);
  const l = parseInt(limit as string);
  const offset = (p - 1) * l;

  let query = `
    SELECT j.*, i.name as industry_name
    FROM jobs j
    LEFT JOIN industries i ON j.industry_id = i.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (search) {
    query += ` AND (j.title LIKE ? OR j.company LIKE ? OR j.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (industry) {
    query += ` AND j.industry_id = ?`;
    params.push(industry);
  }
  if (provenance) {
    query += ` AND j.provenance = ?`;
    params.push(provenance);
  }

  query += ` ORDER BY j.posted_date DESC LIMIT ? OFFSET ?`;
  params.push(l, offset);

  const jobs = db.prepare(query).all(...params) as any[];

  // Attach skills to each job
  for (const job of jobs) {
    const jobSkills = db.prepare(`
      SELECT s.id, s.name, s.category
      FROM job_skills js
      JOIN skills s ON js.skill_id = s.id
      WHERE js.job_id = ?
    `).all(job.id);
    job.skills = jobSkills;
  }

  const countRow = db.prepare(`SELECT COUNT(*) as count FROM jobs`).get() as any;

  return res.json({
    jobs,
    pagination: {
      page: p,
      limit: l,
      total: countRow.count,
      totalPages: Math.ceil(countRow.count / l)
    }
  });
});

// POST /api/jobs/import
router.post('/import', (req: Request, res: Response) => {
  const { jobs } = req.body;
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return res.status(400).json({ error: 'Payload must contain a non-empty array of job objects.' });
  }

  let importedCount = 0;
  const insertJob = db.prepare(`
    INSERT INTO jobs (id, job_code, source, title, company, location, description, experience_level, employment_type, industry_id, posted_date, source_url, provenance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
  `);

  for (const item of jobs) {
    const jobId = `job_${crypto.randomUUID()}`;
    const jobCode = item.job_code || `JOB-${Math.floor(100000 + Math.random() * 900000)}`;

    insertJob.run(
      jobId,
      jobCode,
      item.source || 'MANUAL_IMPORT',
      item.title,
      item.company,
      item.location || 'Chennai, India',
      item.description || item.title,
      item.experience_level || '0-2 years',
      item.employment_type || 'Full-time',
      item.industry_id || null,
      item.source_url || null,
      item.provenance || 'MANUAL_IMPORT'
    );

    // Extract skills if provided
    if (Array.isArray(item.skills)) {
      for (const skillText of item.skills) {
        const norm = TaxonomyService.normalizeSkill(skillText);
        if (norm) {
          db.prepare(`
            INSERT OR IGNORE INTO job_skills (id, job_id, skill_id, extraction_confidence)
            VALUES (?, ?, ?, ?)
          `).run(`js_${crypto.randomUUID()}`, jobId, norm.skillId, norm.confidence);
        }
      }
    }
    importedCount++;
  }

  // Recalculate demand scores after import
  DemandService.calculateDemandScores();

  return res.status(201).json({
    message: `Successfully imported ${importedCount} job listings.`,
    importedCount
  });
});

// POST /api/jobs/reprocess
router.post('/reprocess', (req: Request, res: Response) => {
  DemandService.calculateDemandScores();
  return res.json({ message: 'Job pipeline reprocessed and demand metrics updated successfully.' });
});

export default router;
