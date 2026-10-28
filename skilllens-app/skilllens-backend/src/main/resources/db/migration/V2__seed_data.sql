-- SkillLens Seed Data V2
-- Realistic catalog data: categories, skills, career roles, assessments, industry trends, learning resources, and opportunities.

-- 1. Skill Categories
INSERT INTO skill_categories (id, name, description, created_at) VALUES
(1, 'Programming Languages', 'Core programming and scripting languages widely used across industry', NOW()),
(2, 'Web & Frontend Development', 'Client-side technologies, UI frameworks, and responsive design systems', NOW()),
(3, 'Backend & Distributed Systems', 'Server-side frameworks, microservices architectures, and API development', NOW()),
(4, 'Cloud & DevOps Infrastructure', 'Containerization, orchestration, CI/CD pipelines, and cloud computing platforms', NOW()),
(5, 'Databases & Storage', 'Relational and NoSQL database management, query optimization, and caching', NOW()),
(6, 'Machine Learning & Data Science', 'Artificial intelligence algorithms, data preprocessing, and model training', NOW()),
(7, 'Software Engineering Practices', 'Version control, system design, testing methodologies, and clean code principles', NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Skills Catalog
INSERT INTO skills (id, name, description, category_id, is_active, tags, created_at) VALUES
(1, 'Java', 'Object-oriented programming language, JVM internals, multithreading, and memory management', 1, TRUE, 'oop,backend,enterprise,jvm', NOW()),
(2, 'Python', 'Versatile language for backend services, automation scripting, and machine learning', 1, TRUE, 'scripting,ai,data,backend', NOW()),
(3, 'TypeScript', 'Typed superset of JavaScript for scalable, robust frontend and full-stack development', 1, TRUE, 'frontend,fullstack,types', NOW()),
(4, 'React', 'Component-based declarative JavaScript UI library for building modern web applications', 2, TRUE, 'frontend,spa,ui,javascript', NOW()),
(5, 'Spring Boot', 'Production-grade enterprise Java framework for building REST APIs and microservices', 3, TRUE, 'java,microservices,backend,rest', NOW()),
(6, 'Docker', 'Platform for containerizing applications to ensure uniform development and deployment', 4, TRUE, 'devops,containers,cloud', NOW()),
(7, 'Kubernetes', 'Automated container orchestration system for deploying, scaling, and managing workloads', 4, TRUE, 'devops,orchestration,k8s,cloud', NOW()),
(8, 'MySQL', 'Widely adopted relational database management system with ACID compliance', 5, TRUE, 'sql,relational,db', NOW()),
(9, 'PostgreSQL', 'Advanced open-source relational and object-relational database with high extensibility', 5, TRUE, 'sql,rdbms,postgres', NOW()),
(10, 'Machine Learning', 'Statistical learning models, classification, regression, clustering, and neural networks', 6, TRUE, 'ai,ml,deeplearning,data', NOW()),
(11, 'System Design', 'Architectural patterns, scalability, caching, load balancing, and fault tolerance', 7, TRUE, 'architecture,scaling,distributed', NOW()),
(12, 'Git', 'Distributed version control system for tracking source code changes and collaboration', 7, TRUE, 'vcs,collaboration,devops', NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Career Roles
INSERT INTO career_roles (id, title, description, industry, avg_salary_range, is_active, created_at) VALUES
(1, 'Full Stack Software Engineer', 'Designs, builds, and maintains end-to-end web applications across client interfaces, backend services, and relational datastores.', 'Software & Internet', '$85,000 - $135,000', TRUE, NOW()),
(2, 'Backend Microservices Engineer', 'Architects high-throughput distributed systems, secure RESTful APIs, asynchronous event processing, and data persistence layers.', 'Enterprise Tech & FinTech', '$95,000 - $150,000', TRUE, NOW()),
(3, 'Cloud DevOps Engineer', 'Builds and automates resilient cloud infrastructure, CI/CD pipelines, container orchestration, and telemetry monitoring.', 'Cloud Infrastructure', '$100,000 - $160,000', TRUE, NOW()),
(4, 'AI / Machine Learning Engineer', 'Develops predictive models, data pipelines, feature stores, and deploys production machine learning inference services.', 'Artificial Intelligence', '$110,000 - $175,000', TRUE, NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 4. Career Required Skills (with weights and minimum proficiency levels 1-5)
INSERT INTO career_required_skills (id, career_id, skill_id, min_proficiency, weight, is_required) VALUES
-- Full Stack: Java (req 3, w 1.2), React (req 3, w 1.5), Spring Boot (req 3, w 1.3), MySQL (req 2, w 1.0), Git (req 2, w 0.8)
(1, 1, 1, 3, 1.2, TRUE),
(2, 1, 4, 3, 1.5, TRUE),
(3, 1, 5, 3, 1.3, TRUE),
(4, 1, 8, 2, 1.0, TRUE),
(5, 1, 12, 2, 0.8, TRUE),
-- Backend: Java (req 4, w 1.5), Spring Boot (req 4, w 1.5), PostgreSQL (req 3, w 1.2), Docker (req 2, w 1.0), System Design (req 3, w 1.4)
(6, 2, 1, 4, 1.5, TRUE),
(7, 2, 5, 4, 1.5, TRUE),
(8, 2, 9, 3, 1.2, TRUE),
(9, 2, 6, 2, 1.0, TRUE),
(10, 2, 11, 3, 1.4, TRUE),
-- Cloud DevOps: Docker (req 3, w 1.5), Kubernetes (req 3, w 1.5), Python (req 2, w 1.0), Git (req 3, w 1.0)
(11, 3, 6, 3, 1.5, TRUE),
(12, 3, 7, 3, 1.5, TRUE),
(13, 3, 2, 2, 1.0, TRUE),
(14, 3, 12, 3, 1.0, TRUE),
-- AI / ML: Python (req 4, w 1.5), Machine Learning (req 4, w 1.5), PostgreSQL (req 2, w 0.9)
(15, 4, 2, 4, 1.5, TRUE),
(16, 4, 10, 4, 1.5, TRUE),
(17, 4, 9, 2, 0.9, TRUE)
ON DUPLICATE KEY UPDATE min_proficiency=VALUES(min_proficiency);

-- 5. Skill Assessments
INSERT INTO assessments (id, title, description, skill_id, difficulty, time_limit_minutes, passing_score, is_active, created_at) VALUES
(1, 'Java Foundations & OOP Principles', 'Assess mastery of object-oriented concepts, JVM memory models, collections, and exception handling.', 1, 'INTERMEDIATE', 30, 70, TRUE, NOW()),
(2, 'Spring Boot & Microservices Mastery', 'Assess dependency injection, Spring Data JPA, RESTful controllers, security configurations, and transactional boundaries.', 5, 'INTERMEDIATE', 30, 70, TRUE, NOW()),
(3, 'React & Modern Frontend Architecture', 'Assess hooks, virtual DOM reconciliation, state management, and component lifecycles.', 4, 'INTERMEDIATE', 30, 70, TRUE, NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 6. Assessment Questions
INSERT INTO assessment_questions (id, assessment_id, question_text, question_type, points, order_index) VALUES
-- Java Questions
(1, 1, 'Which Java memory region is used to store objects created using the "new" operator?', 'SINGLE_CHOICE', 1, 0),
(2, 1, 'What is the key difference between HashMap and ConcurrentHashMap in Java?', 'SINGLE_CHOICE', 1, 1),
(3, 1, 'What does the "transient" keyword signify when applied to a class field?', 'SINGLE_CHOICE', 1, 2),
-- Spring Boot Questions
(4, 2, 'Which annotation is used to declare a service layer transaction boundary in Spring?', 'SINGLE_CHOICE', 1, 0),
(5, 2, 'How does Spring Boot configure default datasources automatically?', 'SINGLE_CHOICE', 1, 1),
-- React Questions
(6, 3, 'When does the useEffect hook execute if its dependency array is empty ([])?', 'SINGLE_CHOICE', 1, 0),
(7, 3, 'What is the primary benefit of the React Virtual DOM?', 'SINGLE_CHOICE', 1, 1)
ON DUPLICATE KEY UPDATE question_text=VALUES(question_text);

-- 7. Assessment Options (Answer Keys)
INSERT INTO assessment_options (id, question_id, option_text, is_correct, order_index) VALUES
-- Q1
(1, 1, 'Heap Memory', TRUE, 0),
(2, 1, 'Stack Memory', FALSE, 1),
(3, 1, 'Method Area', FALSE, 2),
(4, 1, 'Program Counter Register', FALSE, 3),
-- Q2
(5, 2, 'ConcurrentHashMap uses synchronized segments/locks for thread-safe concurrent access without locking the whole map', TRUE, 0),
(6, 2, 'HashMap is synchronized while ConcurrentHashMap is non-synchronized', FALSE, 1),
(7, 2, 'ConcurrentHashMap permits duplicate keys while HashMap does not', FALSE, 2),
(8, 2, 'There is no difference in concurrency semantics', FALSE, 3),
-- Q3
(9, 3, 'The field is skipped during object serialization', TRUE, 0),
(10, 3, 'The field is stored in CPU registers', FALSE, 1),
(11, 3, 'The field cannot be modified once initialized', FALSE, 2),
(12, 3, 'The field is garbage-collected immediately after method execution', FALSE, 3),
-- Q4
(13, 4, '@Transactional', TRUE, 0),
(14, 4, '@ServiceBoundary', FALSE, 1),
(15, 4, '@CommitOnSuccess', FALSE, 2),
(16, 4, '@EnableTransactionManagement', FALSE, 3),
-- Q5
(17, 5, 'Through @EnableAutoConfiguration evaluating class presence (e.g. HikariCP and MySQL driver on classpath)', TRUE, 0),
(18, 5, 'By inspecting the operating system ODBC registry', FALSE, 1),
(19, 5, 'By generating an in-memory XML descriptor at build time', FALSE, 2),
(20, 5, 'Spring Boot does not support auto-configuration for datasources', FALSE, 3),
-- Q6
(21, 6, 'Only once after the initial render (component mount)', TRUE, 0),
(22, 6, 'After every state change', FALSE, 1),
(23, 6, 'Before the JSX is parsed into DOM elements', FALSE, 2),
(24, 6, 'Only when the parent component unmounts', FALSE, 3),
-- Q7
(25, 7, 'Minimizes costly real DOM reflows and repaints through batch diffing', TRUE, 0),
(26, 7, 'Replaces browser CSS rendering entirely', FALSE, 1),
(27, 7, 'Allows direct kernel memory access from web workers', FALSE, 2),
(28, 7, 'Enforces synchronous multi-threading in JavaScript', FALSE, 3)
ON DUPLICATE KEY UPDATE option_text=VALUES(option_text);

-- 8. Industry Skill Trends
INSERT INTO industry_skill_trends (id, skill_id, industry_sector, demand_score, growth_rate_percent, average_salary_min, average_salary_max, job_postings_count, top_locations, trend_year, trend_quarter, updated_at) VALUES
(1, 1, 'Software Engineering', 92.5, 14.8, 90000, 145000, 48200, 'San Francisco, Seattle, Austin, Bengaluru, London', 2026, 'Q4', NOW()),
(2, 5, 'Enterprise Cloud & FinTech', 94.0, 18.2, 98000, 155000, 39500, 'New York, San Jose, Berlin, Singapore, Boston', 2026, 'Q4', NOW()),
(3, 4, 'Consumer Tech & SaaS', 91.0, 16.5, 85000, 140000, 51000, 'Remote, Austin, Toronto, Seattle, Tel Aviv', 2026, 'Q4', NOW()),
(4, 6, 'Cloud Infrastructure & DevOps', 95.8, 22.4, 102000, 165000, 42100, 'Remote, San Francisco, Chicago, London, Tokyo', 2026, 'Q4', NOW()),
(5, 10, 'Artificial Intelligence', 98.4, 38.6, 120000, 190000, 62000, 'San Francisco, Seattle, New York, Zurich, Bengaluru', 2026, 'Q4', NOW())
ON DUPLICATE KEY UPDATE demand_score=VALUES(demand_score);

-- 9. Learning Resources
INSERT INTO learning_resources (id, title, description, url, provider, resource_type, cost_type, difficulty_level, estimated_duration_hours, rating, rating_count, skill_id, is_verified, created_at) VALUES
(1, 'Java Programming Masterclass 2026', 'Comprehensive course covering OOP, multithreading, lambdas, streams, and modern Java features.', 'https://www.udemy.com/course/java-programming-masterclass', 'Udemy', 'COURSE', 'PAID', 'BEGINNER', 48, 4.8, 1250, 1, TRUE, NOW()),
(2, 'Official Spring Boot Reference Guide', 'Official deep-dive documentation on Spring Boot features, production monitoring, and auto-configuration.', 'https://spring.io/projects/spring-boot', 'Spring.io', 'DOCUMENTATION', 'FREE', 'INTERMEDIATE', 20, 4.9, 3400, 5, TRUE, NOW()),
(3, 'Full Stack Open — Modern React Deep Dive', 'University of Helsinki free course on React, Redux, REST APIs, and automated testing.', 'https://fullstackopen.com/en/', 'Univ. of Helsinki', 'COURSE', 'FREE', 'INTERMEDIATE', 60, 4.9, 5800, 4, TRUE, NOW()),
(4, 'Docker for Developers: From Novice to Production', 'Hands-on guide to containerizing microservices, writing multi-stage Dockerfiles, and compose stacks.', 'https://docs.docker.com/get-started/', 'Docker Official', 'DOCUMENTATION', 'FREE', 'BEGINNER', 15, 4.7, 2100, 6, TRUE, NOW()),
(5, 'Designing Data-Intensive Applications', 'The definitive architectural book on reliability, scalability, and maintainability by Martin Kleppmann.', 'https://dataintensive.net/', 'OReilly Media', 'BOOK', 'PAID', 'ADVANCED', 35, 5.0, 9800, 11, TRUE, NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 10. Opportunities (Jobs, Internships, Scholarships, Hackathons)
INSERT INTO opportunities (id, title, organization, opportunity_type, location, is_remote, employment_type, experience_level, salary_min, salary_max, stipend, application_url, deadline, description, requirements_text, source, is_active, created_at) VALUES
(1, 'Software Engineer — Backend Platform', 'Stripe', 'JOB', 'San Francisco, CA', TRUE, 'FULL_TIME', 'ENTRY_LEVEL', 120000, 160000, NULL, 'https://stripe.com/jobs', '2026-12-31 23:59:59', 'Build mission-critical payment processing and microservice backends supporting millions of global transactions.', 'Solid foundation in Java or Python, relational databases, and REST APIs.', 'Company Careers', TRUE, NOW()),
(2, 'Summer 2027 Engineering Intern', 'Google', 'INTERNSHIP', 'Mountain View, CA', FALSE, 'PART_TIME', 'INTERNSHIP', NULL, NULL, '$8,500 / month', 'https://careers.google.com/students', '2026-11-30 23:59:59', '12-week summer internship collaborating with senior software engineers on scalable cloud applications.', 'Pursuing Bachelor or Master in CS, proficiency in Java, Python, or C++, strong DSA fundamentals.', 'Campus Outreach', TRUE, NOW()),
(3, 'Global AI & Web Innovation Hackathon', 'Major League Hacking', 'HACKATHON', 'Online / Virtual', TRUE, 'CONTRACT', 'ENTRY_LEVEL', NULL, NULL, '$25,000 Total Prizes', 'https://mlh.io/seasons/2026/events', '2026-11-20 18:00:00', '48-hour global virtual hackathon building full-stack applications with AI agent integration.', 'Open to all engineering students worldwide.', 'MLH', TRUE, NOW()),
(4, 'Women in Engineering Tech Fellowship', 'AnitaB.org', 'SCHOLARSHIP', 'National', TRUE, 'CONTRACT', 'ENTRY_LEVEL', NULL, NULL, '$10,000 Tuition Grant', 'https://anitab.org/fellowships', '2026-12-15 23:59:59', 'Merit and need-based fellowship grant honoring academic excellence and leadership in engineering.', 'Full-time enrolled undergraduate in engineering or computer science.', 'Non-Profit Partner', TRUE, NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 11. Opportunity Required Skills
INSERT INTO opportunity_skills (id, opportunity_id, skill_id, is_required, min_proficiency) VALUES
(1, 1, 1, TRUE, 3),   -- Stripe: Java
(2, 1, 5, TRUE, 3),   -- Stripe: Spring Boot
(3, 1, 9, TRUE, 2),   -- Stripe: PostgreSQL
(4, 2, 1, TRUE, 2),   -- Google: Java
(5, 2, 12, TRUE, 2),  -- Google: Git
(6, 3, 4, TRUE, 2),   -- Hackathon: React
(7, 3, 2, TRUE, 2)    -- Hackathon: Python
ON DUPLICATE KEY UPDATE is_required=VALUES(is_required);
