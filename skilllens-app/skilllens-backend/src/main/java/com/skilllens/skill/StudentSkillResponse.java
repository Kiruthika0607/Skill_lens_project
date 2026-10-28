package com.skilllens.skill;
import lombok.Builder; import lombok.Data;
import java.time.Instant;
@Data @Builder
public class StudentSkillResponse {
    private Long id;
    private Long skillId;
    private String skillName;
    private String skillCategory;
    private Integer selfReportedProficiency;
    private Integer assessedProficiency;
    private Instant lastAssessedAt;
    private String notes;
    private Instant createdAt;
}
