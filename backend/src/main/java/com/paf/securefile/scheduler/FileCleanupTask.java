package com.paf.securefile.scheduler;

import com.paf.securefile.model.FileMeta;
import com.paf.securefile.repository.FileMetaRepository;
import com.paf.securefile.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class FileCleanupTask {

    @Autowired
    private FileMetaRepository fileMetaRepository;

    @Autowired
    private FileService fileService;

    // Runs every 10 minutes
    @Scheduled(fixedRate = 600000)
    public void cleanupExpiredFiles() {
        System.out.println("Running FileCleanupTask...");
        List<FileMeta> expiredFiles = fileMetaRepository.findByExpiresAtBefore(LocalDateTime.now());
        
        for (FileMeta meta : expiredFiles) {
            System.out.println("Deleting expired file: " + meta.getShareLink());
            fileService.deleteFileAndMeta(meta);
        }
    }
}
