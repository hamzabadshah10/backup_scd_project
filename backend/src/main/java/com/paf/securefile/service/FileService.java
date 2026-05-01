package com.paf.securefile.service;

import com.paf.securefile.exception.InvalidPasswordException;
import com.paf.securefile.exception.ResourceNotFoundException;
import com.paf.securefile.model.FileMeta;
import com.paf.securefile.repository.FileMetaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.CipherInputStream;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FileService {

    @Autowired
    private FileMetaRepository fileMetaRepository;

    @Autowired
    private EncryptionService encryptionService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final SecureRandom secureRandom = new SecureRandom();
    private static final String HEX_ARRAY = "0123456789ABCDEF";

    public FileMeta uploadFile(MultipartFile file, String uploader, String password, boolean isOneTime,
            boolean is24Hour) throws Exception {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String shareLink = generateShareLink();
        String storedFilename = shareLink + ".enc";

        // Encrypt and save
        try (InputStream inputStream = file.getInputStream();
                FileOutputStream fileOutputStream = new FileOutputStream(Paths.get(uploadDir, storedFilename).toFile());
                CipherInputStream cipherInputStream = encryptionService.encryptStream(inputStream)) {

            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = cipherInputStream.read(buffer)) != -1) {
                fileOutputStream.write(buffer, 0, bytesRead);
            }
        }

        FileMeta meta = new FileMeta();
        meta.setFilename(storedFilename);
        meta.setOriginalName(file.getOriginalFilename());
        meta.setSize(file.getSize());
        meta.setUploader(uploader);
        meta.setUploadDate(LocalDateTime.now());
        meta.setShareLink(shareLink);

        if (is24Hour) {
            meta.setExpiresAt(LocalDateTime.now().plusHours(24));
        }

        if (password != null && !password.isEmpty()) {
            meta.setPasswordHash(passwordEncoder.encode(password));
        }

        meta.setOneTime(isOneTime);

        return fileMetaRepository.save(meta);
    }

    public InputStream downloadFile(String shareLink, String password) throws Exception {
        FileMeta meta = fileMetaRepository.findByShareLink(shareLink)
                .orElseThrow(() -> new ResourceNotFoundException("File not found or link expired."));

        if (meta.getExpiresAt() != null && meta.getExpiresAt().isBefore(LocalDateTime.now())) {
            deleteFileAndMeta(meta);
            throw new ResourceNotFoundException("Link has expired.");
        }

        if (meta.getPasswordHash() != null) {
            if (password == null || !passwordEncoder.matches(password, meta.getPasswordHash())) {
                throw new InvalidPasswordException("Invalid or missing password.");
            }
        }

        Path filePath = Paths.get(uploadDir).resolve(meta.getFilename());
        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("Encrypted file missing on server.");
        }

        FileInputStream fis = new FileInputStream(filePath.toFile());
        InputStream decryptedStream = encryptionService.decryptStream(fis);

        if (meta.isOneTime()) {
            // Background thread to delete after giving the stream?
            // Safer: delete immediately after reading, or rely on scheduler fo
            // For streams, we delete the meta, file stays until stream closes.
            //
            // In Windows, cannot delete open file. We will just delete meta, scheduler
            // leans orphaned files?
            // Better: just delete from DB now, file on disk will be orphaned but we can
            // delete it after stream closes.
            fileMetaRepository.delete(meta);
            //
            // We should ideally clean disk later. The stream will be consumed in the
            // controller.
            // For this project, setting a flag or using a wrapper stream is complex.
            // We'll mark it expired so the scheduler cleans it up later.
            meta.setExpiresAt(LocalDateTime.now().minusMinutes(1)); // expired!
            fileMetaRepository.save(meta);
        }

        return decryptedStream;
    }

    public FileMeta getFileMeta(String shareLink) {
        FileMeta meta = fileMetaRepository.findByShareLink(shareLink)
                .orElseThrow(() -> new ResourceNotFoundException("File not found."));
        if (meta.getExpiresAt() != null && meta.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResourceNotFoundException("Link has expired.");
        }
        return meta;
    }

    public List<FileMeta> getUserFiles(String username) {
        return fileMetaRepository.findByUploader(username);
    }

    public void revokeAccess(Long id, String username) {
        FileMeta meta = fileMetaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File not found."));

        if (!meta.getUploader().equals(username)) {
            throw new RuntimeException("Unauthorized to revoke this file.");
        }

        deleteFileAndMeta(meta);
    }

    public void deleteFileAndMeta(FileMeta meta) {
        Path filePath = Paths.get(uploadDir).resolve(meta.getFilename());
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Ignore if file already deleted or in use
        }
        fileMetaRepository.delete(meta);
    }

    private String generateShareLink() {
        String link;
        do {
            byte[] bytes = new byte[16];
            secureRandom.nextBytes(bytes);
            StringBuilder hexString = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                hexString.append(HEX_ARRAY.charAt((b & 0xF0) >> 4));
                hexString.append(HEX_ARRAY.charAt((b & 0x0F)));
            }
            link = hexString.toString().toLowerCase();
        } while (fileMetaRepository.findByShareLink(link).isPresent());

        return link;
    }
}
