package com.skilllens.assessment;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skilllens.common.exception.*;
import com.skilllens.resume.ExtractedSkillDto;
import com.skilllens.resume.Resume;
import com.skilllens.resume.ResumeRepository;
import com.skilllens.resume.ResumeStatus;
import com.skilllens.security.UserPrincipal;
import com.skilllens.skill.StudentSkill;
import com.skilllens.skill.StudentSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Assessment engine — attempt lifecycle, answer scoring, proficiency mapping,
 * and dynamic resume-based assessment generation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository questionRepository;
    private final AssessmentAnswerRepository answerRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final com.skilllens.skill.SkillRepository skillRepository;
    private final ResumeRepository resumeRepository;
    private final ObjectMapper objectMapper;
    private final AssessmentOptionRepository optionRepository;

    @Transactional(readOnly = true)
    public List<AssessmentSummaryResponse> listAssessments(UserPrincipal principal) {
        Set<Long> userSkillIds = new HashSet<>();
        if (principal != null) {
            userSkillIds = studentSkillRepository.findByUserId(principal.getId()).stream()
                    .map(ss -> ss.getSkill().getId())
                    .collect(Collectors.toSet());
        }
        final Set<Long> resumeSkillIds = userSkillIds;

        List<AssessmentSummaryResponse> list = assessmentRepository.findByActiveTrue(
                org.springframework.data.domain.Pageable.unpaged()).stream()
                .map(a -> toSummary(a, resumeSkillIds))
                .collect(Collectors.toList());

        // Sort so that personalized resume assessments appear first, followed by resume skill matches
        list.sort((a, b) -> {
            boolean aPers = Boolean.TRUE.equals(a.getIsResumePersonalized());
            boolean bPers = Boolean.TRUE.equals(b.getIsResumePersonalized());
            if (aPers && !bPers) return -1;
            if (!aPers && bPers) return 1;

            boolean aMatch = Boolean.TRUE.equals(a.getIsResumeSkill());
            boolean bMatch = Boolean.TRUE.equals(b.getIsResumeSkill());
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return a.getId().compareTo(b.getId());
        });

        return list;
    }

    @Transactional(readOnly = true)
    public List<AssessmentSummaryResponse> listAssessments() {
        return listAssessments(null);
    }

    @Transactional(readOnly = true)
    public AssessmentDetailResponse getAssessment(Long assessmentId) {
        Assessment assessment = findActiveAssessment(assessmentId);
        List<AssessmentQuestion> questions = questionRepository
                .findByAssessmentIdOrderByOrderIndexAsc(assessmentId);
        return toDetail(assessment, questions);
    }

    @Transactional
    public AttemptResponse startAttempt(UserPrincipal principal, Long assessmentId) {
        Assessment assessment = findActiveAssessment(assessmentId);

        // Check for an in-progress attempt
        attemptRepository.findActiveAttempt(principal.getId(), assessmentId).ifPresent(a -> {
            throw new ConflictException("You already have an in-progress attempt for this assessment. " +
                    "Submit or wait for it to expire before starting a new one.");
        });

        AssessmentAttempt attempt = AssessmentAttempt.builder()
                .userId(principal.getId())
                .assessmentId(assessmentId)
                .status(AssessmentAttempt.AttemptStatus.IN_PROGRESS)
                .startedAt(Instant.now())
                .build();
        attempt = attemptRepository.save(attempt);
        log.info("Assessment attempt started: attemptId={}, userId={}", attempt.getId(), principal.getId());

        List<AssessmentQuestion> questions = questionRepository
                .findByAssessmentIdOrderByOrderIndexAsc(assessmentId);
        List<QuestionResponse> qr = questions.stream().map(q -> QuestionResponse.builder()
                .id(q.getId()).questionText(q.getQuestionText())
                .questionType(q.getQuestionType() != null ? q.getQuestionType().name() : null)
                .points(q.getPoints())
                .options(q.getOptions().stream().map(o -> OptionResponse.builder()
                        .id(o.getId()).optionText(o.getOptionText())
                        .build()).collect(Collectors.toList()))
                .build()).collect(Collectors.toList());

        AttemptResponse response = toAttemptResponse(attempt);
        response.setQuestions(qr);
        return response;
    }

    @Transactional
    public AttemptResultResponse submitAttempt(UserPrincipal principal, Long attemptId,
                                               SubmitAttemptRequest request) {
        AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found."));

        if (!attempt.getUserId().equals(principal.getId())) {
            throw new ForbiddenException("You do not have permission to submit this attempt.");
        }
        if (attempt.getStatus() != AssessmentAttempt.AttemptStatus.IN_PROGRESS) {
            throw new ConflictException("This attempt has already been submitted.");
        }

        Assessment assessment = findActiveAssessment(attempt.getAssessmentId());
        List<AssessmentQuestion> questions = questionRepository
                .findByAssessmentIdOrderByOrderIndexAsc(attempt.getAssessmentId());

        // Save answers
        if (request.getAnswers() != null) {
            List<AssessmentAnswer> answers = request.getAnswers().stream()
                    .map(a -> AssessmentAnswer.builder()
                            .attemptId(attemptId)
                            .questionId(a.getQuestionId())
                            .selectedOptionIds(String.join(",",
                                    a.getSelectedOptionIds().stream()
                                            .map(String::valueOf).toArray(String[]::new)))
                            .build())
                    .collect(Collectors.toList());
            answerRepository.saveAll(answers);
        }

        // Score
        List<AssessmentAnswer> savedAnswers = answerRepository.findByAttemptId(attemptId);
        int totalPoints = questions.stream().mapToInt(AssessmentQuestion::getPoints).sum();
        int earnedPoints = scoreAnswers(questions, savedAnswers);
        int proficiency = mapScoreToProficiency(earnedPoints, totalPoints);

        attempt.setScore(earnedPoints);
        attempt.setMaxScore(totalPoints);
        attempt.setPassed(assessment.getPassingScore() == null ||
                (totalPoints > 0 && (earnedPoints * 100 / totalPoints) >= assessment.getPassingScore()));
        attempt.setAssessedProficiency(proficiency);
        attempt.setSubmittedAt(Instant.now());
        attempt.setStatus(AssessmentAttempt.AttemptStatus.SCORED);
        attempt = attemptRepository.save(attempt);

        // Update student skill assessed proficiency
        if (assessment.getSkillId() != null) {
            studentSkillRepository.findByUserIdAndSkillId(principal.getId(), assessment.getSkillId())
                    .ifPresent(ss -> {
                        ss.setAssessedProficiency(proficiency);
                        ss.setLastAssessedAt(Instant.now());
                        studentSkillRepository.save(ss);
                    });
        }
        // If this was a resume-tailored assessment, also update all student skills from their resume
        if (assessment.getTitle() != null && (assessment.getTitle().startsWith("Resume Assessment:") || assessment.getTitle().startsWith("Resume-Tailored"))) {
            List<StudentSkill> allStudentSkills = studentSkillRepository.findByUserId(principal.getId());
            for (StudentSkill ss : allStudentSkills) {
                if (ss.getAssessedProficiency() == null || proficiency > ss.getAssessedProficiency()) {
                    ss.setAssessedProficiency(proficiency);
                    ss.setLastAssessedAt(Instant.now());
                    studentSkillRepository.save(ss);
                }
            }
        }

        log.info("Attempt scored: attemptId={}, score={}/{}, proficiency={}",
                attemptId, earnedPoints, totalPoints, proficiency);
        return toResultResponse(attempt, assessment);
    }

    @Transactional(readOnly = true)
    public AttemptResultResponse getAttemptResult(UserPrincipal principal, Long attemptId) {
        AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found."));
        if (!attempt.getUserId().equals(principal.getId())) {
            throw new ForbiddenException("You do not have permission to view this result.");
        }
        Assessment assessment = assessmentRepository.findById(attempt.getAssessmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found."));
        return toResultResponse(attempt, assessment);
    }

    @Transactional(readOnly = true)
    public List<AttemptSummaryResponse> getStudentHistory(UserPrincipal principal) {
        return attemptRepository.findByUserIdOrderByCreatedAtDesc(principal.getId())
                .stream().map(this::toAttemptSummary).collect(Collectors.toList());
    }

    // ─── Scoring ─────────────────────────────────────────────────────────────

    private int scoreAnswers(List<AssessmentQuestion> questions, List<AssessmentAnswer> answers) {
        Map<Long, Set<Long>> answerMap = new HashMap<>();
        for (AssessmentAnswer a : answers) {
            Set<Long> ids = Arrays.stream(a.getSelectedOptionIds().split(","))
                    .filter(s -> !s.isBlank())
                    .map(Long::parseLong)
                    .collect(Collectors.toSet());
            answerMap.put(a.getQuestionId(), ids);
        }

        int earned = 0;
        for (AssessmentQuestion q : questions) {
            Set<Long> correctIds = q.getOptions().stream()
                    .filter(AssessmentOption::isCorrect)
                    .map(AssessmentOption::getId)
                    .collect(Collectors.toSet());
            Set<Long> selected = answerMap.getOrDefault(q.getId(), Set.of());
            if (correctIds.equals(selected)) {
                earned += q.getPoints();
            }
        }
        return earned;
    }

    /**
     * Maps a score percentage to a proficiency level (1–4).
     * An incomplete/unscored assessment does not produce a level.
     */
    private int mapScoreToProficiency(int earned, int total) {
        if (total <= 0) return 1;
        int pct = (earned * 100) / total;
        if (pct >= 75) return 4;
        if (pct >= 50) return 3;
        if (pct >= 25) return 2;
        return 1;
    }

    // ─── Mappers ─────────────────────────────────────────────────────────────

    private Assessment findActiveAssessment(Long id) {
        return assessmentRepository.findById(id)
                .filter(Assessment::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found with id: " + id));
    }

    private AssessmentSummaryResponse toSummary(Assessment a, Set<Long> studentSkillIds) {
        String skillName = null;
        String categoryName = null;
        if (a.getSkillId() != null) {
            Optional<com.skilllens.skill.Skill> skillOpt = skillRepository.findById(a.getSkillId());
            if (skillOpt.isPresent()) {
                com.skilllens.skill.Skill s = skillOpt.get();
                skillName = s.getName();
                if (s.getCategory() != null) {
                    categoryName = s.getCategory().getName();
                }
            }
        }
        int qCount = questionRepository.findByAssessmentIdOrderByOrderIndexAsc(a.getId()).size();
        boolean isResume = (a.getSkillId() != null && studentSkillIds != null && studentSkillIds.contains(a.getSkillId()));
        boolean isPersonalized = a.getTitle() != null && (a.getTitle().startsWith("Resume Assessment:") || a.getTitle().startsWith("Resume-Tailored"));

        return AssessmentSummaryResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .description(a.getDescription())
                .skillId(a.getSkillId())
                .skillName(skillName != null ? skillName : (isPersonalized ? "Resume Tech Stack" : "General"))
                .categoryName(categoryName != null ? categoryName : (isPersonalized ? "Personalized Assessment" : "Engineering Assessment"))
                .difficulty(a.getDifficulty() != null ? a.getDifficulty().name() : null)
                .timeLimitMinutes(a.getTimeLimitMinutes())
                .durationMinutes(a.getTimeLimitMinutes())
                .questionCount(qCount > 0 ? qCount : 5)
                .passingScore(a.getPassingScore() != null ? a.getPassingScore() : 70)
                .isResumeSkill(isResume || isPersonalized)
                .isResumePersonalized(isPersonalized)
                .build();
    }

    private AssessmentSummaryResponse toSummary(Assessment a) {
        return toSummary(a, Collections.emptySet());
    }

    private AssessmentDetailResponse toDetail(Assessment a, List<AssessmentQuestion> questions) {
        List<QuestionResponse> qr = questions.stream().map(q -> QuestionResponse.builder()
                .id(q.getId()).questionText(q.getQuestionText())
                .questionType(q.getQuestionType() != null ? q.getQuestionType().name() : null)
                .points(q.getPoints())
                .options(q.getOptions().stream().map(o -> OptionResponse.builder()
                        .id(o.getId()).optionText(o.getOptionText())
                        // isCorrect is NEVER returned to the client
                        .build()).collect(Collectors.toList()))
                .build()).collect(Collectors.toList());
        return AssessmentDetailResponse.builder()
                .id(a.getId()).title(a.getTitle()).description(a.getDescription())
                .skillId(a.getSkillId())
                .difficulty(a.getDifficulty() != null ? a.getDifficulty().name() : null)
                .timeLimitMinutes(a.getTimeLimitMinutes())
                .questions(qr).build();
    }

    private AttemptResponse toAttemptResponse(AssessmentAttempt a) {
        return AttemptResponse.builder()
                .id(a.getId()).assessmentId(a.getAssessmentId())
                .status(a.getStatus().name()).startedAt(a.getStartedAt()).build();
    }

    private AttemptResultResponse toResultResponse(AssessmentAttempt a, Assessment assessment) {
        return AttemptResultResponse.builder()
                .id(a.getId()).assessmentId(a.getAssessmentId())
                .assessmentTitle(assessment.getTitle())
                .status(a.getStatus().name()).score(a.getScore()).maxScore(a.getMaxScore())
                .passed(a.getPassed()).assessedProficiency(a.getAssessedProficiency())
                .submittedAt(a.getSubmittedAt()).build();
    }

    private AttemptSummaryResponse toAttemptSummary(AssessmentAttempt a) {
        return AttemptSummaryResponse.builder()
                .id(a.getId()).assessmentId(a.getAssessmentId())
                .status(a.getStatus().name()).score(a.getScore()).maxScore(a.getMaxScore())
                .passed(a.getPassed()).assessedProficiency(a.getAssessedProficiency())
                .startedAt(a.getStartedAt()).submittedAt(a.getSubmittedAt()).build();
    }

    // ─── Dynamic Resume-Based Assessment Generation ──────────────────────────

    @Transactional
    public AssessmentDetailResponse generateResumeAssessment(UserPrincipal principal) {
        List<Resume> userResumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(principal.getId());
        Resume resume = userResumes.stream()
                .filter(r -> r.getStatus() == ResumeStatus.PARSED)
                .findFirst()
                .orElse(null);

        List<ExtractedSkillDto> resumeSkills = new ArrayList<>();
        List<String> educationList = new ArrayList<>();
        List<String> experienceList = new ArrayList<>();

        if (resume != null) {
            if (resume.getParsedSkillsJson() != null && !resume.getParsedSkillsJson().isBlank()) {
                try {
                    resumeSkills = objectMapper.readValue(resume.getParsedSkillsJson(),
                            new TypeReference<List<ExtractedSkillDto>>() {});
                } catch (Exception e) {
                    log.warn("Error reading resume skills: {}", e.getMessage());
                }
            }
            if (resume.getParsedEducationJson() != null && !resume.getParsedEducationJson().isBlank()) {
                try {
                    educationList = objectMapper.readValue(resume.getParsedEducationJson(),
                            new TypeReference<List<String>>() {});
                } catch (Exception e) {}
            }
            if (resume.getParsedExperienceJson() != null && !resume.getParsedExperienceJson().isBlank()) {
                try {
                    experienceList = objectMapper.readValue(resume.getParsedExperienceJson(),
                            new TypeReference<List<String>>() {});
                } catch (Exception e) {}
            }
        }

        // Fallback to student skills if resume was not yet parsed
        if (resumeSkills.isEmpty()) {
            List<StudentSkill> currentSkills = studentSkillRepository.findByUserId(principal.getId());
            for (StudentSkill ss : currentSkills) {
                resumeSkills.add(ExtractedSkillDto.builder()
                        .skillId(ss.getSkill().getId())
                        .skillName(ss.getSkill().getName())
                        .category(ss.getSkill().getCategory() != null ? ss.getSkill().getCategory().getName() : "General")
                        .matchedOccurrences(2)
                        .suggestedProficiency(ss.getSelfReportedProficiency() != null ? ss.getSelfReportedProficiency() : 2)
                        .confidence(0.85)
                        .build());
            }
        }

        if (resumeSkills.isEmpty()) {
            throw new BadRequestException("Please upload your resume in the Profile section first so SkillLens can analyze your skills, technologies, qualifications, and experience to generate personalized questions.");
        }

        List<String> skillNames = resumeSkills.stream()
                .map(ExtractedSkillDto::getSkillName)
                .distinct()
                .limit(4)
                .toList();
        String primarySkillsJoined = String.join(", ", skillNames);

        String degreeInfo = !educationList.isEmpty() ? educationList.get(0) : "Engineering Graduate";
        String expSummary = !experienceList.isEmpty() ? experienceList.get(0) : "Technical Project Experience";

        String title = "Resume Assessment: " + primarySkillsJoined;
        String description = "Personalized assessment dynamically generated for your resume credentials. Tests verified competencies in "
                + primarySkillsJoined + " calibrated to qualification (" + degreeInfo + ") and experience background (" + expSummary + ").";

        Optional<Assessment> existingOpt = assessmentRepository.findByTitle(title);
        Assessment assessment;
        if (existingOpt.isPresent()) {
            assessment = existingOpt.get();
        } else {
            Long primarySkillId = resumeSkills.get(0).getSkillId();
            assessment = Assessment.builder()
                    .title(title)
                    .description(description)
                    .skillId(primarySkillId)
                    .difficulty(Assessment.Difficulty.INTERMEDIATE)
                    .timeLimitMinutes(20)
                    .passingScore(70)
                    .active(true)
                    .build();
            assessment = assessmentRepository.save(assessment);

            List<AssessmentQuestion> newQuestions = new ArrayList<>();
            int order = 0;

            for (ExtractedSkillDto s : resumeSkills.stream().limit(4).toList()) {
                List<Assessment> skillAssessments = assessmentRepository.findBySkillIdAndActiveTrue(s.getSkillId());
                if (!skillAssessments.isEmpty()) {
                    List<AssessmentQuestion> pool = questionRepository
                            .findByAssessmentIdOrderByOrderIndexAsc(skillAssessments.get(0).getId());
                    if (!pool.isEmpty()) {
                        AssessmentQuestion srcQ = pool.get(0);
                        AssessmentQuestion q = AssessmentQuestion.builder()
                                .assessmentId(assessment.getId())
                                .questionText("[" + s.getSkillName() + " — Resume Competency] " + srcQ.getQuestionText())
                                .questionType(srcQ.getQuestionType())
                                .points(1)
                                .orderIndex(order++)
                                .build();
                        for (AssessmentOption srcO : srcQ.getOptions()) {
                            q.getOptions().add(AssessmentOption.builder()
                                    .optionText(srcO.getOptionText())
                                    .correct(srcO.isCorrect())
                                    .orderIndex(srcO.getOrderIndex())
                                    .build());
                        }
                        newQuestions.add(q);
                    }
                }
            }

            AssessmentQuestion qScenario1 = AssessmentQuestion.builder()
                    .assessmentId(assessment.getId())
                    .questionText("[Architecture Scenario — " + skillNames.get(0) + "] Based on your background in " + degreeInfo + ", which architectural pattern best ensures fault tolerance, horizontal elasticity, and decoupled service communication?")
                    .questionType(AssessmentQuestion.QuestionType.SINGLE_CHOICE)
                    .points(1)
                    .orderIndex(order++)
                    .build();
            qScenario1.getOptions().add(AssessmentOption.builder().optionText("Stateless microservices communicating via asynchronous event message brokers or well-defined RESTful contracts").correct(true).orderIndex(0).build());
            qScenario1.getOptions().add(AssessmentOption.builder().optionText("Tight coupling of backend controllers through shared mutable JVM heap variables").correct(false).orderIndex(1).build());
            qScenario1.getOptions().add(AssessmentOption.builder().optionText("A single centralized monolithic database instance without read replicas or connection pooling").correct(false).orderIndex(2).build());
            qScenario1.getOptions().add(AssessmentOption.builder().optionText("Disabling HTTP keep-alive and executing synchronous blocking queries on the main thread").correct(false).orderIndex(3).build());
            newQuestions.add(qScenario1);

            AssessmentQuestion qScenario2 = AssessmentQuestion.builder()
                    .assessmentId(assessment.getId())
                    .questionText("[Production Best Practices — " + primarySkillsJoined + "] When deploying applications leveraging " + primarySkillsJoined + " to production, how do you prevent regression bugs and guarantee high availability?")
                    .questionType(AssessmentQuestion.QuestionType.SINGLE_CHOICE)
                    .points(1)
                    .orderIndex(order++)
                    .build();
            qScenario2.getOptions().add(AssessmentOption.builder().optionText("Enforcing automated CI/CD pipelines with comprehensive unit/integration test gates, health-checked rolling deployments, and centralized telemetry").correct(true).orderIndex(0).build());
            qScenario2.getOptions().add(AssessmentOption.builder().optionText("Manually modifying compiled artifacts and restarting production daemon processes during active business hours").correct(false).orderIndex(1).build());
            qScenario2.getOptions().add(AssessmentOption.builder().optionText("Bypassing database migrations and altering production schema tables directly without backups").correct(false).orderIndex(2).build());
            qScenario2.getOptions().add(AssessmentOption.builder().optionText("Hardcoding environment credentials and API secrets into version control repository branches").correct(false).orderIndex(3).build());
            newQuestions.add(qScenario2);

            for (AssessmentQuestion nq : newQuestions) {
                List<AssessmentOption> opts = new ArrayList<>(nq.getOptions());
                nq.setOptions(new ArrayList<>());
                AssessmentQuestion savedQ = questionRepository.save(nq);
                for (AssessmentOption opt : opts) {
                    opt.setQuestionId(savedQ.getId());
                }
                optionRepository.saveAll(opts);
            }

            log.info("Generated resume-tailored assessment '{}' with {} questions for user {}",
                    title, newQuestions.size(), principal.getId());
        }

        List<AssessmentQuestion> questions = questionRepository
                .findByAssessmentIdOrderByOrderIndexAsc(assessment.getId());
        return toDetail(assessment, questions);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getResumeAssessmentProfile(UserPrincipal principal) {
        List<Resume> userResumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(principal.getId());
        Resume resume = userResumes.stream()
                .filter(r -> r.getStatus() == ResumeStatus.PARSED)
                .findFirst()
                .orElse(null);

        Map<String, Object> data = new HashMap<>();
        if (resume == null) {
            data.put("hasResume", false);
            data.put("skills", List.of());
            data.put("education", List.of());
            data.put("experience", List.of());
            return data;
        }

        data.put("hasResume", true);
        data.put("resumeFilename", resume.getOriginalFilename());
        try {
            data.put("skills", objectMapper.readValue(resume.getParsedSkillsJson() != null ? resume.getParsedSkillsJson() : "[]", Object.class));
            data.put("education", objectMapper.readValue(resume.getParsedEducationJson() != null ? resume.getParsedEducationJson() : "[]", Object.class));
            data.put("experience", objectMapper.readValue(resume.getParsedExperienceJson() != null ? resume.getParsedExperienceJson() : "[]", Object.class));
        } catch (Exception e) {
            log.warn("Error serializing resume profile: {}", e.getMessage());
        }
        return data;
    }
}
