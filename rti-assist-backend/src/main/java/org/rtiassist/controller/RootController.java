package org.rtiassist.controller;

import org.rtiassist.config.DotenvConfig;
import org.rtiassist.repository.DocumentRepository;
import org.rtiassist.repository.UserRepository;
import org.rtiassist.service.AppealService;
import org.rtiassist.service.AuthorityService;
import org.rtiassist.service.CaseService;
import org.rtiassist.service.DeadlineService;
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
    private final AuthorityService authorityService;
    private final CaseService caseService;
    private final DeadlineService deadlineService;
    private final AppealService appealService;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;

    public RootController(
            DotenvConfig dotenvConfig,
            AuthorityService authorityService,
            CaseService caseService,
            DeadlineService deadlineService,
            AppealService appealService,
            DocumentRepository documentRepository,
            UserRepository userRepository,
            GeminiService geminiService
    ) {
        this.dotenvConfig = dotenvConfig;
        this.authorityService = authorityService;
        this.caseService = caseService;
        this.deadlineService = deadlineService;
        this.appealService = appealService;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.geminiService = geminiService;
    }

    private String getDatabaseEngineName() {
        return dotenvConfig.getDbUrl().startsWith("jdbc:postgresql:")
                ? "PostgreSQL"
                : "H2 Embedded SQL (PostgreSQL Mode)";
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("name", "RTI Assist Backend API (Spring Boot)");
        resp.put("status", "ONLINE");
        resp.put("version", "1.0.0");
        resp.put("framework", "Java Spring Boot 3.4.2");
        resp.put("database", getDatabaseEngineName());
        resp.put("port", dotenvConfig.getPort());

        Map<String, Object> gemini = new LinkedHashMap<>();
        gemini.put("configured", geminiService.isConfigured());
        gemini.put("model", geminiService.getModel());
        gemini.put("status", geminiService.isConfigured()
                ? "Active (Google Gemini)"
                : "Fallback Mode Active (Paste GEMINI_API_KEY in .env to enable live Gemini)");
        resp.put("geminiAi", gemini);

        Map<String, Object> counts = new LinkedHashMap<>();
        counts.put("users", userRepository.count());
        counts.put("authorities", authorityService.count());
        counts.put("cases", caseService.count());
        counts.put("deadlines", deadlineService.count());
        counts.put("appeals", appealService.count());
        counts.put("documents", documentRepository.count());
        resp.put("counts", counts);

        resp.put("documentation", "See PROJECT_CONTEXT.md in root directory");
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("status", "ok");
        resp.put("timestamp", Instant.now().toString());
        resp.put("database", getDatabaseEngineName());
        resp.put("geminiConfigured", geminiService.isConfigured());
        resp.put("model", geminiService.getModel());
        resp.put("usersCount", userRepository.count());
        resp.put("casesCount", caseService.count());
        resp.put("authoritiesCount", authorityService.count());
        resp.put("appealsCount", appealService.count());
        resp.put("documentsCount", documentRepository.count());
        return ResponseEntity.ok(resp);
    }
}
