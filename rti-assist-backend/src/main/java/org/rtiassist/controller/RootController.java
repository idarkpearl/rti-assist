package org.rtiassist.controller;

import org.rtiassist.config.DotenvConfig;
import org.rtiassist.repository.JsonDataStore;
import org.rtiassist.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class RootController {

    private final DotenvConfig dotenvConfig;
    private final JsonDataStore dataStore;
    private final GeminiService geminiService;

    public RootController(DotenvConfig dotenvConfig, JsonDataStore dataStore, GeminiService geminiService) {
        this.dotenvConfig = dotenvConfig;
        this.dataStore = dataStore;
        this.geminiService = geminiService;
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("name", "RTI Assist Backend API (Spring Boot)");
        resp.put("status", "ONLINE");
        resp.put("version", "1.0.0");
        resp.put("framework", "Java Spring Boot 3.4.2");
        resp.put("port", dotenvConfig.getPort());

        Map<String, Object> gemini = new LinkedHashMap<>();
        gemini.put("configured", geminiService.isConfigured());
        gemini.put("model", geminiService.getModel());
        gemini.put("status", geminiService.isConfigured()
                ? "Active (Google Gemini)"
                : "Fallback Mode Active (Paste GEMINI_API_KEY in .env to enable live Gemini)");
        resp.put("geminiAi", gemini);

        Map<String, Object> counts = new LinkedHashMap<>();
        counts.put("authorities", dataStore.getAuthorities(null, null, null).size());
        counts.put("cases", dataStore.getCases(null, null).size());
        counts.put("deadlines", dataStore.getDeadlines(null, null).size());
        resp.put("counts", counts);

        resp.put("documentation", "See BACKEND_HANDOVER_REPORT.md in frontend directory");
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", "ok");
        resp.put("timestamp", Instant.now().toString());
        resp.put("geminiConfigured", geminiService.isConfigured());
        resp.put("model", geminiService.getModel());
        resp.put("casesCount", dataStore.getCases(null, null).size());
        resp.put("authoritiesCount", dataStore.getAuthorities(null, null, null).size());
        return ResponseEntity.ok(resp);
    }
}
