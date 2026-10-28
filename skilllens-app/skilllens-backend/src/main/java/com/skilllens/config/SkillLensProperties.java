package com.skilllens.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Binds all {@code skilllens.*} properties from application.yml.
 */
@Data
@ConfigurationProperties(prefix = "skilllens")
public class SkillLensProperties {

    private Jwt jwt = new Jwt();
    private Gcs gcs = new Gcs();
    private Ai ai = new Ai();
    private Resume resume = new Resume();
    private Cors cors = new Cors();
    private RateLimit rateLimit = new RateLimit();
    private Admin admin = new Admin();
    private Scheduler scheduler = new Scheduler();

    @Data
    public static class Jwt {
        private String secret;
        private long accessTokenExpiryMs = 900_000L;
        private long refreshTokenExpiryMs = 604_800_000L;
    }

    @Data
    public static class Gcs {
        private boolean enabled = false;
        private String projectId;
        private String bucketName;
        private String credentialsPath;
        private String localFallbackDir = "./uploads";
    }

    @Data
    public static class Ai {
        private String provider = "gemini";
        private Anthropic anthropic = new Anthropic();
        private Gemini gemini = new Gemini();

        @Data
        public static class Anthropic {
            private String apiKey;
            private String model = "claude-3-5-haiku-20241022";
            private int maxTokens = 4096;
            private int timeoutSeconds = 60;
            private boolean enabled = false;
        }

        @Data
        public static class Gemini {
            private String apiKey;
            private String model = "gemini-2.5-flash";
            private int timeoutSeconds = 30;
            private boolean enabled = false;
        }
    }

    @Data
    public static class Resume {
        private List<String> allowedMimeTypes = List.of(
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/msword"
        );
        private long maxFileSizeBytes = 10_485_760L;
    }

    @Data
    public static class Cors {
        private List<String> allowedOrigins = List.of("http://localhost:3000");
        private long maxAge = 3600L;
    }

    @Data
    public static class RateLimit {
        private long authRequestsPerMinute = 10L;
        private long apiRequestsPerMinute = 100L;
    }

    @Data
    public static class Admin {
        private String initEmail;
        private String initPassword;
    }

    @Data
    public static class Scheduler {
        private String opportunitySyncCron = "0 0 */6 * * *";
        private String expiryCheckCron    = "0 0 1 * * *";
        private String linkCheckCron      = "0 0 3 * * SUN";
        private String notificationCron   = "0 */15 * * * *";
        private String analyticsCron      = "0 0 0 * * *";
        private String resumeRetryCron    = "0 */10 * * * *";
    }
}
