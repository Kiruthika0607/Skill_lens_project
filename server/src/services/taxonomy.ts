import { db } from '../db';
import crypto from 'crypto';

export interface NormalizedSkillResult {
  skillId: string;
  skillName: string;
  normalizedName: string;
  category: string;
  confidence: number;
}

export class TaxonomyService {
  /**
   * Normalizes an incoming skill string variant into a canonical skill taxonomy entry.
   */
  static normalizeSkill(rawSkill: string): NormalizedSkillResult | null {
    const cleaned = rawSkill.trim().toLowerCase().replace(/[\._\-]/g, '');

    // 1. Direct alias check
    const aliasStmt = db.prepare(`
      SELECT s.id as skillId, s.name as skillName, s.normalized_name as normalizedName, s.category
      FROM skill_aliases sa
      JOIN skills s ON sa.skill_id = s.id
      WHERE LOWER(REPLACE(REPLACE(REPLACE(sa.alias, '.', ''), '_', ''), '-', '')) = ?
    `);
    const aliasMatch = aliasStmt.get(cleaned) as any;
    if (aliasMatch) {
      return { ...aliasMatch, confidence: 1.0 };
    }

    // 2. Direct name/normalized_name check
    const nameStmt = db.prepare(`
      SELECT id as skillId, name as skillName, normalized_name as normalizedName, category
      FROM skills
      WHERE LOWER(REPLACE(REPLACE(REPLACE(normalized_name, '.', ''), '_', ''), '-', '')) = ?
         OR LOWER(REPLACE(REPLACE(REPLACE(name, '.', ''), '_', ''), '-', '')) = ?
    `);
    const nameMatch = nameStmt.get(cleaned, cleaned) as any;
    if (nameMatch) {
      return { ...nameMatch, confidence: 0.95 };
    }

    // 3. Partial / Substring fuzzy check
    const allSkills = db.prepare(`SELECT id as skillId, name as skillName, normalized_name as normalizedName, category FROM skills`).all() as any[];
    for (const skill of allSkills) {
      const norm = skill.normalizedName.toLowerCase();
      if (cleaned.includes(norm) || norm.includes(cleaned)) {
        return { ...skill, confidence: 0.80 };
      }
    }

    return null;
  }

  /**
   * Registers a new alias for a target skill.
   */
  static addAlias(skillId: string, alias: string): void {
    const id = `alias_${crypto.randomUUID()}`;
    const stmt = db.prepare(`INSERT OR IGNORE INTO skill_aliases (id, skill_id, alias) VALUES (?, ?, ?)`);
    stmt.run(id, skillId, alias);
  }

  /**
   * Fetches full skill taxonomy tree with parent-child & related relationships.
   */
  static getTaxonomy() {
    const skills = db.prepare(`SELECT * FROM skills ORDER BY category, name`).all();
    const aliases = db.prepare(`SELECT * FROM skill_aliases`).all();
    const relationships = db.prepare(`SELECT * FROM skill_relationships`).all();
    return { skills, aliases, relationships };
  }
}
