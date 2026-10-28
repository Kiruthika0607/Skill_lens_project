-- Schema for Industry Skill Intelligence Platform (SQLite & PostgreSQL Compatible)

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'admin', 'industry')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    college TEXT NOT NULL,
    discipline TEXT NOT NULL,
    graduation_year INTEGER NOT NULL,
    preferred_domain TEXT NOT NULL,
    student_score REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    normalized_name TEXT NOT NULL,
    category TEXT NOT NULL,
    parent_id TEXT,
    demand_score REAL DEFAULT 0.0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_aliases (
    id TEXT PRIMARY KEY,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    alias TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS skill_relationships (
    id TEXT PRIMARY KEY,
    skill_id_a TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    skill_id_b TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    weight REAL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS career_roles (
    id TEXT PRIMARY KEY,
    title TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    baseline_demand_score REAL DEFAULT 50.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS career_role_skills (
    id TEXT PRIMARY KEY,
    role_id TEXT NOT NULL REFERENCES career_roles(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    importance_weight REAL DEFAULT 0.5,
    proficiency_required INTEGER DEFAULT 3,
    is_mandatory INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS career_transitions (
    id TEXT PRIMARY KEY,
    from_role_id TEXT NOT NULL REFERENCES career_roles(id) ON DELETE CASCADE,
    to_role_id TEXT NOT NULL REFERENCES career_roles(id) ON DELETE CASCADE,
    difficulty TEXT DEFAULT 'MEDIUM',
    typical_experience_years INTEGER DEFAULT 2
);

CREATE TABLE IF NOT EXISTS student_skills (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INTEGER NOT NULL CHECK(proficiency_level BETWEEN 1 AND 5),
    source TEXT DEFAULT 'self',
    confidence_score REAL DEFAULT 0.8,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_assessments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    score REAL NOT NULL,
    evidence_notes TEXT,
    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    skills_used TEXT NOT NULL,
    repo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certifications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    issuing_org TEXT NOT NULL,
    skill_id TEXT REFERENCES skills(id) ON DELETE SET NULL,
    verify_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS industries (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    sector TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS industry_skills (
    id TEXT PRIMARY KEY,
    industry_id TEXT NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    weight REAL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    job_code TEXT UNIQUE NOT NULL,
    source TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    employment_type TEXT NOT NULL,
    industry_id TEXT REFERENCES industries(id) ON DELETE SET NULL,
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_url TEXT,
    provenance TEXT NOT NULL DEFAULT 'SYNTHETIC',
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_skills (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    extraction_confidence REAL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS job_sources (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    api_endpoint TEXT,
    status TEXT DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS learning_resources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    url TEXT NOT NULL,
    cost_type TEXT DEFAULT 'FREE',
    difficulty TEXT DEFAULT 'BEGINNER',
    duration_hours INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_resources (
    id TEXT PRIMARY KEY,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    resource_id TEXT NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
    relevance_weight REAL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS career_recommendations (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES career_roles(id) ON DELETE CASCADE,
    composite_score REAL NOT NULL,
    skill_match_score REAL NOT NULL,
    demand_score REAL NOT NULL,
    pref_score REAL NOT NULL,
    edu_score REAL NOT NULL,
    loc_score REAL NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skill_gaps (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES career_roles(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK(status IN ('MATCHED', 'PARTIAL', 'MISSING')),
    priority TEXT NOT NULL CHECK(priority IN ('HIGH', 'MEDIUM', 'LOW')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS career_paths (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    target_role_id TEXT NOT NULL REFERENCES career_roles(id) ON DELETE CASCADE,
    total_steps INTEGER NOT NULL,
    estimated_weeks INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS career_path_steps (
    id TEXT PRIMARY KEY,
    career_path_id TEXT NOT NULL REFERENCES career_paths(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    rationale TEXT NOT NULL,
    prereq_skill_id TEXT REFERENCES skills(id) ON DELETE SET NULL,
    estimated_hours INTEGER NOT NULL,
    project_task TEXT NOT NULL,
    validation_method TEXT NOT NULL,
    status TEXT DEFAULT 'NOT_STARTED' CHECK(status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'))
);

CREATE TABLE IF NOT EXISTS demand_snapshots (
    id TEXT PRIMARY KEY,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    snapshot_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    demand_score REAL NOT NULL,
    job_count INTEGER NOT NULL,
    growth_rate REAL NOT NULL,
    provenance TEXT DEFAULT 'SYNTHETIC'
);

CREATE TABLE IF NOT EXISTS skill_forecasts (
    id TEXT PRIMARY KEY,
    skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    forecast_date TIMESTAMP NOT NULL,
    predicted_demand_score REAL NOT NULL,
    confidence_interval_lower REAL NOT NULL,
    confidence_interval_upper REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_job_matches (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    overall_match_pct REAL NOT NULL,
    skill_match_pct REAL NOT NULL,
    location_match_pct REAL NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_quality_logs (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    issue_type TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'RESOLVED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_provenance ON jobs(provenance);
CREATE INDEX IF NOT EXISTS idx_student_skills_student ON student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_job ON job_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_skill ON job_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_aliases_alias ON skill_aliases(alias);

-- SkillLens Extended Tables
CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('JOB', 'INTERNSHIP', 'SCHOLARSHIP', 'HACKATHON')),
    location TEXT NOT NULL,
    work_mode TEXT NOT NULL CHECK(work_mode IN ('REMOTE', 'HYBRID', 'ON_SITE')),
    deadline TIMESTAMP NOT NULL,
    eligibility TEXT NOT NULL,
    scope TEXT NOT NULL CHECK(scope IN ('NATIONAL', 'INTERNATIONAL')),
    setting TEXT NOT NULL CHECK(setting IN ('ONLINE', 'OFFLINE')),
    source_url TEXT NOT NULL,
    last_verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK(status IN ('VERIFIED', 'PENDING', 'EXPIRED', 'SAMPLE')),
    stipend_or_reward TEXT,
    description TEXT,
    skills_required TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_drafts (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL CHECK(entity_type IN ('SKILL', 'CAREER', 'RESOURCE', 'OPPORTUNITY')),
    title TEXT NOT NULL,
    proposed_changes TEXT NOT NULL,
    confidence_score REAL DEFAULT 0.85,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reasoning TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewer_id TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    actor_id TEXT,
    actor_email TEXT,
    entity TEXT NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    sender TEXT NOT NULL CHECK(sender IN ('USER', 'ASSISTANT')),
    text TEXT NOT NULL,
    verified_facts TEXT,
    suggestions TEXT,
    source_links TEXT,
    is_fallback INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_target_careers (
    student_id TEXT PRIMARY KEY,
    role_id TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_notifications (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO',
    read_status INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

