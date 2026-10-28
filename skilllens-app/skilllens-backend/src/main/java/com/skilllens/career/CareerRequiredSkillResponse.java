package com.skilllens.career;
import lombok.*;
@Data @Builder public class CareerRequiredSkillResponse {
    private Long id; private Long careerId; private Long skillId;
    private int minProficiency; private double weight; private boolean required;
}
