package org.rtiassist.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.rtiassist.dto.AuthorityRecommendationResponse;
import org.rtiassist.exception.ApiException;
import org.rtiassist.model.*;
import org.rtiassist.service.CaseService;
import org.rtiassist.service.GeminiService;
import org.rtiassist.service.PdfExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final CaseService caseService;
    private final GeminiService geminiService;
    private final PdfExportService pdfExportService;

    public CaseController(CaseService caseService, GeminiService geminiService, PdfExportService pdfExportService) {
        this.caseService = caseService;
        this.geminiService = geminiService;
        this.pdfExportService = pdfExportService;
    }

    private String getUserId(HttpServletRequest request) {
        User authUser = (User) request.getAttribute("currentUser");
        return (authUser != null) ? authUser.getId() : null;
    }

    @GetMapping
    public ResponseEntity<List<CaseItem>> listCases(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            HttpServletRequest request
    ) {
        String userId = getUserId(request);
        List<CaseItem> list = caseService.listCases(userId, status, search);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/verify-existing")
    public ResponseEntity<Map<String, Object>> verifyExistingRti(
            @RequestBody(required = false) Map<String, Object> body,
            HttpServletRequest request
    ) {
        String userId = getUserId(request);
        return ResponseEntity.ok(caseService.verifyExistingRti(body, userId));
    }

    @PostMapping("/recommend-authority")
    public ResponseEntity<AuthorityRecommendationResponse> recommendAuthority(@RequestBody(required = false) Map<String, Object> body) {
        String draftText = "";
        if (body != null && body.containsKey("draftText")) {
            draftText = String.valueOf(body.get("draftText"));
        }
        AuthorityRecommendationResponse resp = geminiService.recommendAuthority(draftText);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseItem> getCase(@PathVariable String id, HttpServletRequest request) {
        String userId = getUserId(request);
        CaseItem c = caseService.getCaseById(id, userId);
        if (c == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found with id: " + id);
        }
        return ResponseEntity.ok(c);
    }

    @PostMapping
    public ResponseEntity<CaseItem> createCase(@RequestBody CaseItem data, HttpServletRequest request) {
        User authUser = (User) request.getAttribute("currentUser");
        String userId = (authUser != null) ? authUser.getId() : null;
        if (authUser != null && data.getApplicant() == null) {
            data.setApplicant(new ApplicantInfo(authUser.getName(), authUser.getEmail()));
        }

        CaseItem created = caseService.createCase(data, userId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CaseItem> updateCase(
            @PathVariable String id,
            @RequestBody CaseItem updates,
            HttpServletRequest request
    ) {
        String userId = getUserId(request);
        CaseItem updated = caseService.updateCase(id, updates, userId);
        if (updated == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found with id: " + id);
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCase(@PathVariable String id, HttpServletRequest request) {
        String userId = getUserId(request);
        boolean removed = caseService.deleteCase(id, userId);
        if (!removed) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found with id: " + id);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Case deleted successfully"));
    }

    @GetMapping("/{id}/appeals")
    public ResponseEntity<List<Appeal>> getCaseAppeals(@PathVariable String id, HttpServletRequest request) {
        String userId = getUserId(request);
        CaseItem c = caseService.getCaseById(id, userId);
        if (c == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found with id: " + id);
        }
        return ResponseEntity.ok(c.getAppeals() != null ? c.getAppeals() : Collections.emptyList());
    }

    @GetMapping("/{id}/deadlines")
    public ResponseEntity<List<Deadline>> getCaseDeadlines(@PathVariable String id, HttpServletRequest request) {
        String userId = getUserId(request);
        CaseItem c = caseService.getCaseById(id, userId);
        if (c == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found with id: " + id);
        }
        return ResponseEntity.ok(c.getDeadlines() != null ? c.getDeadlines() : Collections.emptyList());
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<CaseDocument>> getCaseDocuments(@PathVariable String id, HttpServletRequest request) {
        String userId = getUserId(request);
        CaseItem c = caseService.getCaseById(id, userId);
        if (c == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found with id: " + id);
        }
        return ResponseEntity.ok(c.getDocuments() != null ? c.getDocuments() : Collections.emptyList());
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> exportCasePdf(@PathVariable String id, HttpServletRequest request) {
        String userId = getUserId(request);
        CaseItem c = caseService.getCaseById(id, userId);
        if (c == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found with id: " + id);
        }
        byte[] pdf = pdfExportService.generateCasePdf(c);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"RTI_" + id + ".pdf\"")
                .body(pdf);
    }
}
