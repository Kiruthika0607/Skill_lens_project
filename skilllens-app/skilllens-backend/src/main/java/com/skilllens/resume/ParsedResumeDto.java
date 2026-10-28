package com.skilllens.resume;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParsedResumeDto {
    private String candidateName;
    private String email;
    private String phone;
    private String summary;
    @Builder.Default
    private List<ExtractedSkillDto> skills = new ArrayList<>();
    @Builder.Default
    private List<String> education = new ArrayList<>();
    @Builder.Default
    private List<String> experience = new ArrayList<>();
}
