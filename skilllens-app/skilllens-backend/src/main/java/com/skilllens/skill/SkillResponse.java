package com.skilllens.skill;
import lombok.Builder; import lombok.Data;
@Data @Builder
public class SkillResponse {
    private Long id;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private String tags;
}
