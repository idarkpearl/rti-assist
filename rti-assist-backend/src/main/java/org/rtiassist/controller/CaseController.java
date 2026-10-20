package org.rtiassist.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.rtiassist.dto.AuthorityRecommendationResponse;
import org.rtiassist.exception.ApiException;
import org.rtiassist.model.*;
import org.rtiassist.repository.JsonDataStore;
import org.rtiassist.service.GeminiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final JsonDataStore dataStore;
    private final GeminiService geminiService;

    public CaseController(JsonDataStore dataStore, GeminiService geminiService) {
        this.dataStore = dataStore;
        this.geminiService = geminiService;
    }

    @GetMapping
    public ResponseEntity<List<CaseItem>> listCases(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        List<CaseItem> list = dataStore.getCases(status, search);
        return ResponseEntity.ok(list);
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
    public ResponseEntity<CaseItem> getCase(@PathVariable String id) {
        CaseItem c = dataStore.getCaseById(id);
        if (c == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found with id: " + id);
        }
        return ResponseEntity.ok(c);
    }

    @PostMapping
    public ResponseEntity<CaseItem> createCase(@RequestBody CaseItem data, HttpServletRequest request) {
        User authUser = (User) request.getAttribute("currentUser");
        if (authUser != null && data.getApplicant() == null) {
            data.setApplicant(new ApplicantInfo(authUser.getName(), authUser.getEmail()));
        }

        CaseItem created = dataStore.createCase(data);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CaseItem> updateCase(@PathVariable String id, @RequestBody CaseItem updates) {
        CaseItem updated = dataStore.updateCase(id, updates);
        if (updated == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found with id: " + id);
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCase(@PathVariable String id) {
        boolean removed = dataStore.deleteCase(id);
        if (!removed) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found with id: " + id);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Case deleted successfully"));
    }

    @GetMapping("/{id}/appeals")
    public ResponseEntity<List<Appeal>> getCaseAppeals(@PathVariable String id) {
        CaseItem c = dataStore.getCaseById(id);
        if (c == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found with id: " + id);
        }
        return ResponseEntity.ok(dataStore.getAppeals(id));
    }

    @GetMapping("/{id}/deadlines")
    public ResponseEntity<List<Deadline>> getCaseDeadlines(@PathVariable String id) {
        CaseItem c = dataStore.getCaseById(id);
        if (c == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found with id: " + id);
        }
        return ResponseEntity.ok(dataStore.getDeadlines(id, null));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<CaseDocument>> getCaseDocuments(@PathVariable String id) {
        CaseItem c = dataStore.getCaseById(id);
        if (c == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found with id: " + id);
        }
        return ResponseEntity.ok(c.getDocuments() != null ? c.getDocuments() : Collections.emptyList());
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<CaseDocument> addDocument(@PathVariable String id, @RequestBody CaseDocument docData) {
        CaseDocument doc = dataStore.addDocumentToCase(id, docData);
        if (doc == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Case not found with id: " + id);
        }
        return new ResponseEntity<>(doc, HttpStatus.CREATED);
    }
}
