package com.skilllens.resume;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skilllens.common.exception.ProcessingException;
import com.skilllens.skill.Skill;
import com.skilllens.skill.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeParserService {

    private final SkillRepository skillRepository;
    private final ObjectMapper objectMapper;
    private final Tika tika = new Tika();

    public String extractText(InputStream inputStream) {
        try {
            String text = tika.parseToString(inputStream);
            if (text == null || text.isBlank()) {
                throw new ProcessingException("Extracted resume text is empty");
            }
            return text.trim();
        } catch (Exception e) {
            log.error("Failed to extract text from resume", e);
            throw new ProcessingException("Failed to extract text from document: " + e.getMessage(), e);
        }
    }

    public ParsedResumeDto parseResumeText(String text) {
        List<Skill> catalogSkills = skillRepository.findAll();
        List<ExtractedSkillDto> matchedSkills = new ArrayList<>();

        String lowerText = text.toLowerCase();

        for (Skill skill : catalogSkills) {
            String skillName = skill.getName();
            // Word boundary match
            String patternString = "\\b" + Pattern.quote(skillName.toLowerCase()) + "\\b";
            Pattern pattern = Pattern.compile(patternString, Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(text);

            int count = 0;
            while (matcher.find()) {
                count++;
            }

            if (count > 0) {
                // Determine suggested proficiency based on occurrences and context
                int suggestedProficiency;
                double confidence;
                if (count >= 5) {
                    suggestedProficiency = 4;
                    confidence = 0.95;
                } else if (count >= 3) {
                    suggestedProficiency = 3;
                    confidence = 0.90;
                } else if (count >= 2) {
                    suggestedProficiency = 2;
                    confidence = 0.85;
                } else {
                    suggestedProficiency = 1;
                    confidence = 0.75;
                }

                matchedSkills.add(ExtractedSkillDto.builder()
                        .skillId(skill.getId())
                        .skillName(skill.getName())
                        .category(skill.getCategory() != null ? skill.getCategory().getName() : "General")
                        .matchedOccurrences(count)
                        .suggestedProficiency(suggestedProficiency)
                        .confidence(confidence)
                        .build());
            }
        }

        // Sort matched skills by occurrences descending
        matchedSkills.sort((a, b) -> Integer.compare(b.getMatchedOccurrences(), a.getMatchedOccurrences()));

        // Extract education lines
        List<String> education = extractSectionLines(text,
                List.of("education", "academic", "academics", "qualifications", "academic background"));

        // Extract experience lines
        List<String> experience = extractSectionLines(text,
                List.of("experience", "work experience", "employment", "internship", "internships", "projects", "project experience"));

        // Extract email and phone
        String email = extractRegex(text, "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
        String phone = extractRegex(text, "(\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}");

        return ParsedResumeDto.builder()
                .email(email)
                .phone(phone)
                .skills(matchedSkills)
                .education(education)
                .experience(experience)
                .build();
    }

    private String extractRegex(String text, String regex) {
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }

    private List<String> extractSectionLines(String text, List<String> keywords) {
        List<String> results = new ArrayList<>();
        String[] lines = text.split("\\r?\\n");
        boolean capture = false;
        int capturedCount = 0;

        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isBlank()) continue;

            String lower = line.toLowerCase();
            boolean isHeader = line.length() < 35 && keywords.stream().anyMatch(k ->
                    lower.equals(k) || lower.startsWith(k + ":") || lower.startsWith(k + " -") || lower.endsWith(" " + k));

            if (isHeader) {
                capture = true;
                continue;
            }

            if (capture) {
                // If line looks like a new unrelated major section header, stop capture
                if (line.length() < 30 && (lower.contains("certifications") || lower.contains("awards") || lower.contains("hobbies") || lower.contains("skills") || lower.contains("languages"))) {
                    break;
                }
                results.add(line);
                capturedCount++;
                if (capturedCount >= 6) {
                    break;
                }
            }
        }
        return results;
    }
}
