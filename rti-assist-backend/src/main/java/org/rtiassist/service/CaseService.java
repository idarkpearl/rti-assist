package org.rtiassist.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.rtiassist.entity.*;
import org.rtiassist.model.*;
import org.rtiassist.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * CaseService
 * Handles the business logic for citizen RTI applications, statutory deadline calculations
 * under RTI Act 2005, and per-user case scoping.
 */
@Service
public class CaseService {

    public static final String DEFAULT_DEMO_USER_ID = "usr_demo";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final CaseRepository caseRepository;
    private final AuthorityRepository authorityRepository;
    private final DeadlineRepository deadlineRepository;
    private final AppealRepository appealRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    public CaseService(
            CaseRepository caseRepository,
            AuthorityRepository authorityRepository,
            DeadlineRepository deadlineRepository,
            AppealRepository appealRepository,
            DocumentRepository documentRepository,
            UserRepository userRepository
    ) {
        this.caseRepository = caseRepository;
        this.authorityRepository = authorityRepository;
        this.deadlineRepository = deadlineRepository;
        this.appealRepository = appealRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    private String resolveUserId(String userId) {
        return (userId != null && !userId.isBlank()) ? userId.trim() : DEFAULT_DEMO_USER_ID;
    }

    /**
     * Lists cases scoped to the requesting user, with optional status and search filtering.
     */
    public List<CaseItem> listCases(String userId, String status, String search) {
        String effectiveUser = resolveUserId(userId);
        List<CaseEntity> entities = caseRepository.findByUserId(effectiveUser);

        return entities.stream()
                .map(this::enrichCase)
                .filter(c -> {
                    if (status != null && !status.isBlank()) {
                        if (c.getStatus() == null || !c.getStatus().equalsIgnoreCase(status.trim())) {
                            return false;
                        }
                    }
                    if (search != null && !search.isBlank()) {
                        String q = search.toLowerCase().trim();
                        boolean mTitle = c.getTitle() != null && c.getTitle().toLowerCase().contains(q);
                        boolean mTrack = c.getTrackingNumber() != null && c.getTrackingNumber().toLowerCase().contains(q);
                        boolean mAuth = c.getAuthority() != null && c.getAuthority().getName() != null && c.getAuthority().getName().toLowerCase().contains(q);
                        boolean mSum = c.getSummary() != null && c.getSummary().toLowerCase().contains(q);
                        return mTitle || mTrack || mAuth || mSum;
                    }
                    return true;
                })
                .sorted((a, b) -> {
                    String d1 = a.getCreatedAt() != null ? a.getCreatedAt() : "";
                    String d2 = b.getCreatedAt() != null ? b.getCreatedAt() : "";
                    return d2.compareTo(d1);
                })
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single case by ID with strict user scoping.
     */
    public CaseItem getCaseById(String id, String userId) {
        if (id == null) return null;

        Optional<CaseEntity> opt = caseRepository.findById(id);
        if (opt.isEmpty()) return null;

        CaseEntity entity = opt.get();
        if (userId != null && !userId.isBlank() && !userId.equals(entity.getUserId())) {
            return null;
        }

        return enrichCase(entity);
    }

    /**
     * Creates a new RTI application, computing statutory deadlines under RTI Act 2005.
     * - Standard requests: 30 calendar days (Sec 7(1))
     * - Life & Liberty requests: 48 hours (Sec 7(1) Proviso)
     */
    @Transactional
    public CaseItem createCase(CaseItem data, String userId) {
        String effectiveUser = resolveUserId(userId);
        // Ensure foreign key user row exists when a JWT user was issued before DB reset
        if (!userRepository.existsById(effectiveUser)) {
            UserEntity fallbackUser = new UserEntity();
            fallbackUser.setId(effectiveUser);
            fallbackUser.setName(data.getApplicant() != null && data.getApplicant().getFullName() != null
                    ? data.getApplicant().getFullName() : "Citizen User");
            fallbackUser.setEmail(data.getApplicant() != null && data.getApplicant().getEmail() != null
                    ? data.getApplicant().getEmail() : effectiveUser + "@rtiassist.local");
            fallbackUser.setRole("citizen");
            fallbackUser.setCreatedAt(Instant.now().toString());
            fallbackUser.setUpdatedAt(Instant.now().toString());
            userRepository.save(fallbackUser);
        }

        String id = (data.getId() != null && !data.getId().isBlank()) ? data.getId() : "case-" + System.currentTimeMillis();
        data.setId(id);

        String now = Instant.now().toString();
        String filingDate = (data.getFilingDate() != null && !data.getFilingDate().isBlank()) ? data.getFilingDate() : now;
        data.setFilingDate(filingDate);

        boolean isEmergency = Boolean.TRUE.equals(data.getIsLifeAndLiberty());
        Instant filingInstant;
        try {
            filingInstant = Instant.parse(filingDate);
        } catch (Exception e) {
            filingInstant = Instant.now();
            filingDate = filingInstant.toString();
            data.setFilingDate(filingDate);
        }

        int calculatedDays = isEmergency ? 2 : 30;
        Instant dueInstant = isEmergency
                ? filingInstant.plus(48, ChronoUnit.HOURS)
                : filingInstant.plus(30, ChronoUnit.DAYS);
        String dueDate = dueInstant.toString();

        // Match public authority
        Authority auth = null;
        if (data.getAuthorityId() != null) {
            auth = authorityRepository.findById(data.getAuthorityId()).map(AuthorityEntity::toModel).orElse(null);
        } else if (data.getAuthority() != null && data.getAuthority().getId() != null) {
            auth = authorityRepository.findById(data.getAuthority().getId()).map(AuthorityEntity::toModel).orElse(null);
        }

        if (auth == null) {
            List<AuthorityEntity> all = authorityRepository.findAll();
            if (!all.isEmpty()) auth = all.get(0).toModel();
        }

        if (auth != null) {
            data.setAuthorityId(auth.getId());
            data.setAuthority(auth);
        }

        if (data.getTrackingNumber() == null || data.getTrackingNumber().isBlank()) {
            String code = auth != null && auth.getCode() != null ? auth.getCode() : "AUTH";
            data.setTrackingNumber("RTI-2026-" + code + "-" + (1000 + new Random().nextInt(9000)));
        }

        if (data.getTitle() == null || data.getTitle().isBlank()) {
            data.setTitle("Untitled RTI Inquiry");
        }
        if (data.getSubjectCategory() == null || data.getSubjectCategory().isBlank()) {
            data.setSubjectCategory("Public Administration");
        }
        if (data.getSummary() == null || data.getSummary().isBlank()) {
            data.setSummary((data.getQueries() != null && !data.getQueries().isEmpty())
                    ? data.getQueries().get(0)
                    : "RTI application under Section 6(1)");
        }
        if (data.getDescription() == null || data.getDescription().isBlank()) {
            data.setDescription("Application filed under Section 6(1) of the Right to Information Act, 2005.");
        }
        if (data.getQueries() == null || data.getQueries().isEmpty()) {
            data.setQueries(new ArrayList<>(Collections.singletonList("Certified copies of relevant records and administrative sanctions.")));
        }
        if (data.getApplicant() == null) {
            data.setApplicant(new ApplicantInfo("Demo Citizen", "demo@rtiassist.local"));
        }
        if (data.getStatus() == null || data.getStatus().isBlank()) {
            data.setStatus("submitted");
        }
        data.setCreatedAt(now);
        data.setUpdatedAt(now);

        CaseEntity caseEntity = new CaseEntity(data, effectiveUser);
        caseRepository.save(caseEntity);

        // Persist any initial document metadata supplied with the case
        List<CaseDocument> savedDocs = new ArrayList<>();
        if (data.getDocuments() != null) {
            for (CaseDocument doc : data.getDocuments()) {
                if (doc == null) continue;
                if (doc.getId() == null || doc.getId().isBlank()) {
                    doc.setId("doc-" + UUID.randomUUID().toString().substring(0, 8));
                }
                doc.setCaseId(id);
                if (doc.getUploadedAt() == null) doc.setUploadedAt(now);
                if (doc.getFileName() == null || doc.getFileName().isBlank()) {
                    doc.setFileName("attachment.pdf");
                }
                documentRepository.save(new DocumentEntity(doc, doc.getFileUrl(), doc.getCategory()));
                savedDocs.add(doc);
            }
        }
        data.setDocuments(savedDocs);

        // Generate statutory deadline entity
        Deadline defaultDl = new Deadline();
        defaultDl.setId("dl-" + System.currentTimeMillis());
        defaultDl.setCaseId(id);
        defaultDl.setTitle(isEmergency ? "Life & Liberty Urgent Reply Window (48h)" : "PIO 30-Day Mandatory Response Window");
        defaultDl.setType(isEmergency ? "life_and_liberty" : "pio_response");
        defaultDl.setDueDate(dueDate);
        defaultDl.setCalculatedDays(calculatedDays);
        defaultDl.setDaysRemaining(calculatedDays);
        defaultDl.setStatus("pending");
        defaultDl.setIsLifeAndLiberty(isEmergency);
        defaultDl.setActSectionReference(isEmergency ? "RTI Act Sec 7(1) Proviso" : "RTI Act Sec 7(1)");
        defaultDl.setNotes(isEmergency
                ? "Emergency 48-hour deadline concerning life and liberty under Section 7(1) proviso."
                : "Mandatory 30-day statutory response period from date of receipt by CPIO under Section 7(1).");
        defaultDl.setCreatedAt(filingDate);

        deadlineRepository.save(new DeadlineEntity(defaultDl));
        data.setDeadlines(new ArrayList<>(Collections.singletonList(defaultDl)));

        return data;
    }

    /**
     * Updates an existing case, scoped to owner.
     */
    @Transactional
    public CaseItem updateCase(String id, CaseItem updates, String userId) {
        CaseItem existing = getCaseById(id, userId);
        if (existing == null) return null;

        CaseEntity entity = caseRepository.findById(id).orElse(null);
        if (entity == null) return null;

        if (updates.getStatus() != null) entity.setStatus(updates.getStatus());
        if (updates.getTitle() != null) entity.setTitle(updates.getTitle());
        if (updates.getSubjectCategory() != null) entity.setSubjectCategory(updates.getSubjectCategory());
        if (updates.getSummary() != null) entity.setSummary(updates.getSummary());
        if (updates.getDescription() != null) entity.setDescription(updates.getDescription());
        if (updates.getAuthorityId() != null) entity.setAuthorityId(updates.getAuthorityId());
        if (updates.getIsLifeAndLiberty() != null) entity.setIsLifeAndLiberty(updates.getIsLifeAndLiberty());
        if (updates.getPioResponseSummary() != null) entity.setPioResponseSummary(updates.getPioResponseSummary());
        if (updates.getPioResponseDate() != null) entity.setPioResponseDate(updates.getPioResponseDate());
        if (updates.getLastResponseStatus() != null) entity.setLastResponseStatus(updates.getLastResponseStatus());
        if (updates.getPaymentReference() != null) entity.setPaymentReference(updates.getPaymentReference());
        if (updates.getFeePaid() != null) entity.setFeePaid(String.valueOf(updates.getFeePaid()));

        if (updates.getApplicant() != null) {
            if (updates.getApplicant().getFullName() != null) entity.setApplicantName(updates.getApplicant().getFullName());
            if (updates.getApplicant().getEmail() != null) entity.setApplicantEmail(updates.getApplicant().getEmail());
            if (updates.getApplicant().getPhone() != null) entity.setApplicantPhone(updates.getApplicant().getPhone());
            if (updates.getApplicant().getAddress() != null) entity.setApplicantAddress(updates.getApplicant().getAddress());
            if (updates.getApplicant().getIsBelowPovertyLine() != null) entity.setApplicantIsBpl(updates.getApplicant().getIsBelowPovertyLine());
        }

        try {
            if (updates.getQueries() != null) {
                entity.setQueriesJson(MAPPER.writeValueAsString(updates.getQueries()));
            }
            if (updates.getTags() != null) {
                entity.setTagsJson(MAPPER.writeValueAsString(updates.getTags()));
            }
            if (updates.getResponseClassification() != null) {
                entity.setResponseClassificationJson(MAPPER.writeValueAsString(updates.getResponseClassification()));
                if (updates.getLastResponseStatus() == null && updates.getResponseClassification().getStatus() != null) {
                    entity.setLastResponseStatus(updates.getResponseClassification().getStatus());
                }
            }
        } catch (Exception ignored) {}

        entity.setUpdatedAt(Instant.now().toString());
        caseRepository.save(entity);

        return enrichCase(entity);
    }

    /**
     * Deletes a case and cascaded child records, scoped to owner.
     */
    @Transactional
    public boolean deleteCase(String id, String userId) {
        CaseItem existing = getCaseById(id, userId);
        if (existing == null) return false;

        caseRepository.deleteById(id);
        return true;
    }

    /**
     * Enriches a CaseEntity with Authority details, Deadlines, Appeals, and Documents.
     */
    public CaseItem enrichCase(CaseEntity entity) {
        CaseItem model = entity.toModel();

        if (entity.getAuthorityId() != null) {
            authorityRepository.findById(entity.getAuthorityId())
                    .ifPresent(a -> model.setAuthority(a.toModel()));
        }

        List<Deadline> deadlines = deadlineRepository.findByCaseId(entity.getId()).stream()
                .map(DeadlineEntity::toModel)
                .peek(this::refreshDynamicRemainingDays)
                .collect(Collectors.toList());
        model.setDeadlines(deadlines);

        List<Appeal> appeals = appealRepository.findByCaseId(entity.getId()).stream()
                .map(AppealEntity::toModel)
                .collect(Collectors.toList());
        model.setAppeals(appeals);

        List<CaseDocument> documents = documentRepository.findByCaseId(entity.getId()).stream()
                .map(DocumentEntity::toModel)
                .collect(Collectors.toList());
        model.setDocuments(documents);

        return model;
    }

    private void refreshDynamicRemainingDays(Deadline d) {
        if (d.getDueDate() == null || "completed".equalsIgnoreCase(d.getStatus()) || "waived".equalsIgnoreCase(d.getStatus())) {
            return;
        }
        try {
            Instant due = Instant.parse(d.getDueDate());
            long seconds = Duration.between(Instant.now(), due).getSeconds();
            int days = (int) Math.ceil(seconds / 86400.0);
            d.setDaysRemaining(days);
            if (days <= 0 && "pending".equalsIgnoreCase(d.getStatus())) {
                d.setStatus("overdue");
            }
        } catch (Exception ignored) {}
    }

    public long count() {
        return caseRepository.count();
    }
}
