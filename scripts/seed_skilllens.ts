import { db, initDB } from '../server/src/db';

async function seedSkillLens() {
  console.log('🌱 Seeding SkillLens Extended Dataset...');
  await initDB();

  // 1. Create tables if they don't exist
  db.prepare(`
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
    )
  `).run();

  db.prepare(`
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
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      actor_id TEXT,
      actor_email TEXT,
      entity TEXT NOT NULL,
      details TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  db.prepare(`
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
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS student_target_careers (
      student_id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS student_notifications (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'INFO',
      read_status INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // 2. Seed Opportunities
  console.log('💼 Seeding Opportunities (Jobs, Internships, Scholarships, Hackathons)...');
  const insertOpp = db.prepare(`
    INSERT OR REPLACE INTO opportunities (
      id, title, organization, type, location, work_mode, deadline,
      eligibility, scope, setting, source_url, last_verified_at, status, stipend_or_reward, description, skills_required
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const opportunitiesList = [
    // Jobs
    {
      id: 'opp_job_1',
      title: 'Junior Full Stack Engineer',
      organization: 'Zoho Corporation',
      type: 'JOB',
      location: 'Chennai, TN',
      work_mode: 'ON_SITE',
      deadline: '2026-12-31',
      eligibility: 'B.E / B.Tech (CSE, IT, ECE), 2025/2026 batch',
      scope: 'NATIONAL',
      setting: 'OFFLINE',
      source_url: 'https://careers.zohocorp.com',
      last_verified_at: '2026-10-25',
      status: 'VERIFIED',
      stipend_or_reward: '₹6.5 - 9.0 LPA',
      description: 'Develop responsive client-facing web applications using React, modern JavaScript, and high-concurrency microservices.',
      skills_required: 'React, JavaScript, Node.js, SQL'
    },
    {
      id: 'opp_job_2',
      title: 'Graduate Software Engineer',
      organization: 'Tata Consultancy Services',
      type: 'JOB',
      location: 'Bangalore, KA',
      work_mode: 'HYBRID',
      deadline: '2026-11-30',
      eligibility: 'All Engineering Disciplines, Min 60% aggregate',
      scope: 'NATIONAL',
      setting: 'OFFLINE',
      source_url: 'https://ibegin.tcs.com',
      last_verified_at: '2026-10-24',
      status: 'VERIFIED',
      stipend_or_reward: '₹4.5 - 7.2 LPA',
      description: 'Enterprise systems modernizations, RESTful API design, and cloud database operations.',
      skills_required: 'Java, Spring Boot, SQL, Git'
    },
    {
      id: 'opp_job_3',
      title: 'Frontend Developer (Remote)',
      organization: 'Freshworks Inc',
      type: 'JOB',
      location: 'Remote, India',
      work_mode: 'REMOTE',
      deadline: '2026-12-15',
      eligibility: 'Passionate about modern component-driven UI and state management',
      scope: 'NATIONAL',
      setting: 'ONLINE',
      source_url: 'https://freshworks.com/careers',
      last_verified_at: '2026-10-26',
      status: 'VERIFIED',
      stipend_or_reward: '₹8.0 - 12.0 LPA',
      description: 'Build enterprise-grade SaaS design systems using TypeScript, React, and Tailwind CSS.',
      skills_required: 'TypeScript, React, Tailwind CSS, REST APIs'
    },
    {
      id: 'opp_job_4',
      title: 'Junior Cloud / DevOps Engineer',
      organization: 'Cognizant Technology Solutions',
      type: 'JOB',
      location: 'Coimbatore, TN',
      work_mode: 'HYBRID',
      deadline: '2026-11-20',
      eligibility: 'Graduating engineers with Linux and containerization fundamentals',
      scope: 'NATIONAL',
      setting: 'OFFLINE',
      source_url: 'https://careers.cognizant.com',
      last_verified_at: '2026-10-20',
      status: 'SAMPLE',
      stipend_or_reward: '₹5.5 - 8.0 LPA',
      description: 'Support cloud orchestration, Docker container deployments, and automated CI/CD pipelines.',
      skills_required: 'Docker, Linux, AWS, Git'
    },

    // Internships
    {
      id: 'opp_int_1',
      title: 'Software Development Intern (6 Months)',
      organization: 'Amazon India',
      type: 'INTERNSHIP',
      location: 'Hyderabad, TS',
      work_mode: 'HYBRID',
      deadline: '2026-11-15',
      eligibility: 'Pre-final and Final year B.Tech students',
      scope: 'NATIONAL',
      setting: 'OFFLINE',
      source_url: 'https://amazon.jobs/en/teams/internships-for-students',
      last_verified_at: '2026-10-27',
      status: 'VERIFIED',
      stipend_or_reward: '₹45,000 / month',
      description: 'Collaborate with senior SDEs on distributed backend services and AWS cloud services.',
      skills_required: 'Data Structures & Algorithms, Java, Python'
    },
    {
      id: 'opp_int_2',
      title: 'AI / Data Science Research Intern',
      organization: 'Robert Bosch Engineering',
      type: 'INTERNSHIP',
      location: 'Coimbatore, TN',
      work_mode: 'ON_SITE',
      deadline: '2026-12-05',
      eligibility: 'B.E/B.Tech with strong linear algebra and Python proficiency',
      scope: 'NATIONAL',
      setting: 'OFFLINE',
      source_url: 'https://bosch.in/careers',
      last_verified_at: '2026-10-22',
      status: 'VERIFIED',
      stipend_or_reward: '₹25,000 / month',
      description: 'Explore predictive telemetry modeling, sensor data analytics, and deep learning pipelines.',
      skills_required: 'Python, Pandas, NumPy, Scikit-Learn'
    },
    {
      id: 'opp_int_3',
      title: 'Full Stack React & Node Intern',
      organization: 'Razorpay',
      type: 'INTERNSHIP',
      location: 'Remote, India',
      work_mode: 'REMOTE',
      deadline: '2026-11-28',
      eligibility: 'Demonstrated open-source or project experience with full-stack web apps',
      scope: 'NATIONAL',
      setting: 'ONLINE',
      source_url: 'https://razorpay.com/jobs',
      last_verified_at: '2026-10-26',
      status: 'VERIFIED',
      stipend_or_reward: '₹35,000 / month',
      description: 'Build merchant dashboard modules and payment verification interfaces.',
      skills_required: 'React, Node.js, TypeScript, PostgreSQL'
    },
    {
      id: 'opp_int_4',
      title: 'UI/UX Design & Prototyping Intern',
      organization: 'Swiggy Design Labs',
      type: 'INTERNSHIP',
      location: 'Bangalore, KA',
      work_mode: 'HYBRID',
      deadline: '2026-10-31',
      eligibility: 'Portfolio with wireframes and user interaction cases',
      scope: 'NATIONAL',
      setting: 'OFFLINE',
      source_url: 'https://careers.swiggy.com',
      last_verified_at: '2026-10-18',
      status: 'PENDING',
      stipend_or_reward: '₹20,000 / month',
      description: 'User journey mapping, high-fidelity Figma components, and usability validation.',
      skills_required: 'Figma, UI/UX Principles, Wireframing'
    },

    // Scholarships
    {
      id: 'opp_sch_1',
      title: 'Naan Mudhalvan Industry Excellence Grant',
      organization: 'Tamil Nadu Skill Development Corporation (TNSDC)',
      type: 'SCHOLARSHIP',
      location: 'Tamil Nadu, India',
      work_mode: 'REMOTE',
      deadline: '2026-12-30',
      eligibility: 'Engineering undergraduates in affiliated colleges with verified skill readiness > 75%',
      scope: 'NATIONAL',
      setting: 'ONLINE',
      source_url: 'https://naanmudhalvan.tn.gov.in',
      last_verified_at: '2026-10-26',
      status: 'VERIFIED',
      stipend_or_reward: '₹50,000 Grant + Free NPTEL Certifications',
      description: 'Government scholarship recognizing engineering students who complete verified industry-skill pathways and demonstrate placement readiness.',
      skills_required: 'Verified Skill Roadmap Completion'
    },
    {
      id: 'opp_sch_2',
      title: 'Google Generation Scholarship (APAC)',
      organization: 'Google Asia Pacific',
      type: 'SCHOLARSHIP',
      location: 'International',
      work_mode: 'REMOTE',
      deadline: '2026-12-10',
      eligibility: 'Women studying Computer Science or related engineering degrees',
      scope: 'INTERNATIONAL',
      setting: 'ONLINE',
      source_url: 'https://buildyourfuture.withgoogle.com/scholarships',
      last_verified_at: '2026-10-21',
      status: 'VERIFIED',
      stipend_or_reward: '$2,500 USD (~₹2,05,000)',
      description: 'Recognizing academic excellence and technical leadership in computing and community contribution.',
      skills_required: 'Computer Science, Problem Solving, Leadership'
    },
    {
      id: 'opp_sch_3',
      title: 'Reliance Foundation Undergraduate Scholarship',
      organization: 'Reliance Foundation',
      type: 'SCHOLARSHIP',
      location: 'All India',
      work_mode: 'REMOTE',
      deadline: '2026-11-25',
      eligibility: 'First-to-third year undergraduates in engineering, tech, and sciences',
      scope: 'NATIONAL',
      setting: 'ONLINE',
      source_url: 'https://reliancefoundation.org',
      last_verified_at: '2026-10-15',
      status: 'VERIFIED',
      stipend_or_reward: 'Up to ₹2,00,000 across degree',
      description: 'Merit-cum-means scholarship for ambitious students aiming to develop national engineering capacity.',
      skills_required: 'Engineering Fundamentals, Academic Merit'
    },

    // Hackathons
    {
      id: 'opp_hck_1',
      title: 'Smart India Hackathon (SIH) 2026',
      organization: 'Ministry of Education & AICTE',
      type: 'HACKATHON',
      location: 'Multiple Centers across India',
      work_mode: 'HYBRID',
      deadline: '2026-11-20',
      eligibility: 'Undergraduate engineering student teams of 6 (min 1 female member)',
      scope: 'NATIONAL',
      setting: 'OFFLINE',
      source_url: 'https://sih.gov.in',
      last_verified_at: '2026-10-27',
      status: 'VERIFIED',
      stipend_or_reward: '₹1,00,000 Prize per Problem Statement',
      description: 'World largest open innovation model solving government and industry problem statements.',
      skills_required: 'Full Stack Development, AI/ML, Cloud Computing, IoT'
    },
    {
      id: 'opp_hck_2',
      title: 'HackNITR 6.0',
      organization: 'NIT Rourkela',
      type: 'HACKATHON',
      location: 'Online / Virtual',
      work_mode: 'REMOTE',
      deadline: '2026-11-12',
      eligibility: 'All college students globally',
      scope: 'INTERNATIONAL',
      setting: 'ONLINE',
      source_url: 'https://hacknitr.com',
      last_verified_at: '2026-10-25',
      status: 'VERIFIED',
      stipend_or_reward: '₹3,50,000 Total Prize Pool',
      description: '36-hour flagship student hackathon spanning Web3, Fintech, Healthcare, and Developer Tooling tracks.',
      skills_required: 'Web Dev, APIs, Mobile Dev, Git'
    },
    {
      id: 'opp_hck_3',
      title: 'Kavach Cybersecurity Hackathon',
      organization: 'MoE Innovation Cell',
      type: 'HACKATHON',
      location: 'IIT Madras Research Park, Chennai',
      work_mode: 'ON_SITE',
      deadline: '2026-12-01',
      eligibility: 'Engineering and cyber-security enthusiasts',
      scope: 'NATIONAL',
      setting: 'OFFLINE',
      source_url: 'https://kavach.mic.gov.in',
      last_verified_at: '2026-10-24',
      status: 'VERIFIED',
      stipend_or_reward: '₹1,50,000 1st Prize + Incubation Support',
      description: 'Build novel defensive security solutions, threat intelligence systems, and vulnerability assessment tools.',
      skills_required: 'Cybersecurity, Network Security, Python, Linux'
    }
  ];

  opportunitiesList.forEach(o => {
    insertOpp.run(
      o.id, o.title, o.organization, o.type, o.location, o.work_mode,
      o.deadline, o.eligibility, o.scope, o.setting, o.source_url,
      o.last_verified_at, o.status, o.stipend_or_reward, o.description, o.skills_required
    );
  });

  // 3. Seed AI Drafts for Admin Approval
  console.log('🤖 Seeding AI Drafts for Admin Review...');
  const insertDraft = db.prepare(`
    INSERT OR REPLACE INTO ai_drafts (id, entity_type, title, proposed_changes, confidence_score, status, reasoning)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const drafts = [
    {
      id: 'draft_1',
      entity_type: 'SKILL',
      title: 'Add "LangChain & LLM Orchestration" to AI Category',
      proposed_changes: JSON.stringify({
        action: 'ADD_SKILL',
        name: 'LangChain & LLM Orchestration',
        category: 'Data Science & AI',
        demandScore: 89,
        prerequisites: ['Python', 'RESTful API Design']
      }),
      confidence_score: 0.94,
      status: 'PENDING',
      reasoning: 'Mentioned in 42 new FinTech & SaaS job postings over the last 30 days.'
    },
    {
      id: 'draft_2',
      entity_type: 'CAREER',
      title: 'Update Required Skills for "Frontend Engineer"',
      proposed_changes: JSON.stringify({
        action: 'UPDATE_ROLE_SKILLS',
        roleTitle: 'Frontend Engineer',
        addMandatory: ['TypeScript'],
        increaseWeight: { React: 0.95, Tailwind: 0.85 }
      }),
      confidence_score: 0.91,
      status: 'PENDING',
      reasoning: 'TypeScript demand in frontend roles increased by +18.4% across 310 job postings.'
    },
    {
      id: 'draft_3',
      entity_type: 'RESOURCE',
      title: 'Link "NPTEL: Cloud Computing & Distributed Systems" to AWS',
      proposed_changes: JSON.stringify({
        action: 'LINK_RESOURCE',
        resourceTitle: 'NPTEL: Cloud Computing (IIT Kharagpur)',
        url: 'https://nptel.ac.in/courses/cloud',
        skillName: 'Amazon Web Services (AWS)',
        weight: 1.0
      }),
      confidence_score: 0.88,
      status: 'PENDING',
      reasoning: 'Verified academic course syllabus directly aligns with cloud infrastructure learning objectives.'
    }
  ];

  drafts.forEach(d => {
    insertDraft.run(d.id, d.entity_type, d.title, d.proposed_changes, d.confidence_score, d.status, d.reasoning);
  });

  // 4. Seed Audit Logs
  console.log('📜 Seeding System Audit Logs...');
  const insertAudit = db.prepare(`
    INSERT OR REPLACE INTO audit_logs (id, action, actor_id, actor_email, entity, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const sampleLogs = [
    { id: 'log_1', action: 'TAXONOMY_NORMALIZED', actor_id: 'system_crawler', actor_email: 'pipeline@skilllens.ai', entity: 'skills', details: 'Normalized 52 canonical skill entities across 310 job postings.' },
    { id: 'log_2', action: 'DEMAND_SNAPSHOT_COMPUTED', actor_id: 'system_engine', actor_email: 'engine@skilllens.ai', entity: 'demand_snapshots', details: 'Recomputed frequency and growth velocity indices for current month.' },
    { id: 'log_3', action: 'STUDENT_ASSESSMENT_VERIFIED', actor_id: 'usr_demo_student', actor_email: 'student@naanmudhalvan.edu.in', entity: 'assessments', details: 'Arun Kumar completed diagnostic assessment for React & Web Engineering (Band: Advanced).' },
    { id: 'log_4', action: 'ADMIN_DRAFT_APPROVED', actor_id: 'usr_admin_demo', actor_email: 'admin@naanmudhalvan.gov.in', entity: 'ai_drafts', details: 'Approved new skill relation: Node.js is prerequisite for Express.js.' }
  ];

  sampleLogs.forEach(l => {
    insertAudit.run(l.id, l.action, l.actor_id, l.actor_email, l.entity, l.details);
  });

  // 5. Seed Student Target Career
  const demoStudent = db.prepare(`SELECT id FROM students WHERE user_id = 'usr_demo_student'`).get() as any;
  if (demoStudent) {
    db.prepare(`
      INSERT OR REPLACE INTO student_target_careers (student_id, role_id)
      VALUES (?, 'role_frontend')
    `).run(demoStudent.id);

    // Seed Starter Chat Message
    db.prepare(`
      INSERT OR REPLACE INTO chat_messages (id, student_id, sender, text, verified_facts, suggestions, source_links, is_fallback)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'msg_welcome',
      demoStudent.id,
      'ASSISTANT',
      'Welcome to SkillLens! I am your AI career path advisor. I use your verified student capability profile and live industry demand signals to help you achieve placement readiness. How can I help you today?',
      JSON.stringify(['Your current profile readiness is 82%.', 'Top matched career is Frontend Engineer (63% compatibility).', '310 verified jobs analyzed in the active demand cycle.']),
      JSON.stringify(['What skills should I learn first for Frontend Engineer?', 'How is my skill gap calculated?', 'Show me scholarships I am eligible for']),
      JSON.stringify([
        { title: 'Naan Mudhalvan Framework', url: 'https://naanmudhalvan.tn.gov.in' },
        { title: 'NPTEL Official Portal', url: 'https://nptel.ac.in' }
      ]),
      0
    );

    // Seed Notifications
    db.prepare(`
      INSERT OR REPLACE INTO student_notifications (id, student_id, title, message, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'notif_1',
      demoStudent.id,
      'Career Roadmap Ready',
      'Your topological learning path for Frontend Engineer has been mapped with 5 stages.',
      'RECOMMENDATION'
    );
    db.prepare(`
      INSERT OR REPLACE INTO student_notifications (id, student_id, title, message, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'notif_2',
      demoStudent.id,
      'New Opportunity Match',
      'Zoho Corporation posted a Junior Full Stack role matching 4 of your core skills.',
      'OPPORTUNITY'
    );
  }

  console.log('✅ SkillLens extended seeding completed successfully!');
}

seedSkillLens();
