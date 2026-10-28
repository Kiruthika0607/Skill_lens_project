# SkillLens Backend — Career Guidance and Opportunity Aggregation Platform

SkillLens is a full-stack, enterprise-grade career navigation platform engineered specifically for engineering students. It transforms ambiguous career goals into measurable milestones by combining automated resume parsing, granular skill assessments, industry requirement mapping, dynamic skill gap analytics, personalized learning roadmaps, opportunity matching, and AI advisory assistance.

---

## 1. Architecture & Technology Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Framework** | Spring Boot 3.2.5, Java 17 LTS |
| **Database & Migration** | MySQL 8.0+, Hibernate / Spring Data JPA, Flyway 10.11.0 |
| **Security & Auth** | Spring Security 6, JJWT 0.12.5 (HMAC-SHA512), Refresh Token Rotation |
| **Document Processing** | Apache Tika 2.9.2, Apache PDFBox 3.0.2 (Local storage / GCS abstraction) |
| **Fault Tolerance & Resilience** | Resilience4j 2.2.0 (Rate limiter, Circuit breaker, Retry) |
| **API Documentation** | SpringDoc OpenAPI 2.5.0, Swagger UI 3 |
| **AI Integration** | Anthropic Claude API (3.5 Haiku) with deterministic contextual domain fallback |
| **Build & Test** | Maven Wrapper 3.9.6, JUnit 5, Mockito |

---

## 2. Prerequisites

- **Java JDK 17+** (Ensure `JAVA_HOME` is set to JDK 17)
- **MySQL 8.0+** running locally or in Docker
- **Maven** (included via `./mvnw.cmd` / `./mvnw`)

---

## 3. Quick Start & Setup

### 3.1 Database Creation
Create a MySQL database named `skilllens_db` (the default configured database):
```sql
CREATE DATABASE skilllens_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3.2 Environment Configuration
Copy `.env.example` to `.env` and set your local MySQL credentials. The backend imports this file on startup; keep it private and do not commit it:
```bash
Copy-Item .env.example .env
```

Key environment properties:
- `DB_URL`: `jdbc:mysql://localhost:3306/skilllens_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true`
- `DB_USERNAME`: MySQL user (default `root`)
- `DB_PASSWORD`: MySQL password for your local instance (required; no password is stored in application configuration)
- `JWT_SECRET`: 64+ character signing secret for HS512
- `GEMINI_ENABLED`: Set to `true` and provide `GEMINI_API_KEY` from Google AI Studio to enable Gemini free-tier responses; `AI_PROVIDER` selects `gemini` (default) or `anthropic`.
- `GEMINI_MODEL`: Optional Gemini model override (default `gemini-2.5-flash`). Model calls send only the current chat question, not stored profile data.
- `AI_ENABLED`: Set to `true` with `ANTHROPIC_API_KEY` when using `AI_PROVIDER=anthropic`; with no configured provider, the local contextual advisor is used.

### 3.3 Run Database Migrations & Seed Data
Migrations execute automatically on application startup via Flyway:
- `V1__initial_schema.sql`: 27 relational tables with foreign keys and composite indexes.
- `V2__seed_data.sql`: Seeds 7 categories, 12 in-demand skills, 4 industry career roles, skill requirement weights, 3 full assessment question banks, 5 industry trends, curated learning resources, and opportunities.

### 3.4 Start the Backend Server
Run using the Maven wrapper:
```powershell
# Windows PowerShell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
Set-Location skilllens-backend
.\mvnw.cmd spring-boot:run
```
```bash
# Linux / macOS
export JAVA_HOME=/path/to/jdk-17
./mvnw spring-boot:run
```

The server will start on `http://localhost:8080`.

---

## 4. Default Credentials & Interactive Swagger Docs

### Pre-seeded Accounts
| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@skilllens.com` | `Admin@12345` |
| **Student** | `student@skilllens.com` | `Student@12345` |

### API Documentation
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI 3 JSON Specification**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## 5. REST API Endpoint Catalog

### Authentication (`/api/auth/**`)
- `POST /api/auth/register` — Student self-registration (server locks role to `STUDENT`)
- `POST /api/auth/login` — Authenticate and receive short-lived Access Token & rotating Refresh Token
- `POST /api/auth/refresh` — Rotate refresh token and issue new token pair
- `POST /api/auth/logout` — Revoke active refresh token
- `POST /api/auth/forgot-password` — Request password reset token (account enumeration protected)
- `POST /api/auth/reset-password` — Finalize password reset with token

### Student Profile & Dashboard (`/api/student/**`)
- `GET /api/student/profile` — Get authenticated student profile, GPA, graduation year, target roles
- `PUT /api/student/profile` — Update student profile details
- `GET /api/student/dashboard` — Complete unified dashboard summary (profile, assessments, active roadmap, skill gaps, recommended opportunities, notifications)

### Skill Catalog & Student Skills (`/api/skills/**`)
- `GET /api/skills` — Search and filter skills catalog
- `GET /api/skills/categories` — List all skill categories
- `GET /api/skills/my` — Get student's verified and self-reported skills
- `POST /api/skills/my` — Add self-reported skill to profile
- `DELETE /api/skills/my/{skillId}` — Remove skill from profile

### Assessments (`/api/assessments/**`)
- `GET /api/assessments` — List available skill assessments
- `GET /api/assessments/{id}` — Get assessment overview
- `POST /api/assessments/{id}/start` — Start timed attempt and fetch questions (correct answers stay server-side)
- `POST /api/assessments/attempts/{attemptId}/submit` — Submit answers for server-side scoring & proficiency level update (1-4 scale)
- `GET /api/assessments/history` — Get student's previous assessment attempts

### Career Roles & Recommendations (`/api/careers/**`, `/api/student/**`)
- `GET /api/careers` — List career roles and required skills
- `GET /api/careers/{id}` — Get specific career role details and required proficiency weights
- `GET /api/student/career-recommendations` — Compute personalized role matches based on assessed skills
- `POST /api/student/career-goals` — Set student target career role
- `GET /api/student/career-goals` — Get active target career role

### Skill Gap Analysis (`/api/skill-gaps/**`)
- `GET /api/skill-gaps/careers/{careerId}` — Computes exact mathematical skill gap ($g_i = \max(0, R_i - S_i) / R_i$) and aggregate readiness percentage against target role

### Resume Upload & Parsing (`/api/resumes/**`, `/api/student/resume/**`)
- `POST /api/student/resume/upload` — Upload PDF/DOCX resume; parses text via Tika, extracts contact details, and matches against skills catalog
- `GET /api/student/resume` — List student's uploaded resumes
- `GET /api/student/resume/{id}` — Get parsed results, extracted text, and skills
- `POST /api/student/resume/{id}/apply-skills` — Import extracted skills directly into student profile

### Learning Resources (`/api/resources/**`, `/api/student/resources/**`)
- `GET /api/resources` — Search learning resources (courses, books, videos, tutorials)
- `GET /api/student/resources/recommended` — Resources filtered by student's active skill gaps
- `POST /api/student/resources/{id}/save` — Bookmark learning resource
- `PATCH /api/student/resources/{id}/progress` — Update completion progress (0-100%)

### Personalized Roadmaps (`/api/roadmaps/**`, `/api/student/roadmaps/**`)
- `POST /api/student/roadmaps/generate` — Dynamically generate ordered milestone pathway prioritizing largest skill gaps
- `GET /api/student/roadmaps` — List student roadmaps
- `GET /api/student/roadmaps/{id}` — Get roadmap details and milestone checklist
- `PATCH /api/student/roadmaps/{id}/milestones/{milestoneId}` — Update milestone status (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`)

### Industry Trends (`/api/industry/**`)
- `GET /api/industry/trends` — Top in-demand skills and growth velocities
- `GET /api/industry/top-in-demand` — Ranked high-demand technologies
- `GET /api/industry/skills/demand` — Detailed year-over-year growth metrics

### Opportunities Aggregation (`/api/opportunities/**`, `/api/student/opportunities/**`)
- `GET /api/opportunities` — Search jobs, internships, scholarships, and hackathons
- `GET /api/student/opportunities/recommended` — Ranked opportunities scored against student's assessed skills
- `POST /api/student/opportunities/{id}/save` — Save / bookmark opportunity
- `PATCH /api/student/opportunities/{id}/status` — Track application stage (`SAVED`, `APPLIED`, `INTERVIEWING`, `OFFERED`, `REJECTED`)

### AI Career Chatbot (`/api/chat/**`)
- `POST /api/chat/messages` — Send message to AI career counselor (Claude AI with domain-aware fallback)
- `GET /api/chat/history` — Retrieve conversation history

### Notifications (`/api/notifications/**`, `/api/student/notifications/**`)
- `GET /api/notifications` — List paginated notifications
- `GET /api/notifications/unread-count` — Count of unread alerts
- `PATCH /api/notifications/{id}/read` — Mark notification read
- `POST /api/notifications/read-all` — Mark all notifications read

### Analytics (`/api/analytics/**`)
- `GET /api/analytics/student` — Student career readiness score, proficiency distribution, and completion velocity
- `GET /api/admin/analytics/platform` — Admin platform-wide statistics (student counts, top skill gaps, assessment pass rates)

### Admin Management & Audit (`/api/admin/**`)
- `GET /api/admin/users` — Manage platform users
- `PATCH /api/admin/users/{id}/status` — Activate/deactivate accounts
- `POST /api/admin/skills` — Add new skill to catalog
- `POST /api/admin/careers` — Create career role definition
- `POST /api/admin/opportunities` — Publish new job or internship opportunity
- `GET /api/admin/audit-logs` — Review immutable audit trail of critical administrative operations

---

## 6. Background Scheduled Jobs

The application runs automatic background maintenance tasks (`com.skilllens.scheduler.SkillLensScheduledTasks`):
- **Opportunity Expiry Checker**: Daily job deactivates opportunities whose application deadline has passed.
- **Notification Hygiene**: Deletes read notifications older than 30 days.
- **Resume Reparsing Retry**: Automatically re-attempts parsing for resumes stuck in `PARSING` status.
- **Aggregated Opportunity Sync**: Synchronizes external feeds every 6 hours.
- **Heartbeat Monitor**: Daily health and telemetry verification.

---

## 7. Running Tests

The test suite contains automated unit and service tests covering authentication, skill gap formulas, scoring, roadmap ordering, opportunity matching, and resume parsing:

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
.\mvnw.cmd clean test
```

All 18 tests execute in isolation using Mockito and in-memory test profiles.
