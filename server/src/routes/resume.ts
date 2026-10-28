import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// POST /api/resume/analyze
router.post('/analyze', (req: Request, res: Response) => {
  try {
    const { resumeText, targetRoleId } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text or file content is required.' });
    }

    const textUpper = resumeText.toUpperCase();

    // Fetch all taxonomy skills to scan for matches
    const allSkills = db.prepare(`SELECT id, name, category, demand_score FROM skills`).all() as any[];

    const matchedSkills: any[] = [];
    const missingSkills: any[] = [];

    for (const sk of allSkills) {
      if (textUpper.includes(sk.name.toUpperCase())) {
        matchedSkills.push(sk);
      } else {
        missingSkills.push(sk);
      }
    }

    // Calculate ATS Score based on keyword density & sections
    const hasEducation = textUpper.includes('EDUCATION') || textUpper.includes('COLLEGE') || textUpper.includes('UNIVERSITY');
    const hasProjects = textUpper.includes('PROJECT') || textUpper.includes('BUILT') || textUpper.includes('GITHUB');
    const hasExperience = textUpper.includes('INTERNSHIP') || textUpper.includes('EXPERIENCE') || textUpper.includes('WORK');
    const hasCertifications = textUpper.includes('CERTIFICATION') || textUpper.includes('CERTIFIED') || textUpper.includes('NPTEL');

    let sectionScore = 0;
    if (hasEducation) sectionScore += 25;
    if (hasProjects) sectionScore += 25;
    if (hasExperience) sectionScore += 25;
    if (hasCertifications) sectionScore += 25;

    const skillScore = Math.min(100, Math.round((matchedSkills.length / Math.max(1, allSkills.length)) * 400));
    const atsScore = Math.round(0.6 * skillScore + 0.4 * sectionScore);

    const recommendations: string[] = [];
    if (!hasProjects) recommendations.push('Add a dedicated Projects section with GitHub repository links.');
    if (!hasCertifications) recommendations.push('Include verifiable certifications (e.g. NPTEL, AWS, Google Cloud).');
    if (missingSkills.length > 0) {
      recommendations.push(`Include high-demand keywords: ${missingSkills.slice(0, 4).map(s => s.name).join(', ')}.`);
    }
    recommendations.push('Use strong action verbs (e.g. "Architected", "Optimized", "Deployed") for impact.');

    return res.json({
      atsScore: Math.max(45, Math.min(98, atsScore)),
      sectionScores: {
        skillsScore: skillScore,
        sectionCompleteness: sectionScore
      },
      matchedSkillsCount: matchedSkills.length,
      matchedSkills: matchedSkills.map(s => s.name),
      missingKeywords: missingSkills.slice(0, 6).map(s => s.name),
      recommendations
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
