# API Reference Documentation

## Authentication Endpoints
- `POST /api/auth/signup` — Registers a user with role (`student`, `admin`, `industry`).
- `POST /api/auth/login` — Authenticates user and sets HTTP-only session cookie.
- `POST /api/auth/logout` — Clears HTTP-only session cookie.
- `GET /api/auth/me` — Fetches current authenticated session state.

## Skill & Taxonomy Endpoints
- `POST /api/skills/normalize` — Normalizes raw string variant into taxonomy skill entry.
- `GET /api/skills` — Returns skill taxonomy listing filtered by category or search.
- `GET /api/skills/:id` — Returns skill metadata, aliases, and learning resources.
- `GET /api/skills/:id/related` — Returns graph-linked related skills.

## Job Pipeline & Demand Endpoints
- `POST /api/jobs/import` — Ingests job postings array with provenance tags.
- `GET /api/jobs` — Paginated job listings with skill extraction.
- `GET /api/jobs/stats` — Ingestion breakdown by provenance and industry.
- `POST /api/demand/analyze` — Calculates weighted skill demand index.
- `GET /api/demand/top` — Top 15 demanded skills.
- `GET /api/demand/forecast` — Demand trend forecasts.

## Career Engine Endpoints
- `POST /api/career/onboarding` — Saves 7-step student onboarding profile.
- `POST /api/career/recommend` — Computes deterministic role compatibility scores.
- `POST /api/career/skill-gap` — Classifies matched, partial, and missing skills with priority.
- `POST /api/career/career-path` — Solves topological dependency career path.
- `POST /api/career/simulator` — Calculates "What-If" skill acquisition deltas.
- `GET /api/career/job-matches` — Matches jobs with transparent gap bridge CTAs.

## Admin & Industry Endpoints
- `GET /api/admin/dashboard` — Macro skill heatmap & emerging/declining trends.
- `GET /api/admin/data-quality` — Ingestion audit logs & unmapped skills.
- `POST /api/admin/data-quality/action` — Approves, rejects, or resolves audit log.
- `GET /api/industry/supply-demand` — Regional skill supply vs. demand matrix.
- `GET /api/industry/candidate-pool` — Student talent pool signals for employers.
