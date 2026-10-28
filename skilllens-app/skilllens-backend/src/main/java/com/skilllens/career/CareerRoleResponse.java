package com.skilllens.career;
import lombok.*; import java.time.Instant;
@Data @Builder public class CareerRoleResponse {
    private Long id; private String title; private String description;
    private String industry; private String avgSalaryRange;
}
