package com.paf.securefile.controller;

import com.paf.securefile.dto.FileUploadResponse;
import com.paf.securefile.model.FileMeta;
import com.paf.securefile.service.FileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileService fileService;

    private String getUsername(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("username") != null) {
            return (String) session.getAttribute("username");
        }
        return null;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "isOneTime", defaultValue = "false") boolean isOneTime,
            @RequestParam(value = "is24Hour", defaultValue = "false") boolean is24Hour,
            HttpServletRequest request) {
        
        String username = getUsername(request);
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        try {
            FileMeta meta = fileService.uploadFile(file, username, password, isOneTime, is24Hour);
            return ResponseEntity.ok(new FileUploadResponse(meta.getShareLink()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("")
    public ResponseEntity<?> listFiles(HttpServletRequest request) {
        String username = getUsername(request);
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        List<FileMeta> files = fileService.getUserFiles(username);
        return ResponseEntity.ok(files);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable Long id, HttpServletRequest request) {
        String username = getUsername(request);
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        fileService.revokeAccess(id, username);
        return ResponseEntity.ok(Map.of("message", "File deleted successfully."));
    }

    @GetMapping("/download/{link}")
    public ResponseEntity<?> downloadFile(
            @PathVariable String link,
            @RequestParam(required = false) String password) {
        
        try {
            FileMeta meta = fileService.getFileMeta(link);
            
            InputStream decryptedStream = fileService.downloadFile(link, password);
            InputStreamResource resource = new InputStreamResource(decryptedStream);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + meta.getOriginalName() + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(meta.getSize())
                    .body(resource);

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage() != null ? e.getMessage() : "Decryption failed.");
            
            if (e instanceof com.paf.securefile.exception.ResourceNotFoundException) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            if (e instanceof com.paf.securefile.exception.InvalidPasswordException) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Endpoint to check if file needs password without downloading
    @GetMapping("/info/{link}")
    public ResponseEntity<?> getFileInfo(@PathVariable String link) {
        try {
            FileMeta meta = fileService.getFileMeta(link);
            Map<String, Object> info = new HashMap<>();
            info.put("originalName", meta.getOriginalName());
            info.put("size", meta.getSize());
            info.put("isPasswordProtected", meta.getPasswordHash() != null);
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage() != null ? e.getMessage() : "File not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
