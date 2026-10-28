package com.skilllens.assessment;

import com.skilllens.security.UserPrincipal;
import com.skilllens.skill.StudentSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssessmentServiceTest {

    @Mock
    private AssessmentRepository assessmentRepository;

    @Mock
    private AssessmentQuestionRepository questionRepository;

    @Mock
    private AssessmentAnswerRepository answerRepository;

    @Mock
    private AssessmentAttemptRepository attemptRepository;

    @Mock
    private StudentSkillRepository studentSkillRepository;

    @InjectMocks
    private AssessmentService assessmentService;

    private UserPrincipal principal;
    private Assessment assessment;

    @BeforeEach
    void setUp() {
        principal = UserPrincipal.builder()
                .id(1L)
                .email("student@test.com")
                .password("password")
                .enabled(true)
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_STUDENT")))
                .build();

        assessment = Assessment.builder()
                .id(10L)
                .title("Java Fundamentals")
                .skillId(101L)
                .passingScore(70)
                .active(true)
                .build();
    }

    @Test
    void startAttempt_createsNewAttempt_whenNoneActive() {
        when(assessmentRepository.findById(10L)).thenReturn(Optional.of(assessment));
        when(attemptRepository.findActiveAttempt(1L, 10L)).thenReturn(Optional.empty());

        AssessmentAttempt createdAttempt = AssessmentAttempt.builder()
                .id(50L)
                .userId(1L)
                .assessmentId(10L)
                .status(AssessmentAttempt.AttemptStatus.IN_PROGRESS)
                .build();
        when(attemptRepository.save(any(AssessmentAttempt.class))).thenReturn(createdAttempt);

        AttemptResponse response = assessmentService.startAttempt(principal, 10L);

        assertNotNull(response);
        assertEquals(50L, response.getId());
        assertEquals(10L, response.getAssessmentId());
        assertEquals("IN_PROGRESS", response.getStatus());
    }

    @Test
    void submitAttempt_scoresCorrectAnswers_andAssignsProficiency() {
        AssessmentAttempt attempt = AssessmentAttempt.builder()
                .id(50L)
                .userId(1L)
                .assessmentId(10L)
                .status(AssessmentAttempt.AttemptStatus.IN_PROGRESS)
                .build();
        when(attemptRepository.findById(50L)).thenReturn(Optional.of(attempt));
        when(assessmentRepository.findById(10L)).thenReturn(Optional.of(assessment));

        AssessmentOption correctOption = AssessmentOption.builder().id(201L).correct(true).build();
        AssessmentOption wrongOption = AssessmentOption.builder().id(202L).correct(false).build();

        AssessmentQuestion q1 = AssessmentQuestion.builder()
                .id(301L)
                .points(1)
                .options(List.of(correctOption, wrongOption))
                .build();
        when(questionRepository.findByAssessmentIdOrderByOrderIndexAsc(10L)).thenReturn(List.of(q1));

        AssessmentAnswer answer = AssessmentAnswer.builder()
                .attemptId(50L)
                .questionId(301L)
                .selectedOptionIds("201")
                .build();
        when(answerRepository.findByAttemptId(50L)).thenReturn(List.of(answer));
        when(attemptRepository.save(any(AssessmentAttempt.class))).thenAnswer(i -> i.getArgument(0));

        SubmitAttemptRequest request = new SubmitAttemptRequest();
        SubmitAttemptRequest.AnswerDto qa = new SubmitAttemptRequest.AnswerDto();
        qa.setQuestionId(301L);
        qa.setSelectedOptionIds(List.of(201L));
        request.setAnswers(List.of(qa));

        AttemptResultResponse result = assessmentService.submitAttempt(principal, 50L, request);

        assertNotNull(result);
        assertEquals(1, result.getScore());
        assertEquals(1, result.getMaxScore());
        assertTrue(result.getPassed());
        assertEquals(4, result.getAssessedProficiency()); // 100% -> level 4
    }
}
