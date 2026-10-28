package com.skilllens.resume;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Path;

public interface StorageService {
    String store(MultipartFile file, String directory);
    InputStream loadAsStream(String filePath);
    Resource loadAsResource(String filePath);
    void delete(String filePath);
    Path getFullPath(String filePath);
}
