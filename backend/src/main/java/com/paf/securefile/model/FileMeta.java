package com.paf.securefile.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "files")
@Data
@NoArgsConstructor
public class FileMeta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String filename; // Saved file name (encrypted) on disk

    @Column(nullable = false)
    private String originalName; // Original file name

    @Column(nullable = false)
    private Long size; // File size in bytes

    @Column(nullable = false, length = 191)
    private String uploader; // Username of uploader

    @Column(nullable = false)
    private LocalDateTime uploadDate;

    @Column(unique = true, nullable = false, length = 191)
    private String shareLink; // 16-byte hex string

    // New Fields
    private String passwordHash; // Optional password hash
    
    private LocalDateTime expiresAt; // Expiration time
    
    @Column(name = "is_one_time", nullable = false)
    private boolean isOneTime; // Whether it is a one-time download
}
