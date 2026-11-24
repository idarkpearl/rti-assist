package org.rtiassist.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.tika.Tika;
import org.rtiassist.config.DotenvConfig;
import org.rtiassist.entity.DocumentEntity;
import org.rtiassist.model.CaseDocument;
import org.rtiassist.model.CaseItem;
import org.rtiassist.repository.DocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final CaseService caseService;
    private final DotenvConfig dotenvConfig;
    private final Tika tika = new Tika();

    public DocumentService(DocumentRepository documentRepository, CaseService caseService, DotenvConfig dotenvConfig) {
        this.documentRepository = documentRepository;
        this.caseService = caseService;
        this.dotenvConfig = dotenvConfig;
    }

    @Transactional
    public Map<String, Object> storeDocument(String caseId, MultipartFile file, String category, String userId) throws IOException {
        CaseItem caseItem = caseService.getCaseById(caseId, userId);
        if (caseItem == null) {
            return null;
        }

        byte[] bytes = file.getBytes();
        String originalFilename = file.getOriginalFilename() != null ? Paths.get(file.getOriginalFilename()).getFileName().toString() : "document.bin";
        String safeFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String detectedMime = tika.detect(bytes, safeFilename);

        String docId = "doc-" + UUID.randomUUID().toString().substring(0, 10);
        Path uploadRoot = Paths.get(dotenvConfig.getUploadDir(), caseId).toAbsolutePath().normalize();
        Files.createDirectories(uploadRoot);

        Path targetPath = uploadRoot.resolve(docId + "_" + safeFilename).normalize();
        if (!targetPath.startsWith(uploadRoot)) {
            throw new SecurityException("Invalid file path");
        }
        Files.write(targetPath, bytes);

        String now = Instant.now().toString();
        String kind = (category != null && !category.isBlank()) ? category.trim() : "attachment";

        CaseDocument doc = new CaseDocument();
        doc.setId(docId);
        doc.setCaseId(caseId);
        doc.setFileName(originalFilename);
        doc.setFileSize((long) bytes.length);
        doc.setMimeType(detectedMime);
        doc.setFileUrl("/api/documents/" + docId + "/download");
        doc.setCategory(kind);
        doc.setUploadedAt(now);

        DocumentEntity entity = new DocumentEntity(doc, targetPath.toString(), kind);
        documentRepository.save(entity);

        // Return public download URL in API model while keeping filesystem path in DB
        String extractedText = null;
        if ("application/pdf".equalsIgnoreCase(detectedMime) || safeFilename.toLowerCase().endsWith(".pdf")) {
            extractedText = extractPdfText(bytes);
        } else if (detectedMime != null && detectedMime.startsWith("text/")) {
            extractedText = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("document", doc);
        if (extractedText != null && !extractedText.isBlank()) {
            result.put("extractedText", extractedText.length() > 5000 ? extractedText.substring(0, 5000) : extractedText);
        }
        return result;
    }

    public DocumentEntity getDocumentEntity(String docId) {
        if (docId == null) return null;
        return documentRepository.findById(docId).orElse(null);
    }

    public byte[] loadDocumentBytes(DocumentEntity entity) throws IOException {
        if (entity == null || entity.getStoragePath() == null) return null;
        Path path = Paths.get(entity.getStoragePath());
        if (!Files.exists(path)) return null;
        return Files.readAllBytes(path);
    }

    @Transactional
    public boolean deleteDocument(String docId, String userId) throws IOException {
        DocumentEntity entity = documentRepository.findById(docId).orElse(null);
        if (entity == null) return false;
        CaseItem parent = caseService.getCaseById(entity.getCaseId(), userId);
        if (parent == null) return false;

        if (entity.getStoragePath() != null && !entity.getStoragePath().equals("#")) {
            Path path = Paths.get(entity.getStoragePath());
            Files.deleteIfExists(path);
        }
        documentRepository.deleteById(docId);
        return true;
    }

    public String extractPdfText(byte[] pdfBytes) {
        try (PDDocument pdf = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(pdf);
            return text != null ? text.trim() : "";
        } catch (Exception e) {
            return "";
        }
    }
}
