# Data Dictionary — Database Tables & Models

## Primary Entities (25 Relational Tables)

1. **`users`**: User login authentication & role (`student`, `admin`, `industry`).
2. **`students`**: Academic profile, discipline, college, graduation year, preferred domain, student profile score.
3. **`skills`**: Standardized skill taxonomy entities with normalized name, category, baseline demand score, description.
4. **`skill_aliases`**: Alias map for fuzzy string normalization (e.g. `ReactJS` -> `React`).
5. **`skill_relationships`**: Graph edge mappings (`PREREQUISITE_FOR`, `RELATED_TO`, `COMPLEMENTARY`).
6. **`career_roles`**: Target industry career roles (e.g. Full Stack Engineer, Data Scientist).
7. **`career_role_skills`**: Weighted skill requirement matrix (`importance_weight`, `proficiency_required`, `is_mandatory`).
8. **`career_transitions`**: Career progression path relationships.
9. **`student_skills`**: Student proficiency levels (1-5), verification source, confidence score.
10. **`skill_assessments`**: Evidence notes and scores from structured onboarding assessment.
11. **`projects`**: Applied student technical project portfolio.
12. **`certifications`**: Student earned certifications and verification URLs.
13. **`industries`**: Industry sectors and descriptions.
14. **`industry_skills`**: Industry sector skill weighting.
15. **`jobs`**: Job postings (`job_code`, `title`, `company`, `location`, `description`, `experience_level`, `provenance`).
16. **`job_skills`**: Extracted skill mappings with extraction confidence.
17. **`job_sources`**: External ingestion pipeline sources.
18. **`learning_resources`**: Curated open/NPTEL/documentation resources.
19. **`skill_resources`**: Skill-to-resource relevance mapping.
20. **`career_recommendations`**: Composite recommendation score breakdown (`skill_match_score`, `demand_score`, `pref_score`, `edu_score`, `loc_score`).
21. **`skill_gaps`**: Skill status (`MATCHED`, `PARTIAL`, `MISSING`) and priority (`HIGH`, `MEDIUM`, `LOW`).
22. **`career_paths`**: Generated career path metadata.
23. **`career_path_steps`**: Sequential dependency stages with project task & validation method.
24. **`demand_snapshots`**: Historical demand tracking snapshots for growth calculation.
25. **`skill_forecasts`**: Predicted future demand scores and confidence intervals.
26. **`student_job_matches`**: Student profile to job listing match percentages.
27. **`data_quality_logs`**: Data quality audit flags (`entity_type`, `issue_type`, `status`).
