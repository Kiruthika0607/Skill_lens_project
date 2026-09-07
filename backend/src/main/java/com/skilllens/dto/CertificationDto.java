package com.skilllens.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificationDto {
    private Long id;
    private String name;
    private String provider;
    private String difficulty;
    private String url;
    private String description;
    private List<String> skills;
}
