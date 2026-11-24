package org.rtiassist.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.rtiassist.entity.DocumentEntity;
import org.rtiassist.exception.ApiException;
import org.rtiassist.model.CaseItem;
import org.rtiassist.model.User;
import org.rtiassist.service.CaseService;
import org.rtiassist.service.DocumentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DocumentController {

    private final DocumentService documentService;
    private final CaseService caseService;

    public DocumentController(DocumentService documentService, CaseService caseService) {
        this.documentService = documentService;
        this.caseService = caseService;
    }

    private String getUserId(HttpServletRequest request) {
        User authUser = (User) request.getAttribute("currentUser");
        return (authUser != null) ? authUser.getId() : null;
    }

    @PostMapping(value = "/cases/{caseId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @PathVariable String caseId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false, defaultValue = "attachment") String category,
            HttpServletRequest request
    ) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "A non-empty file is required.");
        }

        Map<String, Object> result = documentService.storeDocument(caseId, file, category, getUserId(request));
        if (result == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found with id: " + caseId);
        }
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping("/documents/{docId}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable String docId, HttpServletRequest request) throws IOException {
        DocumentEntity entity = documentService.getDocumentEntity(docId);
        if (entity == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Document not found with id: " + docId);
        }

        CaseItem parent = caseService.getCaseById(entity.getCaseId(), getUserId(request));
        if (parent == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Document not found with id: " + docId);
        }

        byte[] content = documentService.loadDocumentBytes(entity);
        if (content == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "FILE_MISSING", "File content is not stored on disk for this document.");
        }

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (entity.getContentType() != null && !entity.getContentType().isBlank()) {
            try {
                mediaType = MediaType.parseMediaType(entity.getContentType());
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + entity.getFilename() + "\"")
                .body(content);
    }

    @DeleteMapping("/documents/{docId}")
    public ResponseEntity<Map<String, Object>> deleteDocument(@PathVariable String docId, HttpServletRequest request) throws IOException {
        boolean deleted = documentService.deleteDocument(docId, getUserId(request));
        if (!deleted) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Document not found with id: " + docId);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Document deleted successfully"));
    }
}
