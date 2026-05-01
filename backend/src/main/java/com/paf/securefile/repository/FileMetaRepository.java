package com.paf.securefile.repository;

import com.paf.securefile.model.FileMeta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FileMetaRepository extends JpaRepository<FileMeta, Long> {
    List<FileMeta> findByUploader(String uploader);
    Optional<FileMeta> findByShareLink(String shareLink);
    List<FileMeta> findByExpiresAtBefore(LocalDateTime dateTime);
}
