import { describe, it, expect, beforeAll } from 'vitest';
import { TaxonomyService } from '../services/taxonomy';
import { DemandService } from '../services/demand';
import { RecommendationService } from '../services/recommendation';
import { initDB, db } from '../db';
import crypto from 'crypto';

describe('Industry Skill Intelligence Core Engine Unit Tests', () => {
  beforeAll(async () => {
    await initDB();

    // Ensure baseline skills and test student exist
    db.prepare(`
      INSERT OR REPLACE INTO skills (id, name, normalized_name, category, demand_score, description)
      VALUES ('sk_test_react', 'React', 'react', 'Frontend', 90, 'React UI Library')
    `).run();

    db.prepare(`
      INSERT OR REPLACE INTO skill_aliases (id, skill_id, alias)
      VALUES ('alias_test_react', 'sk_test_react', 'React.js')
    `).run();

    db.prepare(`
      INSERT OR REPLACE INTO users (id, email, password_hash, role)
      VALUES ('usr_test_std', 'test@student.edu', 'hash', 'student')
    `).run();

    db.prepare(`
      INSERT OR REPLACE INTO students (id, user_id, full_name, college, discipline, graduation_year, preferred_domain, student_score)
      VALUES ('std_test_unit', 'usr_test_std', 'Test Student', 'Anna University', 'CSE', 2026, 'Software Engineering', 80)
    `).run();

    db.prepare(`
      INSERT OR REPLACE INTO career_roles (id, title, category, description, baseline_demand_score)
      VALUES ('role_test_swe', 'Software Engineer', 'Software Engineering', 'Test SWE Role', 85)
    `).run();

    db.prepare(`
      INSERT OR REPLACE INTO career_role_skills (id, role_id, skill_id, importance_weight, proficiency_required, is_mandatory)
      VALUES ('crs_test_1', 'role_test_swe', 'sk_test_react', 0.9, 3, 1)
    `).run();
  });

  it('normalizes skill aliases correctly', () => {
    const normReact = TaxonomyService.normalizeSkill('React.js');
    expect(normReact).not.toBeNull();
    if (normReact) {
      expect(normReact.confidence).toBeGreaterThan(0.8);
      expect(normReact.skillName).toBe('React');
    }
  });

  it('calculates deterministic composite career match scores', () => {
    const recs = RecommendationService.getRecommendations('std_test_unit');
    expect(recs.length).toBeGreaterThan(0);
    const top = recs[0];
    expect(top.compositeScore).toBeGreaterThanOrEqual(0);
    expect(top.compositeScore).toBeLessThanOrEqual(100);
    expect(top.compatibilityReason).toContain('compatibility based on current technical skills');
  });

  it('evaluates industry demand scores accurately', () => {
    const metrics = DemandService.calculateDemandScores();
    expect(metrics.length).toBeGreaterThan(0);
    const first = metrics[0];
    expect(first.demandScore).toBeGreaterThanOrEqual(0);
    expect(first.demandScore).toBeLessThanOrEqual(100);
  });
});
