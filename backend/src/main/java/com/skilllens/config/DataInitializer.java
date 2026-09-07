package com.skilllens.config;

import com.skilllens.entity.*;
import com.skilllens.repository.*;
import com.skilllens.service.TrendService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final SkillCategoryRepository categoryRepository;
    private final SkillRepository skillRepository;
    private final SkillAliasRepository aliasRepository;
    private final OccupationRepository occupationRepository;
    private final OccupationSkillRepository occupationSkillRepository;
    private final JobPostingRepository jobRepository;
    private final CourseRepository courseRepository;
    private final ProjectRepository projectRepository;
    private final CertificationRepository certificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final TrendService trendService;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0 && skillRepository.count() > 0) {
            logger.info("Database already seeded. Skipping initial data load.");
            trendService.recalculateAndGetTrends();
            return;
        }

        logger.info("Initializing SkillLens seed database with verified taxonomy, jobs, and careers...");

        // 1. Seed Users
        User admin = User.builder()
                .fullName("SkillLens Administrator")
                .email("admin@skilllens.com")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .role("ADMIN")
                .active(true)
                .build();
        userRepository.save(admin);

        User demoStudent = User.builder()
                .fullName("Alex Chen")
                .email("student@skilllens.com")
                .passwordHash(passwordEncoder.encode("Student@123"))
                .role("STUDENT")
                .active(true)
                .build();
        demoStudent = userRepository.save(demoStudent);

        StudentProfile demoProfile = StudentProfile.builder()
                .user(demoStudent)
                .college("National Institute of Technology")
                .degree("Bachelor of Technology (B.Tech)")
                .department("Computer Science & Engineering")
                .graduationYear(2026)
                .cgpa(BigDecimal.valueOf(8.75))
                .careerInterest("Full Stack Developer")
                .bio("Final-year Computer Science undergraduate passionate about building scalable web systems and distributed applications.")
                .build();
        demoProfile = profileRepository.save(demoProfile);

        // 2. Seed Skill Categories
        SkillCategory catLang = categoryRepository.save(SkillCategory.builder().name("Programming Languages").description("Core programming and scripting languages").build());
        SkillCategory catFw = categoryRepository.save(SkillCategory.builder().name("Frameworks & Libraries").description("Web, backend, and frontend frameworks").build());
        SkillCategory catDb = categoryRepository.save(SkillCategory.builder().name("Databases & Storage").description("Relational, NoSQL, and in-memory databases").build());
        SkillCategory catCloud = categoryRepository.save(SkillCategory.builder().name("Cloud & DevOps").description("Cloud providers, containerization, and CI/CD").build());
        SkillCategory catAi = categoryRepository.save(SkillCategory.builder().name("AI & Data Science").description("Machine learning, data analytics, and statistics").build());
        SkillCategory catCs = categoryRepository.save(SkillCategory.builder().name("Core CS & Tools").description("Data structures, algorithms, version control, and security").build());

        // 3. Seed Skills
        Map<String, Skill> s = new HashMap<>();

        // Languages
        s.put("Java", skillRepository.save(Skill.builder().name("Java").category(catLang).difficulty("INTERMEDIATE").demandLevel("CRITICAL").description("Object-oriented language for enterprise and Android systems").build()));
        s.put("Python", skillRepository.save(Skill.builder().name("Python").category(catLang).difficulty("BEGINNER").demandLevel("CRITICAL").description("Versatile language for backend, AI, and scripting").build()));
        s.put("JavaScript", skillRepository.save(Skill.builder().name("JavaScript").category(catLang).difficulty("BEGINNER").demandLevel("CRITICAL").description("Essential scripting language of the web").build()));
        s.put("TypeScript", skillRepository.save(Skill.builder().name("TypeScript").category(catLang).difficulty("INTERMEDIATE").demandLevel("HIGH").description("Typed superset of JavaScript").build()));
        s.put("C++", skillRepository.save(Skill.builder().name("C++").category(catLang).difficulty("ADVANCED").demandLevel("MEDIUM").description("High-performance compiled systems language").build()));
        s.put("SQL", skillRepository.save(Skill.builder().name("SQL").category(catLang).difficulty("BEGINNER").demandLevel("CRITICAL").description("Standard language for relational database management").build()));
        s.put("Go", skillRepository.save(Skill.builder().name("Go").category(catLang).difficulty("INTERMEDIATE").demandLevel("HIGH").description("Cloud-native concurrent language designed by Google").build()));

        // Frameworks
        s.put("Spring Boot", skillRepository.save(Skill.builder().name("Spring Boot").category(catFw).difficulty("INTERMEDIATE").demandLevel("HIGH").description("Java enterprise application framework").build()));
        s.put("React", skillRepository.save(Skill.builder().name("React").category(catFw).difficulty("INTERMEDIATE").demandLevel("CRITICAL").description("Declarative UI library for single-page web applications").build()));
        s.put("Node.js", skillRepository.save(Skill.builder().name("Node.js").category(catFw).difficulty("INTERMEDIATE").demandLevel("HIGH").description("Asynchronous event-driven JavaScript runtime").build()));
        s.put("Django", skillRepository.save(Skill.builder().name("Django").category(catFw).difficulty("INTERMEDIATE").demandLevel("MEDIUM").description("High-level Python web framework").build()));
        s.put("FastAPI", skillRepository.save(Skill.builder().name("FastAPI").category(catFw).difficulty("INTERMEDIATE").demandLevel("HIGH").description("Modern, fast Python web framework for REST APIs").build()));

        // Databases
        s.put("MySQL", skillRepository.save(Skill.builder().name("MySQL").category(catDb).difficulty("BEGINNER").demandLevel("HIGH").description("Leading open-source relational database").build()));
        s.put("PostgreSQL", skillRepository.save(Skill.builder().name("PostgreSQL").category(catDb).difficulty("INTERMEDIATE").demandLevel("CRITICAL").description("Advanced open-source relational database").build()));
        s.put("MongoDB", skillRepository.save(Skill.builder().name("MongoDB").category(catDb).difficulty("BEGINNER").demandLevel("HIGH").description("Document-oriented NoSQL database").build()));
        s.put("Redis", skillRepository.save(Skill.builder().name("Redis").category(catDb).difficulty("INTERMEDIATE").demandLevel("HIGH").description("In-memory key-value data store and cache").build()));

        // Cloud & DevOps
        s.put("AWS", skillRepository.save(Skill.builder().name("AWS").category(catCloud).difficulty("INTERMEDIATE").demandLevel("CRITICAL").description("Amazon Web Services cloud computing platform").build()));
        s.put("Docker", skillRepository.save(Skill.builder().name("Docker").category(catCloud).difficulty("INTERMEDIATE").demandLevel("CRITICAL").description("Application containerization engine").build()));
        s.put("Kubernetes", skillRepository.save(Skill.builder().name("Kubernetes").category(catCloud).difficulty("ADVANCED").demandLevel("HIGH").description("Container orchestration and cluster management").build()));
        s.put("CI/CD", skillRepository.save(Skill.builder().name("CI/CD").category(catCloud).difficulty("INTERMEDIATE").demandLevel("HIGH").description("Continuous integration and continuous deployment pipelines").build()));
        s.put("Linux", skillRepository.save(Skill.builder().name("Linux").category(catCloud).difficulty("BEGINNER").demandLevel("CRITICAL").description("Open-source Unix-like operating system").build()));

        // AI & Data
        s.put("Machine Learning", skillRepository.save(Skill.builder().name("Machine Learning").category(catAi).difficulty("ADVANCED").demandLevel("CRITICAL").description("Statistical algorithms and predictive modeling").build()));
        s.put("Deep Learning", skillRepository.save(Skill.builder().name("Deep Learning").category(catAi).difficulty("ADVANCED").demandLevel("HIGH").description("Multi-layered artificial neural networks").build()));
        s.put("Pandas", skillRepository.save(Skill.builder().name("Pandas").category(catAi).difficulty("BEGINNER").demandLevel("HIGH").description("Data manipulation and analysis library for Python").build()));
        s.put("Statistics", skillRepository.save(Skill.builder().name("Statistics").category(catAi).difficulty("INTERMEDIATE").demandLevel("HIGH").description("Mathematical foundation for data analysis").build()));
        s.put("Power BI", skillRepository.save(Skill.builder().name("Power BI").category(catAi).difficulty("BEGINNER").demandLevel("MEDIUM").description("Business analytics and data visualization service").build()));

        // Tools & Core CS
        s.put("Git", skillRepository.save(Skill.builder().name("Git").category(catCs).difficulty("BEGINNER").demandLevel("CRITICAL").description("Distributed version control system").build()));
        s.put("Data Structures", skillRepository.save(Skill.builder().name("Data Structures").category(catCs).difficulty("INTERMEDIATE").demandLevel("CRITICAL").description("Fundamental computational representations and algorithms").build()));
        s.put("REST APIs", skillRepository.save(Skill.builder().name("REST APIs").category(catCs).difficulty("BEGINNER").demandLevel("CRITICAL").description("Architectural style for web service APIs").build()));
        s.put("Cybersecurity", skillRepository.save(Skill.builder().name("Cybersecurity").category(catCs).difficulty("ADVANCED").demandLevel("HIGH").description("Network defense, cryptography, and application security").build()));

        // 4. Seed Skill Aliases (for deterministic normalization)
        seedAlias("JS", s.get("JavaScript"));
        seedAlias("Javascript", s.get("JavaScript"));
        seedAlias("Java Script", s.get("JavaScript"));
        seedAlias("ML", s.get("Machine Learning"));
        seedAlias("ReactJS", s.get("React"));
        seedAlias("React.js", s.get("React"));
        seedAlias("K8s", s.get("Kubernetes"));
        seedAlias("Py", s.get("Python"));
        seedAlias("Node", s.get("Node.js"));
        seedAlias("NodeJS", s.get("Node.js"));
        seedAlias("Postgres", s.get("PostgreSQL"));
        seedAlias("PG", s.get("PostgreSQL"));
        seedAlias("Spring", s.get("Spring Boot"));
        seedAlias("SpringBoot", s.get("Spring Boot"));
        seedAlias("Amazon Web Services", s.get("AWS"));
        seedAlias("DSA", s.get("Data Structures"));

        // 5. Seed Occupations with Calibrated Skill Weights
        Occupation occFullStack = createOccupation("Full Stack Developer",
                "Designs, develops, and deploys both client-facing web applications and robust server architectures.",
                "ENTRY_LEVEL", "$85,000 - $115,000", "CRITICAL");
        linkOccSkill(occFullStack, s.get("JavaScript"), 2.0, true, "HIGH");
        linkOccSkill(occFullStack, s.get("React"), 2.0, true, "HIGH");
        linkOccSkill(occFullStack, s.get("Java"), 2.0, true, "HIGH");
        linkOccSkill(occFullStack, s.get("Spring Boot"), 2.0, true, "HIGH");
        linkOccSkill(occFullStack, s.get("SQL"), 2.0, true, "HIGH");
        linkOccSkill(occFullStack, s.get("Git"), 1.5, true, "MEDIUM");
        linkOccSkill(occFullStack, s.get("REST APIs"), 1.5, true, "MEDIUM");
        linkOccSkill(occFullStack, s.get("Docker"), 1.0, false, "MEDIUM");
        linkOccSkill(occFullStack, s.get("AWS"), 1.0, false, "LOW");

        Occupation occDataScientist = createOccupation("Data Scientist",
                "Extracts actionable intelligence from complex structured and unstructured datasets using statistical modeling and machine learning.",
                "ENTRY_LEVEL", "$95,000 - $130,000", "CRITICAL");
        linkOccSkill(occDataScientist, s.get("Python"), 2.0, true, "HIGH");
        linkOccSkill(occDataScientist, s.get("SQL"), 2.0, true, "HIGH");
        linkOccSkill(occDataScientist, s.get("Statistics"), 2.0, true, "HIGH");
        linkOccSkill(occDataScientist, s.get("Pandas"), 1.8, true, "HIGH");
        linkOccSkill(occDataScientist, s.get("Machine Learning"), 2.0, true, "HIGH");
        linkOccSkill(occDataScientist, s.get("Deep Learning"), 1.0, false, "MEDIUM");
        linkOccSkill(occDataScientist, s.get("Docker"), 1.0, false, "LOW");

        Occupation occCloudDevops = createOccupation("Cloud DevOps Engineer",
                "Automates cloud infrastructure, manages containerized pipelines, and ensures high availability and system resilience.",
                "ENTRY_LEVEL", "$90,000 - $125,000", "HIGH");
        linkOccSkill(occCloudDevops, s.get("Linux"), 2.0, true, "HIGH");
        linkOccSkill(occCloudDevops, s.get("AWS"), 2.0, true, "HIGH");
        linkOccSkill(occCloudDevops, s.get("Docker"), 2.0, true, "HIGH");
        linkOccSkill(occCloudDevops, s.get("Kubernetes"), 2.0, true, "HIGH");
        linkOccSkill(occCloudDevops, s.get("CI/CD"), 1.8, true, "HIGH");
        linkOccSkill(occCloudDevops, s.get("Python"), 1.0, false, "MEDIUM");
        linkOccSkill(occCloudDevops, s.get("Git"), 1.0, false, "MEDIUM");

        Occupation occBackendJava = createOccupation("Backend Java Developer",
                "Architects and optimizes mission-critical distributed services, transactional databases, and microservices in enterprise environments.",
                "ENTRY_LEVEL", "$85,000 - $110,000", "HIGH");
        linkOccSkill(occBackendJava, s.get("Java"), 2.0, true, "HIGH");
        linkOccSkill(occBackendJava, s.get("Spring Boot"), 2.0, true, "HIGH");
        linkOccSkill(occBackendJava, s.get("SQL"), 2.0, true, "HIGH");
        linkOccSkill(occBackendJava, s.get("MySQL"), 1.5, true, "MEDIUM");
        linkOccSkill(occBackendJava, s.get("REST APIs"), 1.5, true, "HIGH");
        linkOccSkill(occBackendJava, s.get("Data Structures"), 2.0, true, "HIGH");
        linkOccSkill(occBackendJava, s.get("Redis"), 1.0, false, "LOW");
        linkOccSkill(occBackendJava, s.get("Docker"), 1.0, false, "MEDIUM");

        Occupation occDataAnalyst = createOccupation("Data Analyst",
                "Translates raw business numbers into clear visualizations, executive dashboards, and performance metrics.",
                "ENTRY_LEVEL", "$70,000 - $95,000", "HIGH");
        linkOccSkill(occDataAnalyst, s.get("SQL"), 2.0, true, "HIGH");
        linkOccSkill(occDataAnalyst, s.get("Python"), 1.8, true, "HIGH");
        linkOccSkill(occDataAnalyst, s.get("Pandas"), 1.5, true, "MEDIUM");
        linkOccSkill(occDataAnalyst, s.get("Statistics"), 1.8, true, "HIGH");
        linkOccSkill(occDataAnalyst, s.get("Power BI"), 2.0, true, "HIGH");

        Occupation occCybersecurity = createOccupation("Cybersecurity Analyst",
                "Monitors networks for intrusions, implements cryptographic protocols, and conducts vulnerability assessments.",
                "ENTRY_LEVEL", "$85,000 - $120,000", "CRITICAL");
        linkOccSkill(occCybersecurity, s.get("Cybersecurity"), 2.0, true, "HIGH");
        linkOccSkill(occCybersecurity, s.get("Linux"), 2.0, true, "HIGH");
        linkOccSkill(occCybersecurity, s.get("Python"), 1.5, true, "MEDIUM");
        linkOccSkill(occCybersecurity, s.get("Git"), 1.0, false, "LOW");

        // Set demo student target occupation to Full Stack Developer and seed initial skills
        demoProfile.setTargetOccupationId(occFullStack.getId());
        profileRepository.save(demoProfile);

        // Demo student already has Java, SQL, Git, and JavaScript
        seedStudentSkill(demoProfile, s.get("Java"), "INTERMEDIATE", BigDecimal.valueOf(1.5));
        seedStudentSkill(demoProfile, s.get("SQL"), "INTERMEDIATE", BigDecimal.valueOf(1.0));
        seedStudentSkill(demoProfile, s.get("Git"), "ADVANCED", BigDecimal.valueOf(2.0));
        seedStudentSkill(demoProfile, s.get("JavaScript"), "INTERMEDIATE", BigDecimal.valueOf(1.0));

        // 6. Seed Realistic Job Postings (Representing Live Industry Demands)
        seedJob("Graduate Full Stack Engineer", "Google", "Mountain View, CA",
                "Join Google's web applications team building modern interfaces and scalable microservices.",
                "$115,000 - $135,000", "FULL_TIME", true, LocalDate.now().minusDays(2), "GREENHOUSE", "https://careers.google.com",
                List.of(s.get("JavaScript"), s.get("React"), s.get("Java"), s.get("Spring Boot"), s.get("SQL"), s.get("Docker")));

        seedJob("Software Development Engineer I", "Amazon", "Seattle, WA",
                "Build highly scalable distributed services supporting Amazon Prime and e-commerce shopping workflows.",
                "$120,000 - $140,000", "FULL_TIME", false, LocalDate.now().minusDays(5), "DIRECT", "https://amazon.jobs",
                List.of(s.get("Java"), s.get("Spring Boot"), s.get("AWS"), s.get("SQL"), s.get("Data Structures")));

        seedJob("Frontend Engineer (React)", "Meta", "Menlo Park, CA",
                "Deliver responsive, high-performance UI components for global social platforms used by billions.",
                "$110,000 - $130,000", "FULL_TIME", true, LocalDate.now().minusDays(3), "LEVER", "https://metacareers.com",
                List.of(s.get("JavaScript"), s.get("TypeScript"), s.get("React"), s.get("REST APIs"), s.get("Git")));

        seedJob("Associate Data Scientist", "Netflix", "Los Gatos, CA",
                "Analyze user viewing behaviors to optimize content recommendation engines using machine learning.",
                "$125,000 - $150,000", "FULL_TIME", true, LocalDate.now().minusDays(1), "DIRECT", "https://jobs.netflix.com",
                List.of(s.get("Python"), s.get("SQL"), s.get("Pandas"), s.get("Statistics"), s.get("Machine Learning")));

        seedJob("Junior Cloud DevOps Engineer", "Microsoft", "Redmond, WA",
                "Automate Azure cloud infrastructure and configure resilient continuous delivery pipelines.",
                "$105,000 - $125,000", "FULL_TIME", false, LocalDate.now().minusDays(4), "DIRECT", "https://careers.microsoft.com",
                List.of(s.get("Linux"), s.get("Docker"), s.get("Kubernetes"), s.get("CI/CD"), s.get("Git")));

        seedJob("Backend Engineer - Payments", "Stripe", "San Francisco, CA",
                "Help architect frictionless, reliable global financial infrastructure handling billions daily.",
                "$130,000 - $160,000", "FULL_TIME", true, LocalDate.now().minusDays(6), "GREENHOUSE", "https://stripe.com/jobs",
                List.of(s.get("Java"), s.get("SQL"), s.get("PostgreSQL"), s.get("Redis"), s.get("REST APIs")));

        seedJob("Junior Data Analyst", "Uber", "New York, NY",
                "Create real-time driver allocation dashboards and financial reporting models.",
                "$85,000 - $105,000", "FULL_TIME", true, LocalDate.now().minusDays(7), "DIRECT", "https://uber.com/careers",
                List.of(s.get("SQL"), s.get("Python"), s.get("Pandas"), s.get("Power BI"), s.get("Statistics")));

        seedJob("Security Operations Associate", "CrowdStrike", "Austin, TX",
                "Analyze endpoint threat logs and implement automated security alerting scripts.",
                "$90,000 - $115,000", "FULL_TIME", true, LocalDate.now().minusDays(8), "ARBEITNOW", "https://crowdstrike.com",
                List.of(s.get("Cybersecurity"), s.get("Linux"), s.get("Python"), s.get("Git")));

        // 7. Seed Curated Courses
        seedCourse("Full Stack Web Development with React & Spring Boot", "Coursera", s.get("React"),
                "INTERMEDIATE", "8 Weeks", "https://www.coursera.org", "Master end-to-end web architectures connecting modern React UI to Spring Boot REST backends.");
        seedCourse("Building Production Microservices in Spring Boot 3", "Udemy", s.get("Spring Boot"),
                "INTERMEDIATE", "6 Weeks", "https://www.udemy.com", "Learn dependency injection, JPA entities, RESTful APIs, and Spring Security 6.");
        seedCourse("Applied Machine Learning with Python", "MIT OpenCourseWare", s.get("Machine Learning"),
                "ADVANCED", "10 Weeks", "https://ocw.mit.edu", "Rigorous foundation in predictive modeling, regression, classification, and validation.");
        seedCourse("Docker & Kubernetes for Cloud Engineers", "edX", s.get("Docker"),
                "INTERMEDIATE", "5 Weeks", "https://www.edx.org", "From local containerization to multi-node cluster deployment and scaling.");
        seedCourse("Modern Relational Database Design with PostgreSQL & MySQL", "freeCodeCamp", s.get("SQL"),
                "BEGINNER", "4 Weeks", "https://freecodecamp.org", "Normalization, foreign keys, query optimization, indexing, and transactional ACID guarantees.");
        seedCourse("AWS Cloud Practitioner to Solutions Architect", "AWS Training", s.get("AWS"),
                "INTERMEDIATE", "6 Weeks", "https://aws.amazon.com/training", "Core compute, storage, networking, security, and cloud cost management.");

        // 8. Seed Hands-on Projects
        seedProject("Distributed Task Management REST Engine",
                "Build a high-performance RESTful API with user authentication, role-based authorization, and real-time task queueing.",
                "INTERMEDIATE", "3 Weeks", "https://github.com/examples/task-engine", List.of(s.get("Java"), s.get("Spring Boot"), s.get("MySQL"), s.get("REST APIs")));

        seedProject("Interactive Career Analytics Dashboard in React",
                "Develop a single-page analytics application featuring live chart visualizations, filtering, and responsive UI components.",
                "INTERMEDIATE", "2 Weeks", "https://github.com/examples/career-lens-ui", List.of(s.get("JavaScript"), s.get("React"), s.get("REST APIs")));

        seedProject("Automated CI/CD Pipeline with Docker & GitHub Actions",
                "Containerize a multi-service web platform and implement automated unit test execution and Docker Hub push on pull requests.",
                "ADVANCED", "2 Weeks", "https://github.com/examples/devops-pipeline", List.of(s.get("Docker"), s.get("CI/CD"), s.get("Linux"), s.get("Git")));

        seedProject("Customer Churn Prediction Engine",
                "Train, evaluate, and deploy a machine learning pipeline predicting customer churn using Pandas, Scikit-learn, and FastAPI.",
                "ADVANCED", "4 Weeks", "https://github.com/examples/churn-predictor", List.of(s.get("Python"), s.get("Pandas"), s.get("Machine Learning"), s.get("FastAPI")));

        // 9. Seed Certifications
        seedCertification("AWS Certified Solutions Architect - Associate", "Amazon Web Services", "INTERMEDIATE",
                "https://aws.amazon.com/certification/certified-solutions-architect-associate",
                "Validates comprehensive expertise in designing resilient, high-performing cloud architectures on AWS.", List.of(s.get("AWS"), s.get("Docker")));

        seedCertification("Oracle Certified Professional: Java SE 17 Developer", "Oracle Corporation", "ADVANCED",
                "https://education.oracle.com",
                "Demonstrates deep proficiency in core Java syntax, object-oriented principles, concurrency, and memory management.", List.of(s.get("Java"), s.get("Data Structures")));

        seedCertification("Certified Kubernetes Application Developer (CKAD)", "Cloud Native Computing Foundation", "ADVANCED",
                "https://www.cncf.io/certification/ckad",
                "Hands-on performance-based exam validating capability to design, build, and configure applications for Kubernetes.", List.of(s.get("Kubernetes"), s.get("Docker"), s.get("Linux")));

        seedCertification("CompTIA Security+", "CompTIA", "INTERMEDIATE",
                "https://www.comptia.org/certifications/security",
                "Global credential establishing foundational knowledge in cybersecurity, threat mitigation, and vulnerability remediation.", List.of(s.get("Cybersecurity"), s.get("Linux")));

        // 10. Recalculate Initial Trends
        trendService.recalculateAndGetTrends();
        logger.info("SkillLens database seeding completed successfully.");
    }

    private void seedAlias(String aliasName, Skill canonicalSkill) {
        if (!aliasRepository.existsByAliasNameIgnoreCase(aliasName)) {
            aliasRepository.save(SkillAlias.builder()
                    .aliasName(aliasName)
                    .canonicalSkill(canonicalSkill)
                    .build());
        }
    }

    private Occupation createOccupation(String title, String desc, String level, String salary, String demand) {
        return occupationRepository.save(Occupation.builder()
                .title(title)
                .description(desc)
                .careerLevel(level)
                .averageSalary(salary)
                .industryDemand(demand)
                .build());
    }

    private void linkOccSkill(Occupation occ, Skill skill, double weight, boolean required, String priority) {
        OccupationSkill os = OccupationSkill.builder()
                .occupation(occ)
                .skill(skill)
                .weight(BigDecimal.valueOf(weight))
                .required(required)
                .priorityLevel(priority)
                .build();
        occupationSkillRepository.save(os);
        occ.getRequiredSkills().add(os);
    }

    private void seedStudentSkill(StudentProfile profile, Skill skill, String level, BigDecimal exp) {
        StudentSkill ss = StudentSkill.builder()
                .studentProfile(profile)
                .skill(skill)
                .proficiencyLevel(level)
                .yearsExperience(exp)
                .build();
        profile.getSkills().add(ss);
    }

    private void seedJob(String title, String company, String location, String desc, String salary, String type,
                         boolean remote, LocalDate date, String source, String applyUrl, List<Skill> skills) {
        JobPosting job = JobPosting.builder()
                .title(title)
                .company(company)
                .location(location)
                .description(desc)
                .salary(salary)
                .jobType(type)
                .remote(remote)
                .postedDate(date)
                .source(source)
                .applyUrl(applyUrl)
                .requiredSkills(new HashSet<>(skills))
                .build();
        jobRepository.save(job);
    }

    private void seedCourse(String title, String provider, Skill skill, String diff, String dur, String url, String desc) {
        courseRepository.save(Course.builder()
                .title(title)
                .provider(provider)
                .skill(skill)
                .difficulty(diff)
                .duration(dur)
                .url(url)
                .description(desc)
                .build());
    }

    private void seedProject(String title, String desc, String diff, String dur, String url, List<Skill> skills) {
        projectRepository.save(Project.builder()
                .title(title)
                .description(desc)
                .difficulty(diff)
                .estimatedDuration(dur)
                .githubUrl(url)
                .skillsCovered(new HashSet<>(skills))
                .build());
    }

    private void seedCertification(String name, String provider, String diff, String url, String desc, List<Skill> skills) {
        certificationRepository.save(Certification.builder()
                .name(name)
                .provider(provider)
                .difficulty(diff)
                .url(url)
                .description(desc)
                .skills(new HashSet<>(skills))
                .build());
    }
}
