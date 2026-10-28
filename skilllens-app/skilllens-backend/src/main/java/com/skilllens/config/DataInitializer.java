package com.skilllens.config;

import com.skilllens.student.StudentProfile;
import com.skilllens.student.StudentProfileRepository;
import com.skilllens.user.Role;
import com.skilllens.user.User;
import com.skilllens.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        initializeAdminUser();
        initializeStudentUser();
    }

    private void initializeAdminUser() {
        String adminEmail = "admin@skilllens.com";
        if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {
            User admin = User.builder()
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode("Admin@12345"))
                    .role(Role.ADMIN)
                    .enabled(true)
                    .emailVerified(true)
                    .build();
            userRepository.save(admin);
            log.info("Initialized default administrator account: {}", adminEmail);
        }
    }

    private void initializeStudentUser() {
        String studentEmail = "student@skilllens.com";
        if (!userRepository.existsByEmailIgnoreCase(studentEmail)) {
            User student = User.builder()
                    .email(studentEmail)
                    .passwordHash(passwordEncoder.encode("Student@12345"))
                    .role(Role.STUDENT)
                    .enabled(true)
                    .emailVerified(true)
                    .build();
            student = userRepository.save(student);

            StudentProfile profile = StudentProfile.builder()
                    .userId(student.getId())
                    .firstName("Alex")
                    .lastName("Mercer")
                    .degree("B.Tech in Computer Science & Engineering")
                    .institution("National Institute of Technology")
                    .department("Computer Science")
                    .graduationYear(2027)
                    .gpa(new BigDecimal("3.85"))
                    .gpaScale(new BigDecimal("4.00"))
                    .preferredCareerRole("Full Stack Software Engineer")
                    .openToRemote(true)
                    .yearsOfExperience(1)
                    .bio("Passionate junior engineering student aspiring to build distributed backends and modern web applications.")
                    .build();
            profileRepository.save(profile);
            log.info("Initialized default demo student account: {} with academic profile", studentEmail);
        }
    }
}
