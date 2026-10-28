package com.skilllens.skill;
import jakarta.validation.constraints.*;
import lombok.Data;
@Data
public class AddStudentSkillRequest {
    @NotNull private Long skillId;
    @Min(0) @Max(4) private Integer selfReportedProficiency;
    @Size(max=500) private String notes;
}
