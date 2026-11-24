package org.rtiassist.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.rtiassist.entity.*;
import org.rtiassist.model.*;
import org.rtiassist.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.List;
import java.util.Map;

/**
 * DataStoreMigrationService
 * Performs an idempotent one-time migration from data/db.json into PostgreSQL/JPA.
 * If data/db.json exists, its authorities, users, cases, deadlines, and appeals are
 * loaded into the database without duplicating existing primary keys.
 */
@Service
public class DataStoreMigrationService {

    private static final Logger log = LoggerFactory.getLogger(DataStoreMigrationService.class);

    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final CaseRepository caseRepository;
    private final DeadlineRepository deadlineRepository;
    private final AppealRepository appealRepository;
    private final DocumentRepository documentRepository;

    private final ObjectMapper mapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public DataStoreMigrationService(
            UserRepository userRepository,
            AuthorityRepository authorityRepository,
            CaseRepository caseRepository,
            DeadlineRepository deadlineRepository,
            AppealRepository appealRepository,
            DocumentRepository documentRepository
    ) {
        this.userRepository = userRepository;
        this.authorityRepository = authorityRepository;
        this.caseRepository = caseRepository;
        this.deadlineRepository = deadlineRepository;
        this.appealRepository = appealRepository;
        this.documentRepository = documentRepository;
    }

    @PostConstruct
    @Transactional
    public void importDbJsonIfPresent() {
        File dbFile = new File("data/db.json");
        if (!dbFile.exists() || dbFile.length() == 0) {
            log.info("[DataStoreMigrationService] No data/db.json found or file empty; skipping migration.");
            return;
        }

        try {
            log.info("[DataStoreMigrationService] Found data/db.json, importing into database...");
            Map<String, Object> data = mapper.readValue(dbFile, new TypeReference<>() {});

            // 1. Users
            if (data.containsKey("users")) {
                List<User> users = mapper.convertValue(data.get("users"), new TypeReference<>() {});
                if (users != null) {
                    for (User u : users) {
                        if (u.getId() != null && !userRepository.existsById(u.getId())) {
                            userRepository.save(new UserEntity(u));
                        }
                    }
                }
            }

            // 2. Authorities
            if (data.containsKey("authorities")) {
                List<Authority> authorities = mapper.convertValue(data.get("authorities"), new TypeReference<>() {});
                if (authorities != null) {
                    for (Authority a : authorities) {
                        if (a.getId() != null && !authorityRepository.existsById(a.getId())) {
                            authorityRepository.save(new AuthorityEntity(a));
                        }
                    }
                }
            }

            // 3. Cases
            if (data.containsKey("cases")) {
                List<CaseItem> cases = mapper.convertValue(data.get("cases"), new TypeReference<>() {});
                if (cases != null) {
                    for (CaseItem c : cases) {
                        if (c.getId() != null && !caseRepository.existsById(c.getId())) {
                            String ownerId = "usr_demo";
                            if (c.getApplicant() != null && c.getApplicant().getEmail() != null && !c.getApplicant().getEmail().isBlank()) {
                                ownerId = userRepository.findByEmailIgnoreCase(c.getApplicant().getEmail().trim())
                                        .map(UserEntity::getId)
                                        .orElse("usr_demo");
                            }
                            caseRepository.save(new CaseEntity(c, ownerId));

                            // Import nested documents if any
                            if (c.getDocuments() != null) {
                                for (CaseDocument doc : c.getDocuments()) {
                                    if (doc.getId() != null && !documentRepository.existsById(doc.getId())) {
                                        if (doc.getCaseId() == null) doc.setCaseId(c.getId());
                                        documentRepository.save(new DocumentEntity(doc, doc.getFileUrl(), doc.getCategory()));
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 4. Deadlines
            if (data.containsKey("deadlines")) {
                List<Deadline> deadlines = mapper.convertValue(data.get("deadlines"), new TypeReference<>() {});
                if (deadlines != null) {
                    for (Deadline d : deadlines) {
                        if (d.getId() != null && !deadlineRepository.existsById(d.getId())) {
                            // Ensure associated case exists before inserting
                            if (d.getCaseId() != null && caseRepository.existsById(d.getCaseId())) {
                                deadlineRepository.save(new DeadlineEntity(d));
                            }
                        }
                    }
                }
            }

            // 5. Appeals
            if (data.containsKey("appeals")) {
                List<Appeal> appeals = mapper.convertValue(data.get("appeals"), new TypeReference<>() {});
                if (appeals != null) {
                    for (Appeal a : appeals) {
                        if (a.getId() != null && !appealRepository.existsById(a.getId())) {
                            if (a.getCaseId() != null && caseRepository.existsById(a.getCaseId())) {
                                appealRepository.save(new AppealEntity(a));
                            }
                        }
                    }
                }
            }

            log.info("[DataStoreMigrationService] Successfully completed migration from data/db.json.");
        } catch (Exception e) {
            log.warn("[DataStoreMigrationService] Warning during db.json migration: {}", e.getMessage());
        }
    }
}
