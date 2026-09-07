# SkillLens: Industry-Skill Demand Aggregator & Automated Career Path Mapping

## Executive System Overview (Section A)
**SkillLens** is an end-to-end career intelligence and skill gap aggregation platform designed specifically for engineering graduates and students. It bridges the gap between dynamic industry hiring demands and academic preparedness through deterministic, explainable algorithms rather than opaque AI hallucinations.

### Tech Stack Constraints & Architecture
- **Frontend**: React.js (Single-Page Application with modular component architecture, responsive modern dashboard, client-side routing, interactive charts and analytics)
- **Backend**: Java 17 + Spring Boot 3.x (Layered Monolithic Architecture: Controller → Service → Repository → Entity, Spring Security with JWT, validation, exception handling)
- **Database**: MySQL 8.0 (Relational schema with foreign keys, indexes, unique constraints, and check constraints)
- **Strict Prohibition Adherence**: Zero microservices, zero Node.js backend, zero Python, zero NoSQL/MongoDB/Postgres, zero Docker/Kubernetes, zero fake AI models. All recommendations are computed deterministically from verified MySQL data.

---

## High-Level System Architecture (Section B)

```
+-----------------------------------------------------------------------+
|                           REACT.JS FRONTEND                           |
|  [Student Portal: 22 Views]       |    [Admin Management: 18 Views]   |
|  - Skill Gap & Roadmap UI         |    - Taxonomy & Ingestion Panel   |
|  - Job & Trend Explorer           |    - Analytics & System Monitor   |
+-----------------------------------+-----------------------------------+
                                    |
                            HTTP / REST (JSON)
                      JWT Bearer Token Authentication
                                    v
+-----------------------------------------------------------------------+
|                       SPRING BOOT MONOLITHIC API                      |
|                                                                       |
|  [Presentation Layer]                                                 |
|    AuthController | StudentController | CareerController | ...        |
|                                                                       |
|  [Security & Middleware]                                              |
|    JwtAuthenticationFilter | Role-Based Access Control (STUDENT/ADMIN)|
|    GlobalExceptionHandler (Standardized API Error Format)             |
|                                                                       |
|  [Service / Business Layer]                                           |
|    - SkillExtraction & Normalization Service (alias mapping)          |
|    - Deterministic CareerMatchingService (weighted overlap calculation)|
|    - SkillGapAnalysisService (matched, missing, priority tiering)     |
|    - IndustryDemandAnalyticsService (live aggregate metrics)          |
|    - LearningRoadmapService (personalized multi-phase milestones)     |
|    - RecommendationService (Courses, Projects, Certifications)        |
|                                                                       |
|  [Data Access Layer]                                                  |
|    Spring Data JPA Repositories | Hibernate ORM | Query Methods       |
+-----------------------------------+-----------------------------------+
                                    |
                               JDBC / HikariCP
                                    v
+-----------------------------------------------------------------------+
|                            MySQL DATABASE                             |
|  - 22 Normalized Relational Tables (InnoDB, UTF8mb4)                  |
|  - Indexed Search Fields (email, skill name, job title, posted date)  |
|  - Relational Integrity (PK, FK cascades, Unique constraints)         |
+-----------------------------------------------------------------------+
```

---

## Complete User Workflows

### Student Complete Workflow (Section C)
1. **Landing & Discovery**: Overview of industry demands, live trending skills teaser, and platform value proposition with clear CTAs.
2. **Registration & Auth**: Form collecting Name, Email, Password, College, Degree, Department, Graduation Year with frontend and backend validation.
3. **Login & Session Management**: Authentication via Spring Boot returning JWT and user role; redirection to `/student/dashboard`.
4. **Academic & Skill Profile Setup**:
   - Academic details (CGPA, college, department).
   - Technical skills entry with fuzzy normalization (e.g. entering "JS", "Javascript", or "Java Script" maps to canonical "JavaScript").
   - Categorized skills: Languages, Frameworks, Databases, Cloud, AI/ML, Tools with self-assessed proficiency.
5. **Resume / Profile Input**: Structured manual resume workflow (education, project experience, internships, certifications, skills) avoiding external non-compliant Python dependencies.
6. **Career Selection & Exploration**: Browse occupations (e.g. Full Stack Developer, Data Scientist, DevOps Engineer) or request system recommendations.
7. **Career Matching & Gap Analysis**:
   - Compare student skills against occupation required and optional skill sets.
   - Calculate deterministic Career Match Percentage and Readiness Score.
   - Categorize skills: Matched, Missing, Skills to Improve, Priority (High/Medium/Low) with clear rationales.
8. **Job Market & Matching**:
   - Browse paginated job postings from MySQL.
   - View personalized Job Match Score (%), matched vs missing skills for each posting, and direct apply links.
9. **Technology Trends Exploration**: View top demanded technologies, growth trajectories, and emerging skills computed directly from aggregated job data.
10. **Personalized Learning Roadmap**: 4-phase sequential milestones tailored to target career with progress tracking (NOT_STARTED, IN_PROGRESS, COMPLETED).
11. **Recommendations (Courses, Projects, Certifications)**: Actionable resources tied directly to identified skill gaps.
12. **Saved Jobs & Notifications**: Bookmark postings and receive platform updates.

### Admin Complete Workflow (Section D)
1. **Admin Authentication**: Secure login enforcing `ROLE_ADMIN`; redirection to `/admin/dashboard`.
2. **Platform KPI Dashboard**: Total counts (Students, Jobs, Skills, Occupations, Courses, Projects), top demanded skills, and market trends.
3. **Student & User Management**: Search, filter, inspect profiles, activate/deactivate accounts without exposing password hashes.
4. **Skill Master Taxonomy Management**: CRUD operations for skills, categories, difficulty, aliases, and duplicate prevention.
5. **Occupation Management**: Define career paths, assign required vs optional skills, and calibrate skill weights.
6. **Job Market Management**: CRUD operations for job postings, skill associations, duplicate detection, and pagination.
7. **Curriculum & Resource Management**: CRUD for Courses, Hands-on Projects, and Industry Certifications mapped to specific skills.
8. **Dataset Management**: Track static vs dynamic data sources (ESCO, O*NET, job board feeds), record counts, and last updated timestamps.
9. **Industry & Recommendation Analytics**: Real-time aggregation of skill demand percentages, salary distributions, location/remote ratios, and most-recommended career paths.
10. **System Audit Logs & Reports**: Downloadable/viewable reports on student skill gaps and platform usage.

---

## Complete Feature Matrix (Section E)

| Feature Module | Student Portal | Admin Panel | Backend Engine |
| :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | Register, Login, JWT storage, Profile Settings | Admin Login, User Status Toggle | Spring Security 6, BCrypt, JwtAuthFilter |
| **Skill Taxonomy** | Search & Tag canonical skills with aliases | Full CRUD, Duplicate Check, Categories | Normalization Service, Alias Master |
| **Profile & Resume** | Structured academic, project & skill portfolio | Profile viewer, verification | StudentProfile & Resume Entities |
| **Career Matching** | Weighted Match %, Readiness Score, Explorer | Occupation CRUD, Skill Weight Configuration | Deterministic Weighted Overlap Formula |
| **Skill Gap Analysis** | Matched/Missing/Priority breakdown + reasoning | Aggregate skill gap reporting | Tiered Gap Priority Engine |
| **Job Market** | Paginated listings, Job Match %, Saved Jobs | Job CRUD, Duplicate Detection, Ingestion | Dynamic JPA Specification & Pagination |
| **Industry Analytics** | Demanded skills ranking, tech trend charts | Deep analytics (Salary, Remote %, Locations) | Group-by SQL Aggregations |
| **Learning Roadmap** | 4-Phase milestones, Progress Tracker | Roadmap template management | Phased Prerequisite Generator |
| **Resource Recommendation**| Filtered Courses, Projects, Certifications | Resource CRUD mapped to skill taxonomy | Skill-gap junction lookups |
| **Audit & Monitoring** | Notification feed, roadmap updates | Audit log viewer, dataset status metrics | AdminLog Entity & System Monitor |

---

## Database ER Design & Schema (Section F & G)

### Relational Entity Relationships
- `users` (1) ── (1) `student_profiles`
- `users` (1) ── (M) `saved_jobs` ── (M) `job_postings`
- `users` (1) ── (M) `notifications`
- `users` (1) ── (M) `admin_logs`
- `skills` (M) ── (1) `skill_categories`
- `skills` (1) ── (M) `skill_aliases`
- `student_profiles` (M) ── (M) `skills` [via `student_skills`]
- `occupations` (M) ── (M) `skills` [via `occupation_skills` with `weight`, `is_required`]
- `job_postings` (M) ── (M) `skills` [via `job_skills`]
- `courses` (M) ── (1) `skills`
- `projects` (M) ── (M) `skills` [via `project_skills`]
- `certifications` (M) ── (M) `skills` [via `certification_skills`]
- `student_profiles` (1) ── (M) `career_roadmaps` ── (1) `occupations`
- `career_roadmaps` (1) ── (M) `roadmap_items` ── (1) `skills`
- `student_profiles` (1) ── (M) `learning_progress` ── (1) `skills`

### MySQL DDL Specifications (Production-Ready)
```sql
CREATE DATABASE IF NOT EXISTS skilllens_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE skilllens_db;

-- 1. Roles & Users
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'STUDENT',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
);

-- 2. Student Profiles
CREATE TABLE student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    college VARCHAR(180) NOT NULL,
    degree VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    graduation_year INT NOT NULL,
    cgpa DECIMAL(4,2),
    career_interest VARCHAR(150),
    target_occupation_id BIGINT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Skill Master Taxonomy
CREATE TABLE skill_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category_id BIGINT NOT NULL,
    description TEXT,
    difficulty VARCHAR(30) DEFAULT 'INTERMEDIATE', -- BEGINNER, INTERMEDIATE, ADVANCED
    demand_level VARCHAR(30) DEFAULT 'MEDIUM',      -- LOW, MEDIUM, HIGH, CRITICAL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_skill_category FOREIGN KEY (category_id) REFERENCES skill_categories(id),
    INDEX idx_skill_name (name)
);

CREATE TABLE skill_aliases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alias_name VARCHAR(100) NOT NULL UNIQUE,
    canonical_skill_id BIGINT NOT NULL,
    CONSTRAINT fk_alias_skill FOREIGN KEY (canonical_skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 4. Student Skills Junction
CREATE TABLE student_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    proficiency_level VARCHAR(30) DEFAULT 'INTERMEDIATE', -- BEGINNER, INTERMEDIATE, ADVANCED
    years_experience DECIMAL(3,1) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_student_skill (student_profile_id, skill_id),
    CONSTRAINT fk_ss_profile FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_ss_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 5. Occupations & Skill Requirements
CREATE TABLE occupations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    career_level VARCHAR(30) DEFAULT 'ENTRY_LEVEL',
    average_salary VARCHAR(60),
    industry_demand VARCHAR(30) DEFAULT 'HIGH',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_occupation_title (title)
);

CREATE TABLE occupation_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    occupation_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    weight DECIMAL(3,2) NOT NULL DEFAULT 1.0, -- e.g. 1.0 to 3.0
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    priority_level VARCHAR(20) DEFAULT 'HIGH', -- HIGH, MEDIUM, LOW
    UNIQUE KEY uq_occ_skill (occupation_id, skill_id),
    CONSTRAINT fk_os_occupation FOREIGN KEY (occupation_id) REFERENCES occupations(id) ON DELETE CASCADE,
    CONSTRAINT fk_os_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 6. Job Postings & Job Skills
CREATE TABLE job_postings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    location VARCHAR(120) NOT NULL,
    description TEXT,
    salary VARCHAR(80),
    job_type VARCHAR(40) DEFAULT 'FULL_TIME', -- FULL_TIME, INTERNSHIP, CONTRACT
    is_remote BOOLEAN DEFAULT FALSE,
    posted_date DATE NOT NULL,
    source VARCHAR(80) DEFAULT 'DIRECT',      -- GREENHOUSE, LEVER, ARBEITNOW, DIRECT
    apply_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_job_title (title),
    INDEX idx_job_location (location),
    INDEX idx_job_date (posted_date)
);

CREATE TABLE job_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    UNIQUE KEY uq_job_skill (job_id, skill_id),
    CONSTRAINT fk_js_job FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE,
    CONSTRAINT fk_js_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE saved_jobs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_job (user_id, job_id),
    CONSTRAINT fk_sj_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_sj_job FOREIGN KEY (job_id) REFERENCES job_postings(id) ON DELETE CASCADE
);

-- 7. Courses, Projects, Certifications
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    provider VARCHAR(120) NOT NULL,
    skill_id BIGINT NOT NULL,
    difficulty VARCHAR(30) DEFAULT 'INTERMEDIATE',
    duration VARCHAR(50),
    url VARCHAR(500) NOT NULL,
    description TEXT,
    CONSTRAINT fk_course_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(30) DEFAULT 'INTERMEDIATE',
    estimated_duration VARCHAR(60),
    github_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    UNIQUE KEY uq_proj_skill (project_id, skill_id),
    CONSTRAINT fk_ps_proj FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_ps_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE certifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    provider VARCHAR(120) NOT NULL,
    difficulty VARCHAR(30) DEFAULT 'INTERMEDIATE',
    url VARCHAR(500),
    description TEXT
);

CREATE TABLE certification_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    certification_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    UNIQUE KEY uq_cert_skill (certification_id, skill_id),
    CONSTRAINT fk_cs_cert FOREIGN KEY (certification_id) REFERENCES certifications(id) ON DELETE CASCADE,
    CONSTRAINT fk_cs_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 8. Learning Roadmaps & Progress Tracking
CREATE TABLE career_roadmaps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL,
    occupation_id BIGINT NOT NULL,
    overall_progress DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cr_profile FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_cr_occupation FOREIGN KEY (occupation_id) REFERENCES occupations(id) ON DELETE CASCADE
);

CREATE TABLE roadmap_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    phase_number INT NOT NULL, -- Phase 1: Foundations, Phase 2: Core, Phase 3: Advanced, Phase 4: Production
    priority_level VARCHAR(20) DEFAULT 'HIGH',
    status VARCHAR(30) DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, COMPLETED
    recommended_resource VARCHAR(255),
    CONSTRAINT fk_ri_roadmap FOREIGN KEY (roadmap_id) REFERENCES career_roadmaps(id) ON DELETE CASCADE,
    CONSTRAINT fk_ri_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE learning_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_profile_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    status VARCHAR(30) DEFAULT 'NOT_STARTED',
    progress_percentage INT DEFAULT 0,
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_lp_profile_skill (student_profile_id, skill_id),
    CONSTRAINT fk_lp_profile FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_lp_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 9. Technology Trends & Analytics Snapshots
CREATE TABLE technology_trends (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id BIGINT NOT NULL UNIQUE,
    job_mention_count INT NOT NULL DEFAULT 0,
    demand_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    trend_direction VARCHAR(20) DEFAULT 'STABLE', -- GROWING, EMERGING, STABLE, DECLINING
    growth_rate DECIMAL(5,2) DEFAULT 0.0,
    last_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tt_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 10. Audit Logs & Notifications
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE admin_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(80) NOT NULL,
    target_id BIGINT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_al_user FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Backend Architecture & API Specification (Section H & J)

### Standard Package Structure
```
backend/src/main/java/com/skilllens/
├── config/             # SecurityConfig, CorsConfig, OpenApiConfig, PasswordEncoder
├── controller/         # AuthController, StudentProfileController, SkillController,
│                       # CareerController, JobController, AnalyticsController,
│                       # RoadmapController, AdminController
├── dto/                # Request & Response DTOs (AuthRequest, ProfileDto, MatchResponse, etc.)
├── entity/             # 22 JPA Entities mapped to MySQL tables
├── exception/          # GlobalExceptionHandler, ResourceNotFoundException, BadRequestException
├── repository/         # 22 Spring Data JPA Repositories
├── security/           # JwtUtils, UserDetailsServiceImpl, AuthTokenFilter
├── service/            # Core business logic services & algorithms
└── util/               # Constants, TextNormalizer, MathUtils
```

### Core REST API Specification
All responses adhere to a uniform structure:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-09-07T21:15:00Z"
}
```

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new student account |
| `POST` | `/api/auth/login` | Public | Authenticate user, return JWT + Role |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session context |
| `GET` | `/api/student/profile` | STUDENT | Fetch current student profile & skills |
| `PUT` | `/api/student/profile` | STUDENT | Update academic details & interests |
| `POST` | `/api/student/skills` | STUDENT | Add/normalize skills with proficiency |
| `DELETE` | `/api/student/skills/{skillId}` | STUDENT | Remove skill from student profile |
| `GET` | `/api/skills` | Authenticated | List all canonical skills with categories |
| `GET` | `/api/occupations` | Authenticated | List all career paths & requirement counts |
| `GET` | `/api/occupations/{id}` | Authenticated | Get occupation details with skill weights |
| `GET` | `/api/occupations/{id}/match` | STUDENT | Compute deterministic match & skill gap |
| `GET` | `/api/careers/recommended` | STUDENT | Top 3 recommended careers with scores |
| `GET` | `/api/skill-gap` | STUDENT | Detailed skill gap breakdown for target career |
| `GET` | `/api/jobs` | Authenticated | Paginated job search (`page`, `size`, `search`, `remote`) |
| `GET` | `/api/jobs/{id}` | Authenticated | Job details + student skill match % |
| `POST` | `/api/jobs/{id}/save` | STUDENT | Bookmark job posting |
| `GET` | `/api/jobs/saved` | STUDENT | View student's saved jobs |
| `GET` | `/api/trends` | Authenticated | Skill demand % and growing/emerging techs |
| `GET` | `/api/roadmap` | STUDENT | Fetch or generate 4-phase learning roadmap |
| `PUT` | `/api/roadmap/items/{id}/status` | STUDENT | Update roadmap milestone status |
| `GET` | `/api/courses/recommended` | STUDENT | Courses addressing current skill gaps |
| `GET` | `/api/projects/recommended` | STUDENT | Projects addressing current skill gaps |
| `GET` | `/api/certifications/recommended` | STUDENT | Certifications aligned with career gap |
| `GET` | `/api/admin/dashboard` | ADMIN | Overall platform metrics & analytics |
| `GET` | `/api/admin/users` | ADMIN | Manage & search student user accounts |
| `PUT` | `/api/admin/users/{id}/status` | ADMIN | Activate / Deactivate user account |
| `POST/PUT/DELETE` | `/api/admin/skills` | ADMIN | CRUD canonical skills and categories |
| `POST/PUT/DELETE` | `/api/admin/occupations` | ADMIN | CRUD occupations and skill associations |
| `POST/PUT/DELETE` | `/api/admin/jobs` | ADMIN | CRUD job postings and skill links |
| `POST/PUT/DELETE` | `/api/admin/courses` | ADMIN | CRUD course catalog |
| `POST/PUT/DELETE` | `/api/admin/projects` | ADMIN | CRUD project recommendations |
| `POST/PUT/DELETE` | `/api/admin/certifications`| ADMIN | CRUD industry certifications |
| `GET` | `/api/admin/analytics/industry` | ADMIN | In-depth market distributions (Salary, Remote) |
| `GET` | `/api/admin/reports/skill-gap` | ADMIN | Aggregate student gap statistics report |

---

## Core Deterministic Algorithms (Section K)

### 1. Skill Extraction & Normalization
- Input text string is trimmed, converted to lowercase, and stripped of extraneous punctuation.
- Direct lookup in `skill_aliases` table. If match found, return canonical `Skill` entity.
- If no alias found, perform exact match against `skills.name`.
- Example: `"js"`, `"javascript"`, `"Java Script"` $\rightarrow$ canonical `"JavaScript"` (ID: 14).

### 2. Weighted Career Match Score
For target occupation $O$ with required skills $S_{req}$ and optional skills $S_{opt}$:
$$\text{Weight}(s) = \begin{cases} 2.0 & \text{if } s \in S_{req} \\ 1.0 & \text{if } s \in S_{opt} \end{cases}$$
Let $S_{student}$ be the student's normalized skill set:
$$\text{Matched Skills } M = (S_{req} \cup S_{opt}) \cap S_{student}$$
$$\text{Career Match Score} = \frac{\sum_{s \in M} \text{Weight}(s)}{\sum_{s \in (S_{req} \cup S_{opt})} \text{Weight}(s)} \times 100$$
$$\text{Career Readiness Score} = \frac{\sum_{s \in (S_{req} \cap S_{student})} \text{Weight}(s)}{\sum_{s \in S_{req}} \text{Weight}(s)} \times 100$$

### 3. Skill Gap Priority Classification
For missing skill $s \notin S_{student}$:
- **HIGH PRIORITY**: $s \in S_{req}$ AND Industry Demand Level = 'HIGH' / 'CRITICAL'.
- **MEDIUM PRIORITY**: $s \in S_{req}$ with standard demand, OR $s \in S_{opt}$ with 'HIGH' demand.
- **LOW PRIORITY**: $s \in S_{opt}$ with moderate demand.
- For each prioritized skill, a human-readable explanation is generated (e.g., *"Required core skill for Full Stack Developer and demanded in 78% of active job postings"*).

### 4. Industry Skill Demand Metric
For skill $s$ across total analyzed active postings $N_{jobs}$:
$$\text{Demand}(s) = \frac{\text{Count of jobs requiring } s}{N_{jobs}} \times 100$$
Trend classification:
- **EMERGING**: Recent mention growth $> 25\%$ over previous period.
- **GROWING**: Mention count in top 30th percentile with positive trajectory.
- **DECLINING**: Mention count decreased $> 15\%$.
- **INSUFFICIENT DATA**: If $N_{jobs} < 10$, explicitly show `"Insufficient data"`.

### 5. Job Match Score
For job posting $J$ with required skills $S_J$:
$$\text{Job Match Score} = \frac{|S_J \cap S_{student}|}{|S_J|} \times 100$$

---

## Frontend Architecture (Section I)

### Clean Component & Page Hierarchy
```
frontend/src/
├── assets/             # Branding, SVGs, static icons
├── components/
│   ├── common/         # Navbar, Sidebar, Footer, Modal, Button, DataTable, EmptyState, LoadingSpinner
│   ├── cards/          # DashboardCard, CareerCard, JobCard, CourseCard, ProjectCard, SkillBadge
│   └── charts/         # SkillGapChart, TrendBarChart, SalaryDonutChart (Chart.js / SVG-based)
├── context/            # AuthContext (user, token, role, login, logout)
├── hooks/              # useAuth, useFetch, useDebounce
├── pages/
│   ├── public/         # LandingPage, LoginPage, RegisterPage, NotFoundPage
│   ├── student/        # StudentDashboard, StudentProfile, SkillProfile, CareerExplorer,
│   │                   # SkillGapAnalysis, JobMarket, JobDetails, TechTrends,
│   │                   # CareerRecommendations, LearningRoadmap, CoursesPage,
│   │                   # ProjectsPage, CertificationsPage, SavedJobs, SettingsPage
│   └── admin/          # AdminDashboard, UserManagement, SkillManagement, OccupationManagement,
│                       # JobManagement, CourseManagement, ProjectManagement, CertManagement,
│                       # DatasetManagement, IndustryAnalytics, ReportsPage, SystemLogs
├── services/           # api.js (Axios instance with JWT interceptor), authService, studentService, adminService
└── utils/              # formatters, validators, constants
```

### Visual & UX Standards
- Responsive layout supporting Desktop, Tablet, and Mobile.
- Accessible color palette (Dark Slate `#0f172a`, Indigo Accent `#6366f1`, Emerald Success `#10b981`, Amber Warning `#f59e0b`, Rose Danger `#ef4444`).
- Comprehensive state feedback: Interactive skeletons during API load, clear empty states ("No matching jobs found"), error toasts with dismiss actions, and zero dead/non-functional buttons.

---

## Security Architecture (Section L)
1. **Password Encryption**: Spring Security `BCryptPasswordEncoder` (12 rounds). Raw passwords never logged, persisted, or returned in DTOs.
2. **Stateless JWT Authentication**: Short-lived access tokens signed via HMAC-SHA256 with server-side secret validation.
3. **Role-Based Authorization**: Enforced at method level (`@PreAuthorize("hasRole('ADMIN')")`) and URL pattern level (`/api/admin/**` restricted to `ADMIN`).
4. **SQL Injection & XSS Immunity**: 100% parameterized JPA queries, strict DTO type validation using Jakarta Bean Validation (`@NotBlank`, `@Email`, `@Size`, `@Min`, `@Max`).
5. **CORS Configuration**: Restrict allowed origins to frontend URL (`http://localhost:5173`).

---

## Phased Development Roadmap (Section M)

- **Phase 1: Project Scaffolding, Database & Auth Core**
  - Initialize Spring Boot 3 with Maven wrapper and React (Vite).
  - Configure MySQL 8 connection pool (`application.properties`) and create base DDL migration scripts.
  - Implement User entity, Roles, BCrypt password hashing, JWT provider, Auth Controller, and React Auth views.
- **Phase 2: Master Taxonomy & Profile Management**
  - Implement Skill Categories, Skills, Aliases, Occupations, and OccupationSkills entities.
  - Build Student Profile & Skills management with alias normalization.
  - Implement React Profile & Skill management interfaces.
- **Phase 3: Career Matching, Skill Gap Analysis & Job Market**
  - Implement deterministic Career Matching and Skill Gap Priority algorithms.
  - Implement JobPostings entity, search, pagination, and student-to-job matching score.
  - Implement React Career Explorer, Gap Analysis, and Job Market views.
- **Phase 4: Industry Demand, Technology Trends & Career Recommendations**
  - Implement dynamic industry demand aggregation queries and trend calculations.
  - Build top-3 career recommendation engine combining skill match and industry demand.
  - Build React Trend Charts and Recommendation cards.
- **Phase 5: Learning Roadmap & Resource Ecosystem**
  - Implement 4-Phase Roadmap generation logic and student progress tracker.
  - Implement Courses, Projects, and Certifications catalogs mapped to skills.
  - Implement React Roadmap progress view and curated resource cards.
- **Phase 6: Admin Management & Platform Analytics**
  - Implement complete Admin CRUD APIs for all datasets (Users, Skills, Occupations, Jobs, Courses, Projects, Certs).
  - Build Admin Dashboard, Dataset Status monitor, and deep Industry Analytics views.
- **Phase 7: End-to-End Testing, Security Hardening & Polish**
  - Seed comprehensive, realistic engineering data (ESCO/O*NET-aligned roles, skills, and active job postings).
  - Write JUnit tests for matching algorithms, API controllers, and security filters.
  - Polish UI/UX, responsive layouts, and cross-browser testing.

---

## Testing Strategy (Section N)
1. **Algorithm Unit Tests**:
   - Verify deterministic career match percentage with known skill weights.
   - Verify skill gap categorization (High/Medium/Low priority rules).
   - Test normalization for all alias permutations ("js" $\rightarrow$ "JavaScript").
2. **API Integration Tests**:
   - `@SpringBootTest` with MockMvc testing auth endpoints, role enforcement (verifying 403 on student accessing `/api/admin/**`), and DTO validation.
3. **Database Integrity Tests**:
   - Verify foreign key cascades, unique constraints, and duplicate prevention.
4. **Frontend Functional Tests**:
   - Verify state transitions, token persistence in localStorage, route guards, and responsive layout rendering.

---

## User Review Required & Open Questions

> [!IMPORTANT]
> **MySQL Database Credentials**:
> The local `MySQL80` service is running on port 3306. Please provide the MySQL `root` password (or preferred application user/password) so Spring Boot can establish the database connection and initialize the tables.

> [!NOTE]
> **Initial Seed Dataset**:
> To ensure the platform is immediately demonstrable and realistic without fake data, we will include a comprehensive seed data migration script covering:
> - 8 Core Engineering Roles (Full Stack Developer, Backend Java Engineer, Frontend Engineer, Data Scientist, Data Analyst, Cloud DevOps Engineer, AI/ML Engineer, Cybersecurity Analyst).
> - 60+ Normalized Skills across Languages, Frameworks, Cloud, Databases, and Tools with aliases.
> - 25+ Realistic Job Postings with salary ranges, locations, remote tags, and skill requirements.
> - Structured courses, portfolio projects, and industry certifications.
