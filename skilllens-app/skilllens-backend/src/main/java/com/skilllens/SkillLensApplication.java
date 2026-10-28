package com.skilllens;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * SkillLens Application Entry Point
 * <p>
 * Career Guidance and Opportunity Aggregation Platform — Backend API.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
@EnableAsync
@ConfigurationPropertiesScan
public class SkillLensApplication {

    public static void main(String[] args) {
        SpringApplication.run(SkillLensApplication.class, args);
    }
}
