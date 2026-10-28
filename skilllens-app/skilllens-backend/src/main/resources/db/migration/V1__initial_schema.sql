-- SkillLens Database Schema V1
-- Covers all core modules: Auth, Student, Skills, Assessments, Career, Resumes, Resources, Roadmaps, Trends, Opportunities, Chat, Notifications, and Audit.

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(72) NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    password_reset_token VARCHAR(128) NULL,
    password_reset_token_expiry TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    replaced_by_token VARCHAR(64) NULL,
    INDEX idx_rt_user (user_id),
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    phone VARCHAR(20) NULL,
    bio TEXT NULL,
    avatar_url VARCHAR(512) NULL,
    institution VARCHAR(255) NULL,
    degree VARCHAR(100) NULL,
    department VARCHAR(200) NULL,
    graduation_year INT NULL,
    gpa DECIMAL(4,2) NULL,
    gpa_scale DECIMAL(4,2) NULL,
    preferred_career_role VARCHAR(200) NULL,
    preferred_locations TEXT NULL,
    open_to_remote BOOLEAN NULL,
    years_of_experience INT NULL,
    linkedin_url VARCHAR(512) NULL,
    github_url VARCHAR(512) NULL,
    portfolio_url VARCHAR(512) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sp_user (user_id),
    CONSTRAINT fk_sp_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Skill Categories
CREATE TABLE IF NOT EXISTS skill_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Skills Catalog
CREATE TABLE IF NOT EXISTS skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(1000) NULL,
    category_id BIGINT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    tags VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_skill_name (name),
    INDEX idx_skill_category (category_id),
    CONSTRAINT fk_skill_category FOREIGN KEY (category_id) REFERENCES skill_categories (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Student Skills
CREATE TABLE IF NOT EXISTS student_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    self_reported_proficiency INT NULL,
    assessed_proficiency INT NULL,
    last_assessed_at TIMESTAMP NULL,
    notes VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_ss_user_skill (user_id, skill_id),
    INDEX idx_ss_user (user_id),
    CONSTRAINT fk_ss_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_ss_skill FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Assessments
CREATE TABLE IF NOT EXISTS assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    skill_id BIGINT NULL,
    difficulty VARCHAR(20) NULL,
    time_limit_minutes INT NULL,
    passing_score INT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_assessment_skill (skill_id),
    CONSTRAINT fk_assessment_skill FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Assessment Questions
CREATE TABLE IF NOT EXISTS assessment_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(30) NULL,
    points INT NOT NULL DEFAULT 1,
    order_index INT NOT NULL DEFAULT 0,
    INDEX idx_aq_assessment (assessment_id),
    CONSTRAINT fk_aq_assessment FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Assessment Options
CREATE TABLE IF NOT EXISTS assessment_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT NOT NULL DEFAULT 0,
    INDEX idx_ao_question (question_id),
    CONSTRAINT fk_ao_question FOREIGN KEY (question_id) REFERENCES assessment_questions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Assessment Attempts
CREATE TABLE IF NOT EXISTS assessment_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    assessment_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    started_at TIMESTAMP NULL,
    submitted_at TIMESTAMP NULL,
    score INT NULL,
    max_score INT NULL,
    passed BOOLEAN NULL,
    assessed_proficiency INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_attempt_user (user_id),
    INDEX idx_attempt_assessment (assessment_id),
    CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_attempt_assessment FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Assessment Answers
CREATE TABLE IF NOT EXISTS assessment_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_option_ids TEXT NULL,
    INDEX idx_aa_attempt (attempt_id),
    CONSTRAINT fk_aa_attempt FOREIGN KEY (attempt_id) REFERENCES assessment_attempts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Career Roles
CREATE TABLE IF NOT EXISTS career_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    industry VARCHAR(100) NULL,
    avg_salary_range VARCHAR(100) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Career Required Skills
CREATE TABLE IF NOT EXISTS career_required_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    career_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    min_proficiency INT NOT NULL,
    weight DOUBLE NOT NULL DEFAULT 1.0,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_crs_career (career_id),
    INDEX idx_crs_skill (skill_id),
    CONSTRAINT fk_crs_career FOREIGN KEY (career_id) REFERENCES career_roles (id) ON DELETE CASCADE,
    CONSTRAINT fk_crs_skill FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Career Recommendations
CREATE TABLE IF NOT EXISTS career_recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    career_id BIGINT NOT NULL,
    match_score DOUBLE NOT NULL,
    matched_skill_count INT NOT NULL,
    total_required_skills INT NOT NULL,
    explanation TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cr_user (user_id),
    CONSTRAINT fk_cr_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_cr_career FOREIGN KEY (career_id) REFERENCES career_roles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Resumes
CREATE TABLE IF NOT EXISTS resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'UPLOADED',
    extracted_text LONGTEXT NULL,
    parsed_skills_json LONGTEXT NULL,
    parsed_education_json TEXT NULL,
    parsed_experience_json TEXT NULL,
    error_message VARCHAR(1000) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_resume_user (user_id),
    CONSTRAINT fk_resume_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Learning Resources
CREATE TABLE IF NOT EXISTS learning_resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    url VARCHAR(1024) NOT NULL,
    provider VARCHAR(100) NULL,
    resource_type VARCHAR(30) NOT NULL,
    cost_type VARCHAR(20) NOT NULL DEFAULT 'FREE',
    difficulty_level VARCHAR(30) NOT NULL DEFAULT 'BEGINNER',
    estimated_duration_hours INT NULL,
    rating DOUBLE NULL DEFAULT 4.5,
    rating_count INT NULL DEFAULT 0,
    skill_id BIGINT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_lr_skill (skill_id),
    INDEX idx_lr_type (resource_type),
    INDEX idx_lr_cost (cost_type),
    CONSTRAINT fk_lr_skill FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16b. Saved Learning Resources
CREATE TABLE IF NOT EXISTS saved_resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    progress_percent INT NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    UNIQUE KEY uq_sr_user_resource (user_id, resource_id),
    INDEX idx_sr_user (user_id),
    CONSTRAINT fk_sr_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_sr_resource FOREIGN KEY (resource_id) REFERENCES learning_resources (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Roadmaps
CREATE TABLE IF NOT EXISTS roadmaps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    career_role_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    total_milestones INT NOT NULL DEFAULT 0,
    completed_milestones INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rm_user (user_id),
    INDEX idx_rm_career (career_role_id),
    CONSTRAINT fk_rm_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_rm_career FOREIGN KEY (career_role_id) REFERENCES career_roles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Roadmap Milestones
CREATE TABLE IF NOT EXISTS roadmap_milestones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id BIGINT NOT NULL,
    milestone_order INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    skill_id BIGINT NULL,
    target_proficiency INT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED',
    estimated_weeks INT NULL DEFAULT 2,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rmm_roadmap (roadmap_id),
    INDEX idx_rmm_skill (skill_id),
    CONSTRAINT fk_rmm_roadmap FOREIGN KEY (roadmap_id) REFERENCES roadmaps (id) ON DELETE CASCADE,
    CONSTRAINT fk_rmm_skill FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Industry Skill Trends
CREATE TABLE IF NOT EXISTS industry_skill_trends (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id BIGINT NOT NULL,
    industry_sector VARCHAR(100) NOT NULL,
    demand_score DOUBLE NOT NULL,
    growth_rate_percent DOUBLE NOT NULL,
    average_salary_min INT NULL,
    average_salary_max INT NULL,
    job_postings_count INT NULL,
    top_locations VARCHAR(500) NULL,
    trend_year INT NOT NULL,
    trend_quarter VARCHAR(10) NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ist_skill (skill_id),
    INDEX idx_ist_sector (industry_sector),
    CONSTRAINT fk_ist_skill FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    opportunity_type VARCHAR(30) NOT NULL,
    location VARCHAR(255) NULL,
    is_remote BOOLEAN NOT NULL DEFAULT FALSE,
    employment_type VARCHAR(50) NULL,
    experience_level VARCHAR(50) NULL,
    salary_min INT NULL,
    salary_max INT NULL,
    stipend VARCHAR(100) NULL,
    application_url VARCHAR(1024) NOT NULL,
    deadline TIMESTAMP NULL,
    description TEXT NULL,
    requirements_text TEXT NULL,
    source VARCHAR(100) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_opp_type (opportunity_type),
    INDEX idx_opp_deadline (deadline),
    INDEX idx_opp_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Opportunity Skills
CREATE TABLE IF NOT EXISTS opportunity_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    min_proficiency INT NULL DEFAULT 1,
    INDEX idx_opp_skill_opp (opportunity_id),
    INDEX idx_opp_skill_skill (skill_id),
    CONSTRAINT fk_os_opportunity FOREIGN KEY (opportunity_id) REFERENCES opportunities (id) ON DELETE CASCADE,
    CONSTRAINT fk_os_skill FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Saved Opportunities
CREATE TABLE IF NOT EXISTS saved_opportunities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    opportunity_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SAVED',
    notes VARCHAR(1000) NULL,
    saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    applied_at TIMESTAMP NULL,
    UNIQUE KEY uq_so_user_opp (user_id, opportunity_id),
    INDEX idx_so_user (user_id),
    CONSTRAINT fk_so_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_so_opp FOREIGN KEY (opportunity_id) REFERENCES opportunities (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. Chat Conversations
CREATE TABLE IF NOT EXISTS chat_conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cc_user (user_id),
    CONSTRAINT fk_cc_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    content LONGTEXT NOT NULL,
    token_count INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cm_conv (conversation_id),
    CONSTRAINT fk_cm_conv FOREIGN KEY (conversation_id) REFERENCES chat_conversations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(30) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(512) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (is_read),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    user_email VARCHAR(255) NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NULL,
    resource_id VARCHAR(100) NULL,
    ip_address VARCHAR(50) NULL,
    user_agent VARCHAR(500) NULL,
    details TEXT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_time (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
