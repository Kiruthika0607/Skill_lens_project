package com.skilllens.resume;

import com.skilllens.common.exception.ProcessingException;
import com.skilllens.common.exception.ResourceNotFoundException;
import com.skilllens.config.SkillLensProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocalStorageService implements StorageService {

    private final SkillLensProperties properties;

    private Path getRootLocation() {
        String baseDir = properties.getGcs() != null && StringUtils.hasText(properties.getGcs().getLocalFallbackDir())
                ? properties.getGcs().getLocalFallbackDir()
                : "./uploads";
        Path path = Paths.get(baseDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(path);
        } catch (IOException e) {
            throw new ProcessingException("Could not initialize storage directory: " + path, e);
        }
        return path;
    }

    @Override
    public String store(MultipartFile file, String directory) {
        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");

        if (originalFilename.contains("..")) {
            throw new ProcessingException("Invalid file path sequence in filename: " + originalFilename);
        }

        String extension = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx >= 0) {
            extension = originalFilename.substring(dotIdx);
        }

        String storedName = UUID.randomUUID() + extension;
        Path targetDir = getRootLocation().resolve(directory);

        try {
            Files.createDirectories(targetDir);
            Path destination = targetDir.resolve(storedName);
            try (InputStream is = file.getInputStream()) {
                Files.copy(is, destination, StandardCopyOption.REPLACE_EXISTING);
            }
            log.info("Stored file {} as {}", originalFilename, destination);
            return directory + "/" + storedName;
        } catch (IOException e) {
            log.error("Failed to store file: {}", originalFilename, e);
            throw new ProcessingException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Override
    public InputStream loadAsStream(String filePath) {
        try {
            Path file = getFullPath(filePath);
            return Files.newInputStream(file);
        } catch (IOException e) {
            throw new ResourceNotFoundException("Could not read file: " + filePath);
        }
    }

    @Override
    public Resource loadAsResource(String filePath) {
        try {
            Path file = getFullPath(filePath);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Could not read file: " + filePath);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Could not read file: " + filePath);
        }
    }

    @Override
    public void delete(String filePath) {
        try {
            Path file = getFullPath(filePath);
            Files.deleteIfExists(file);
        } catch (IOException e) {
            log.warn("Failed to delete file: {}", filePath, e);
        }
    }

    @Override
    public Path getFullPath(String filePath) {
        return getRootLocation().resolve(filePath).normalize();
    }
}
