package org.rtiassist.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.rtiassist.config.DotenvConfig;
import org.rtiassist.dto.*;
import org.rtiassist.exception.ApiException;
import org.rtiassist.model.CaseItem;
import org.rtiassist.model.User;
import org.rtiassist.repository.JsonDataStore;
import org.rtiassist.service.GeminiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class AiController {

    private final GeminiService geminiService;
    private final JsonDataStore dataStore;
    private final DotenvConfig dotenvConfig;

    public AiController(GeminiService geminiService, JsonDataStore dataStore, DotenvConfig dotenvConfig) {
        this.geminiService = geminiService;
        this.dataStore = dataStore;
        this.dotenvConfig = dotenvConfig;
    }

    @GetMapping({"/api/ai/status", "/status"})
    public ResponseEntity<Map<String, Object>> aiStatus() {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("geminiConfigured", geminiService.isConfigured());
        resp.put("model", geminiService.getModel());
        resp.put("provider", geminiService.isConfigured() ? "Google Gemini AI" : "Legal Engine Fallback (Add key in .env)");
        return ResponseEntity.ok(resp);
    }

    @PostMapping({"/api/recommend-authority", "/recommend-authority"})
    public ResponseEntity<AuthorityRecommendationResponse> recommendAuthority(@RequestBody(required = false) Map<String, Object> body) {
        String draftText = "";
        if (body != null && body.containsKey("draftText")) {
            draftText = String.valueOf(body.get("draftText"));
        }
        AuthorityRecommendationResponse resp = geminiService.recommendAuthority(draftText);
        return ResponseEntity.ok(resp);
    }

    @PostMapping({"/api/draft-request", "/draft-request"})
    public ResponseEntity<DraftRequestDto> draftRequest(@RequestBody(required = false) Map<String, Object> body, HttpServletRequest request) {
        String concern = "";
        if (body != null) {
            if (body.containsKey("concern")) {
                concern = String.valueOf(body.get("concern"));
            } else if (body.containsKey("title")) {
                concern = String.valueOf(body.get("title"));
            }
        }

        if (concern.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Concern description cannot be blank");
        }

        System.out.println("[AI] Drafting RTI request for: \"" + (concern.length() > 60 ? concern.substring(0, 60) + "..." : concern) + "\"");
        DraftRequestDto result = geminiService.draftRtiRequest(concern);
        return ResponseEntity.ok(result);
    }

    @PostMapping({"/api/draft-appeal", "/draft-appeal"})
    public ResponseEntity<DraftAppealDto> draftAppeal(@RequestBody(required = false) Map<String, Object> body) {
        String caseId = (body != null && body.containsKey("caseId")) ? String.valueOf(body.get("caseId")) : null;
        String appealType = (body != null && body.containsKey("appealType")) ? String.valueOf(body.get("appealType")) : "first";
        Object caseDetails = (body != null) ? body.get("caseDetails") : null;

        if (caseDetails == null && caseId != null) {
            caseDetails = dataStore.getCaseById(caseId);
        }

        if (caseDetails == null) {
            Map<String, Object> defaultDetails = new LinkedHashMap<>();
            defaultDetails.put("trackingNumber", caseId != null ? caseId : "RTI-2026-0042");
            defaultDetails.put("authority", dataStore.getAuthorities(null, null, null).get(0));
            defaultDetails.put("filingDate", java.time.Instant.now().toString());
            caseDetails = defaultDetails;
        }

        System.out.println("[AI] Drafting " + appealType + " appeal for case: " + caseId);
        DraftAppealDto result = geminiService.draftAppealPetition(caseDetails, appealType);
        return ResponseEntity.ok(result);
    }

    @PostMapping({"/api/classify-response", "/classify-response"})
    public ResponseEntity<ClassificationResult> classifyResponse(@RequestBody(required = false) ClassifyRequestDto body) {
        if (body == null || body.getResponseText() == null || body.getResponseText().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Response text is required and must be a non-empty string.");
        }

        if (body.getResponseText().length() > 5000) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR",
                    "Response text exceeds the maximum allowed length of 5000 characters (received " + body.getResponseText().length() + ").");
        }

        System.out.println("[AI] Classifying response: \"" +
                (body.getResponseText().length() > 60 ? body.getResponseText().substring(0, 60) + "..." : body.getResponseText()) + "\"");

        ClassificationResult result = geminiService.classifyResponse(body.getResponseText().trim(), body.getRequestContext());
        return ResponseEntity.ok(result);
    }
}
