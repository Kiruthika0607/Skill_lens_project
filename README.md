# Industry Skill Intelligence — Career Path Mapping Platform

> **Smart India Hackathon (SIH) Prototype Submission**  
> Inspired by **Naan Mudhalvan** — Skill Intelligence Engine for Engineering Graduates

## Executive Overview
**Industry Skill Intelligence** is an evidence-backed skill demand analytics and career path mapping platform. It bridges real market demand signal to student profile readiness via deterministic weighted matching, topological dependency graph path solving, ROI "what-if" skill simulation, and regional skill supply vs. demand matrix telemetries.

---

## Key Features & Novelties
1. **Deterministic Explainable Career Matching**: No opaque LLM hallucination. Uses formula:
   $$\text{CareerScore} = 0.40 \cdot \text{SkillMatch} + 0.25 \cdot \text{IndustryDemand} + 0.15 \cdot \text{CareerPref} + 0.10 \cdot \text{EduCompat} + 0.10 \cdot \text{LocCompat}$$
2. **Automated Dependency-Graph Career Path**: Topological ordering of skill gap prerequisites, estimated effort, applied project tasks, and validation criteria.
3. **Interactive "What-If" Career Simulator**: Real-time recalculation of score deltas ($\Delta \text{Score}$) and newly unlocked career matches.
4. **Data Provenance Transparency**: Every job record and chart panel explicitly labeled as `REAL_API | OPEN_DATASET | MANUAL_IMPORT | PROTOTYPE DATA`.
5. **Industry Supply vs. Demand Matrix**: Regional skill shortage telemetry comparing market demand vs. student supply.

---

## Quick Start
```bash
# 1. Install & seed database
npm install --prefix server
npm install --prefix client
npx -y tsx scripts/seed.ts

# 2. Run backend & frontend
npm run dev --prefix server
npm run dev --prefix client
```

### Demo Credentials
- **Student**: `student@naanmudhalvan.edu.in` / `student123`
- **Admin**: `admin@naanmudhalvan.gov.in` / `student123`
- **Employer**: `hr@tcs.com` / `student123`
