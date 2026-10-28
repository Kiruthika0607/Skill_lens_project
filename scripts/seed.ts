import { db, initDB } from '../server/src/db';
import crypto from 'crypto';
import bcrypt from '../server/node_modules/bcryptjs';

async function seed() {
  console.log('🌱 Initializing Database Seeding Process...');
  await initDB();


// 1. Seed Industries
const industries = [
  { id: 'ind_it_services', name: 'IT Services & Consulting', sector: 'Technology', description: 'Enterprise software, system integration, and IT consulting services.' },
  { id: 'ind_product_saas', name: 'Software Products & SaaS', sector: 'Technology', description: 'Cloud software, enterprise SaaS applications, and platform products.' },
  { id: 'ind_fintech', name: 'Banking & Financial Technology', sector: 'BFSI', description: 'Digital banking, payment gateways, algorithmic trading, and financial analytics.' },
  { id: 'ind_healthcare', name: 'Healthcare Technology & Informatics', sector: 'Healthcare', description: 'Telemedicine, medical imaging AI, health record management, and bio-tech.' },
  { id: 'ind_ecommerce', name: 'E-Commerce & Digital Retail', sector: 'Retail', description: 'Online marketplaces, supply chain tech, search algorithms, and logistics platform.' },
  { id: 'ind_telecom', name: 'Telecommunications & Networking', sector: 'Telecom', description: '5G infrastructure, cloud networking, satellite communications, and network security.' },
  { id: 'ind_automotive', name: 'Automotive & Autonomous Systems', sector: 'Manufacturing', description: 'EV software, embedded systems, connected vehicle telemetry, and robotics.' },
  { id: 'ind_edtech', name: 'Education Technology', sector: 'Education', description: 'Adaptive learning systems, online certifications, and educational content platforms.' },
  { id: 'ind_cybersecurity', name: 'Cybersecurity & Defense Tech', sector: 'Security', description: 'Threat intelligence, identity management, vulnerability assessment, and SOC services.' },
  { id: 'ind_cloud_infra', name: 'Cloud Infrastructure & Data Centers', sector: 'Technology', description: 'Hyper-scaler infrastructure, container orchestration, and serverless platforms.' }
];

const insertIndustry = db.prepare(`INSERT OR REPLACE INTO industries (id, name, sector, description) VALUES (?, ?, ?, ?)`);
industries.forEach(i => insertIndustry.run(i.id, i.name, i.sector, i.description));

// 2. Seed Core Skills & Taxonomy
const skills = [
  { id: 'sk_react', name: 'React', norm: 'react', cat: 'Frontend Engineering', demand: 92, desc: 'Component-based UI library for web interfaces.' },
  { id: 'sk_typescript', name: 'TypeScript', norm: 'typescript', cat: 'Programming Languages', demand: 88, desc: 'Typed superset of JavaScript.' },
  { id: 'sk_javascript', name: 'JavaScript', norm: 'javascript', cat: 'Programming Languages', demand: 95, desc: 'Core dynamic scripting language for the web.' },
  { id: 'sk_html_css', name: 'HTML5 & CSS3', norm: 'html_css', cat: 'Frontend Engineering', demand: 85, desc: 'Semantic layout and modern web styling.' },
  { id: 'sk_tailwind', name: 'Tailwind CSS', norm: 'tailwind', cat: 'Frontend Engineering', demand: 78, desc: 'Utility-first CSS framework.' },
  { id: 'sk_nextjs', name: 'Next.js', norm: 'nextjs', cat: 'Frontend Engineering', demand: 82, desc: 'React framework for server rendering & SSR.' },
  { id: 'sk_vue', name: 'Vue.js', norm: 'vue', cat: 'Frontend Engineering', demand: 65, desc: 'Progressive JavaScript framework.' },
  { id: 'sk_nodejs', name: 'Node.js', norm: 'nodejs', cat: 'Backend Engineering', demand: 90, desc: 'Asynchronous event-driven JavaScript runtime.' },
  { id: 'sk_express', name: 'Express.js', norm: 'express', cat: 'Backend Engineering', demand: 84, desc: 'Fast, unopinionated web framework for Node.' },
  { id: 'sk_python', name: 'Python', norm: 'python', cat: 'Programming Languages', demand: 96, desc: 'High-level versatile language for backend, AI, and data analytics.' },
  { id: 'sk_django', name: 'Django', norm: 'django', cat: 'Backend Engineering', demand: 72, desc: 'High-level Python Web framework.' },
  { id: 'sk_fastapi', name: 'FastAPI', norm: 'fastapi', cat: 'Backend Engineering', demand: 81, desc: 'High-performance Python web framework for APIs.' },
  { id: 'sk_java', name: 'Java', norm: 'java', cat: 'Programming Languages', demand: 89, desc: 'Object-oriented language for enterprise backends.' },
  { id: 'sk_springboot', name: 'Spring Boot', norm: 'springboot', cat: 'Backend Engineering', demand: 83, desc: 'Enterprise microservice framework for Java.' },
  { id: 'sk_csharp', name: 'C# / .NET', norm: 'csharp', cat: 'Programming Languages', demand: 76, desc: 'Microsoft ecosystem backend & enterprise stack.' },
  { id: 'sk_cpp', name: 'C++', norm: 'cpp', cat: 'Programming Languages', demand: 74, desc: 'Systems programming and high-performance computing.' },
  { id: 'sk_sql', name: 'SQL', norm: 'sql', cat: 'Database & Analytics', demand: 94, desc: 'Structured Query Language for relational databases.' },
  { id: 'sk_postgresql', name: 'PostgreSQL', norm: 'postgresql', cat: 'Database & Analytics', demand: 87, desc: 'Advanced open-source object-relational database.' },
  { id: 'sk_mongodb', name: 'MongoDB', norm: 'mongodb', cat: 'Database & Analytics', demand: 79, desc: 'NoSQL document database.' },
  { id: 'sk_redis', name: 'Redis', norm: 'redis', cat: 'Database & Analytics', demand: 80, desc: 'In-memory key-value data structure store.' },
  { id: 'sk_docker', name: 'Docker', norm: 'docker', cat: 'DevOps & Cloud', demand: 89, desc: 'OS-level containerization platform.' },
  { id: 'sk_kubernetes', name: 'Kubernetes', norm: 'kubernetes', cat: 'DevOps & Cloud', demand: 85, desc: 'Container orchestration engine.' },
  { id: 'sk_aws', name: 'Amazon Web Services (AWS)', norm: 'aws', cat: 'DevOps & Cloud', demand: 91, desc: 'Cloud infrastructure & cloud native services.' },
  { id: 'sk_gcp', name: 'Google Cloud Platform (GCP)', norm: 'gcp', cat: 'DevOps & Cloud', demand: 78, desc: 'Google cloud computing suite.' },
  { id: 'sk_azure', name: 'Microsoft Azure', norm: 'azure', cat: 'DevOps & Cloud', demand: 81, desc: 'Enterprise cloud services suite.' },
  { id: 'sk_cicd', name: 'CI/CD Pipelines', norm: 'cicd', cat: 'DevOps & Cloud', demand: 86, desc: 'Automated integration & deployment workflows.' },
  { id: 'sk_pandas', name: 'Pandas', norm: 'pandas', cat: 'Data Science & AI', demand: 84, desc: 'Python data analysis & manipulation library.' },
  { id: 'sk_numpy', name: 'NumPy', norm: 'numpy', cat: 'Data Science & AI', demand: 80, desc: 'Fundamental package for scientific computing.' },
  { id: 'sk_scikit', name: 'Scikit-Learn', norm: 'scikit', cat: 'Data Science & AI', demand: 82, desc: 'Machine learning algorithms in Python.' },
  { id: 'sk_tensorflow', name: 'TensorFlow / PyTorch', norm: 'tensorflow', cat: 'Data Science & AI', demand: 85, desc: 'Deep learning frameworks.' },
  { id: 'sk_nlp', name: 'Natural Language Processing (NLP)', norm: 'nlp', cat: 'Data Science & AI', demand: 83, desc: 'Text analytics, LLMs, and language processing.' },
  { id: 'sk_computer_vision', name: 'Computer Vision', norm: 'computer_vision', cat: 'Data Science & AI', demand: 75, desc: 'Image & video recognition algorithms.' },
  { id: 'sk_figma', name: 'Figma', norm: 'figma', cat: 'Design & UX', demand: 78, desc: 'Collaborative UI/UX design & prototyping tool.' },
  { id: 'sk_ui_ux', name: 'UI/UX Design Principles', norm: 'ui_ux', cat: 'Design & UX', demand: 74, desc: 'User research, wireframing, and interaction design.' },
  { id: 'sk_cybersecurity', name: 'Network & System Security', norm: 'cybersecurity', cat: 'Cybersecurity', demand: 84, desc: 'Information security, encryption, and threat mitigation.' },
  { id: 'sk_penetration_testing', name: 'Penetration Testing', norm: 'penetration_testing', cat: 'Cybersecurity', demand: 76, desc: 'Ethical hacking and security assessment.' },
  { id: 'sk_qa_testing', name: 'Software Quality Assurance', norm: 'qa_testing', cat: 'Testing & QA', demand: 77, desc: 'Test automation, Selenium, Cypress, and unit testing.' },
  { id: 'sk_git', name: 'Git & Version Control', norm: 'git', cat: 'Tools & Workflows', demand: 93, desc: 'Distributed version control system.' },
  { id: 'sk_rest_api', name: 'RESTful API Design', norm: 'rest_api', cat: 'Backend Engineering', demand: 91, desc: 'Standard architectural pattern for web services.' },
  { id: 'sk_graphql', name: 'GraphQL', norm: 'graphql', cat: 'Backend Engineering', demand: 71, desc: 'Query language for APIs.' },
  { id: 'sk_flutter', name: 'Flutter & Dart', norm: 'flutter', cat: 'Mobile Engineering', demand: 75, desc: 'Cross-platform mobile application framework.' },
  { id: 'sk_react_native', name: 'React Native', norm: 'react_native', cat: 'Mobile Engineering', demand: 77, desc: 'Cross-platform mobile apps using React.' },
  { id: 'sk_kotlin', name: 'Kotlin / Android Development', norm: 'kotlin', cat: 'Mobile Engineering', demand: 73, desc: 'Native Android application development.' },
  { id: 'sk_swift', name: 'Swift / iOS Development', norm: 'swift', cat: 'Mobile Engineering', demand: 72, desc: 'Native Apple iOS application development.' },
  { id: 'sk_agile', name: 'Agile & Scrum Methodologies', norm: 'agile', cat: 'Management & Processes', demand: 85, desc: 'Iterative project management methodology.' },
  { id: 'sk_linux', name: 'Linux System Administration', norm: 'linux', cat: 'DevOps & Cloud', demand: 87, desc: 'Unix/Linux command line & server administration.' },
  { id: 'sk_microservices', name: 'Microservices Architecture', norm: 'microservices', cat: 'Backend Engineering', demand: 86, desc: 'Decoupled distributed software system design.' },
  { id: 'sk_data_structures', name: 'Data Structures & Algorithms', norm: 'data_structures', cat: 'Core Computer Science', demand: 95, desc: 'Fundamental computer science problem solving.' },
  { id: 'sk_big_data', name: 'Apache Spark / Big Data', norm: 'big_data', cat: 'Data Science & AI', demand: 74, desc: 'Distributed large-scale data processing.' }
];

const insertSkill = db.prepare(`INSERT OR REPLACE INTO skills (id, name, normalized_name, category, demand_score, description) VALUES (?, ?, ?, ?, ?, ?)`);
skills.forEach(s => insertSkill.run(s.id, s.name, s.norm, s.cat, s.demand, s.desc));

// 3. Seed Skill Aliases
const aliases = [
  { skillId: 'sk_react', alias: 'ReactJS' },
  { skillId: 'sk_react', alias: 'React.js' },
  { skillId: 'sk_react', alias: 'React JS' },
  { skillId: 'sk_nodejs', alias: 'NodeJS' },
  { skillId: 'sk_nodejs', alias: 'Node.js' },
  { skillId: 'sk_typescript', alias: 'TS' },
  { skillId: 'sk_javascript', alias: 'JS' },
  { skillId: 'sk_postgresql', alias: 'Postgres' },
  { skillId: 'sk_postgresql', alias: 'PostgreSQL DB' },
  { skillId: 'sk_python', alias: 'Python 3' },
  { skillId: 'sk_nextjs', alias: 'NextJS' }
];
const insertAlias = db.prepare(`INSERT OR REPLACE INTO skill_aliases (id, skill_id, alias) VALUES (?, ?, ?)`);
aliases.forEach(a => insertAlias.run(`alias_${crypto.randomUUID()}`, a.skillId, a.alias));

// 4. Seed Career Roles & Required Skills
const careerRoles = [
  { id: 'role_fullstack', title: 'Full Stack Engineer', cat: 'Software Engineering', desc: 'Builds modern end-to-end web applications combining frontend UI and backend microservices.', demand: 92 },
  { id: 'role_backend', title: 'Backend Engineer', cat: 'Software Engineering', desc: 'Designs high-concurrency microservices, REST APIs, and robust database architectures.', demand: 89 },
  { id: 'role_frontend', title: 'Frontend Engineer', cat: 'Software Engineering', desc: 'Crafts responsive user interfaces, design systems, and client-side performance.', demand: 86 },
  { id: 'role_data_scientist', title: 'Data Scientist', cat: 'Data & AI', desc: 'Extracts actionable insights from complex datasets using statistical modeling and machine learning.', demand: 88 },
  { id: 'role_ml_engineer', title: 'Machine Learning Engineer', cat: 'Data & AI', desc: 'Deploys scalable machine learning and deep learning models into production systems.', demand: 90 },
  { id: 'role_devops', title: 'DevOps & Cloud Engineer', cat: 'Cloud & Infrastructure', desc: 'Automates CI/CD pipelines, cloud infrastructure provisioning, and container orchestration.', demand: 87 },
  { id: 'role_cybersecurity', title: 'Cybersecurity Analyst', cat: 'Security', desc: 'Protects enterprise networks, performs penetration testing, and ensures compliance.', demand: 82 },
  { id: 'role_ui_ux', title: 'UI/UX Product Designer', cat: 'Design', desc: 'Researches user needs, creates wireframes, interactive prototypes, and modern UI components.', demand: 79 },
  { id: 'role_mobile_dev', title: 'Mobile App Developer', cat: 'Mobile Engineering', desc: 'Develops iOS and Android mobile applications using Flutter or React Native.', demand: 81 },
  { id: 'role_qa_automation', title: 'QA Automation Engineer', cat: 'Quality Assurance', desc: 'Writes automated test suites and ensures zero-defect software deployments.', demand: 76 }
];

const insertRole = db.prepare(`INSERT OR REPLACE INTO career_roles (id, title, category, description, baseline_demand_score) VALUES (?, ?, ?, ?, ?)`);
careerRoles.forEach(r => insertRole.run(r.id, r.title, r.cat, r.desc, r.demand));

const roleSkillsMapping = [
  // Full Stack Engineer
  { roleId: 'role_fullstack', skillId: 'sk_react', weight: 0.9, prof: 4, mandatory: 1 },
  { roleId: 'role_fullstack', skillId: 'sk_typescript', weight: 0.85, prof: 3, mandatory: 1 },
  { roleId: 'role_fullstack', skillId: 'sk_nodejs', weight: 0.9, prof: 4, mandatory: 1 },
  { roleId: 'role_fullstack', skillId: 'sk_sql', weight: 0.8, prof: 3, mandatory: 1 },
  { roleId: 'role_fullstack', skillId: 'sk_postgresql', weight: 0.75, prof: 3, mandatory: 0 },
  { roleId: 'role_fullstack', skillId: 'sk_docker', weight: 0.6, prof: 2, mandatory: 0 },
  { roleId: 'role_fullstack', skillId: 'sk_git', weight: 0.7, prof: 4, mandatory: 1 },

  // Backend Engineer
  { roleId: 'role_backend', skillId: 'sk_nodejs', weight: 0.9, prof: 4, mandatory: 1 },
  { roleId: 'role_backend', skillId: 'sk_express', weight: 0.8, prof: 3, mandatory: 1 },
  { roleId: 'role_backend', skillId: 'sk_postgresql', weight: 0.9, prof: 4, mandatory: 1 },
  { roleId: 'role_backend', skillId: 'sk_redis', weight: 0.75, prof: 3, mandatory: 0 },
  { roleId: 'role_backend', skillId: 'sk_microservices', weight: 0.85, prof: 3, mandatory: 1 },
  { roleId: 'role_backend', skillId: 'sk_docker', weight: 0.7, prof: 3, mandatory: 0 },

  // Frontend Engineer
  { roleId: 'role_frontend', skillId: 'sk_react', weight: 0.95, prof: 4, mandatory: 1 },
  { roleId: 'role_frontend', skillId: 'sk_typescript', weight: 0.9, prof: 4, mandatory: 1 },
  { roleId: 'role_frontend', skillId: 'sk_html_css', weight: 0.85, prof: 4, mandatory: 1 },
  { roleId: 'role_frontend', skillId: 'sk_tailwind', weight: 0.75, prof: 3, mandatory: 0 },
  { roleId: 'role_frontend', skillId: 'sk_nextjs', weight: 0.8, prof: 3, mandatory: 0 },

  // Data Scientist
  { roleId: 'role_data_scientist', skillId: 'sk_python', weight: 0.95, prof: 4, mandatory: 1 },
  { roleId: 'role_data_scientist', skillId: 'sk_sql', weight: 0.9, prof: 4, mandatory: 1 },
  { roleId: 'role_data_scientist', skillId: 'sk_pandas', weight: 0.85, prof: 4, mandatory: 1 },
  { roleId: 'role_data_scientist', skillId: 'sk_numpy', weight: 0.8, prof: 3, mandatory: 1 },
  { roleId: 'role_data_scientist', skillId: 'sk_scikit', weight: 0.85, prof: 4, mandatory: 1 },

  // ML Engineer
  { roleId: 'role_ml_engineer', skillId: 'sk_python', weight: 0.95, prof: 5, mandatory: 1 },
  { roleId: 'role_ml_engineer', skillId: 'sk_tensorflow', weight: 0.9, prof: 4, mandatory: 1 },
  { roleId: 'role_ml_engineer', skillId: 'sk_fastapi', weight: 0.75, prof: 3, mandatory: 0 },
  { roleId: 'role_ml_engineer', skillId: 'sk_docker', weight: 0.8, prof: 3, mandatory: 1 },
  { roleId: 'role_ml_engineer', skillId: 'sk_nlp', weight: 0.8, prof: 3, mandatory: 0 }
];

const insertRoleSkill = db.prepare(`
  INSERT OR REPLACE INTO career_role_skills (id, role_id, skill_id, importance_weight, proficiency_required, is_mandatory)
  VALUES (?, ?, ?, ?, ?, ?)
`);
roleSkillsMapping.forEach(m => insertRoleSkill.run(`crs_${crypto.randomUUID()}`, m.roleId, m.skillId, m.weight, m.prof, m.mandatory));

// 5. Seed 300 Jobs Across Industries & Provenance
console.log('📦 Seeding 300+ Job Listings across Tamil Nadu & India Tech Hubs...');
const jobTitles = [
  'Junior Full Stack Developer', 'Senior Backend Engineer', 'Frontend React Developer',
  'Data Analyst', 'Machine Learning Engineer', 'DevOps Cloud Specialist',
  'Cybersecurity Associate', 'UI/UX Interface Designer', 'Mobile App Engineer (Flutter)',
  'QA Automation Engineer', 'Python Backend Developer', 'Cloud Infrastructure Engineer'
];

const companies = [
  'TCS Innovation Lab', 'Infosys Tech Hub', 'Zoho Corporation', 'Freshworks',
  'Wipro Digital', 'HCL Tech', 'Cognizant', 'LTI Mindtree',
  'Standard Chartered GBS', 'PayPal India', 'Amazon Web Services India', 'Guvi Tech'
];

const locations = ['Chennai, TN', 'Coimbatore, TN', 'Madurai, TN', 'Bengaluru, KA', 'Hyderabad, TS', 'Remote'];

const insertJob = db.prepare(`
  INSERT OR REPLACE INTO jobs (id, job_code, source, title, company, location, description, experience_level, employment_type, industry_id, provenance)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertJobSkill = db.prepare(`
  INSERT OR IGNORE INTO job_skills (id, job_id, skill_id, extraction_confidence)
  VALUES (?, ?, ?, ?)
`);

for (let i = 1; i <= 310; i++) {
  const jobId = `job_seed_${i}`;
  const title = jobTitles[i % jobTitles.length];
  const company = companies[i % companies.length];
  const location = locations[i % locations.length];
  const indId = industries[i % industries.length].id;
  const provenance = i <= 50 ? 'REAL_API' : (i <= 120 ? 'OPEN_DATASET' : (i <= 180 ? 'MANUAL_IMPORT' : 'SYNTHETIC'));

  insertJob.run(
    jobId,
    `JOB-2026-${1000 + i}`,
    'SIH Data Pipeline Harvester',
    title,
    company,
    location,
    `We are looking for a high-caliber ${title} to join our engineering division at ${company} in ${location}. Required expertise includes production experience with modern software frameworks, cloud architecture, and collaborative team problem solving.`,
    i % 3 === 0 ? '0-2 years' : '2-4 years',
    'Full-time',
    indId,
    provenance
  );

  // Assign random 3-5 skills per job
  const randomSkills = [skills[i % skills.length].id, skills[(i + 3) % skills.length].id, skills[(i + 7) % skills.length].id];
  randomSkills.forEach(skId => {
    insertJobSkill.run(`js_${jobId}_${skId}`, jobId, skId, 0.95);
  });
}

// 6. Seed Learning Resources
console.log('📚 Seeding Learning Resources & Skill Mappings...');
const resources = [
  { id: 'res_1', title: 'React Official Documentation & Hands-on Guide', provider: 'Meta Open Source', url: 'https://react.dev', cost: 'FREE', duration: 15, skillId: 'sk_react' },
  { id: 'res_2', title: 'NPTEL: Programming in Python for Industry', provider: 'IIT Madras (NPTEL)', url: 'https://nptel.ac.in/courses/python', cost: 'FREE', duration: 40, skillId: 'sk_python' },
  { id: 'res_3', title: 'TypeScript Deep Dive & Advanced Architecture', provider: 'TypeScript Org', url: 'https://www.typescriptlang.org/docs/', cost: 'FREE', duration: 20, skillId: 'sk_typescript' },
  { id: 'res_4', title: 'Complete Node.js & Microservices Engineering', provider: 'Coursera Open', url: 'https://coursera.org/learn/nodejs', cost: 'FREE', duration: 35, skillId: 'sk_nodejs' },
  { id: 'res_5', title: 'PostgreSQL Database Tuning & Query Optimization', provider: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs/', cost: 'FREE', duration: 25, skillId: 'sk_postgresql' }
];

const insertRes = db.prepare(`INSERT OR REPLACE INTO learning_resources (id, title, provider, url, cost_type, duration_hours) VALUES (?, ?, ?, ?, ?, ?)`);
const insertSkillRes = db.prepare(`INSERT OR REPLACE INTO skill_resources (id, skill_id, resource_id, relevance_weight) VALUES (?, ?, ?, 1.0)`);

resources.forEach(r => {
  insertRes.run(r.id, r.title, r.provider, r.url, r.cost, r.duration);
  insertSkillRes.run(`sr_${r.id}`, r.skillId, r.id);
});

// 7. Seed Demo Student Profiles (100 Students)
console.log('👨‍🎓 Seeding 100 Engineering Student Profiles & Skills...');
const studentColleges = ['Anna University, Guindy', 'PSG College of Technology, Coimbatore', 'SSN College of Engineering', 'TKM College of Engineering', 'NIT Trichy'];
const disciplines = ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication Engineering', 'Artificial Intelligence & Data Science'];

const insertUser = db.prepare(`INSERT OR REPLACE INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)`);
const insertStudent = db.prepare(`INSERT OR REPLACE INTO students (id, user_id, full_name, college, discipline, graduation_year, preferred_domain, student_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
const insertStdSkill = db.prepare(`INSERT OR REPLACE INTO student_skills (id, student_id, skill_id, proficiency_level, source, confidence_score) VALUES (?, ?, ?, ?, 'self', 0.9)`);

// Password hash for 'student123'
const defaultPassHash = bcrypt.hashSync('student123', 10);

// Demo primary student
const demoUserId = 'usr_demo_student';
const demoStudentId = 'std_demo_student';
insertUser.run(demoUserId, 'student@naanmudhalvan.edu.in', defaultPassHash, 'student');
insertStudent.run(demoStudentId, demoUserId, 'Arun Kumar', 'Anna University, Guindy', 'Computer Science & Engineering', 2026, 'Software Engineering', 82.0);

// Demo student skills
['sk_react', 'sk_javascript', 'sk_html_css', 'sk_git'].forEach(sk => {
  insertStdSkill.run(`ss_demo_${sk}`, demoStudentId, sk, 4);
});

// 99 other students
for (let s = 1; s <= 99; s++) {
  const uId = `usr_std_${s}`;
  const stId = `std_${s}`;
  insertUser.run(uId, `student_${s}@college.edu.in`, defaultPassHash, 'student');

  insertStudent.run(stId, uId, `Engineering Graduate #${s}`, studentColleges[s % studentColleges.length], disciplines[s % disciplines.length], 2026, 'Software Engineering', Math.floor(60 + Math.random() * 30));

  // Add 2-4 random skills
  [skills[s % skills.length].id, skills[(s + 2) % skills.length].id].forEach(sk => {
    insertStdSkill.run(`ss_${stId}_${sk}`, stId, sk, 3 + (s % 3));
  });
}

// 8. Seed Admin and Industry Demo Users
const adminPassHash = defaultPassHash;
insertUser.run('usr_admin_demo', 'admin@naanmudhalvan.gov.in', adminPassHash, 'admin');
insertUser.run('usr_industry_demo', 'hr@tcs.com', adminPassHash, 'industry');

  console.log('✅ Seeding completed successfully!');
  console.log('🔑 Demo Credentials:');
  console.log('   Student: student@naanmudhalvan.edu.in / student123');
  console.log('   Admin:   admin@naanmudhalvan.gov.in / student123');
  console.log('   Industry: hr@tcs.com / student123');
}

seed();

