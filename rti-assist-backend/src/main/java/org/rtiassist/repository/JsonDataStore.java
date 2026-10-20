package org.rtiassist.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.annotation.PostConstruct;
import org.rtiassist.model.*;
import org.springframework.stereotype.Repository;

import java.io.File;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Repository
public class JsonDataStore {

    private final ObjectMapper mapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
            .enable(SerializationFeature.INDENT_OUTPUT);

    private final List<Authority> authorities = new CopyOnWriteArrayList<>();
    private final List<CaseItem> cases = new CopyOnWriteArrayList<>();
    private final List<Deadline> deadlines = new CopyOnWriteArrayList<>();
    private final List<Appeal> appeals = new CopyOnWriteArrayList<>();
    private final List<User> users = new CopyOnWriteArrayList<>();

    private File dbFile;

    @PostConstruct
    public void init() {
        File dataDir = new File("data");
        if (!dataDir.exists()) {
            dataDir.mkdirs();
        }
        dbFile = new File(dataDir, "db.json");
        loadFromFile();
    }

    public synchronized void loadFromFile() {
        try {
            if (dbFile != null && dbFile.exists() && dbFile.length() > 0) {
                Map<String, Object> data = mapper.readValue(dbFile, new TypeReference<>() {});

                if (data.containsKey("authorities")) {
                    List<Authority> list = mapper.convertValue(data.get("authorities"), new TypeReference<>() {});
                    if (list != null && !list.isEmpty()) {
                        authorities.clear();
                        authorities.addAll(list);
                    }
                }
                if (data.containsKey("cases")) {
                    List<CaseItem> list = mapper.convertValue(data.get("cases"), new TypeReference<>() {});
                    if (list != null) {
                        cases.clear();
                        cases.addAll(list);
                    }
                }
                if (data.containsKey("deadlines")) {
                    List<Deadline> list = mapper.convertValue(data.get("deadlines"), new TypeReference<>() {});
                    if (list != null) {
                        deadlines.clear();
                        deadlines.addAll(list);
                    }
                }
                if (data.containsKey("appeals")) {
                    List<Appeal> list = mapper.convertValue(data.get("appeals"), new TypeReference<>() {});
                    if (list != null) {
                        appeals.clear();
                        appeals.addAll(list);
                    }
                }
                if (data.containsKey("users")) {
                    List<User> list = mapper.convertValue(data.get("users"), new TypeReference<>() {});
                    if (list != null) {
                        users.clear();
                        users.addAll(list);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[JsonDataStore] Warning: could not load db.json, using seeds: " + e.getMessage());
        }

        // If authorities are empty, seed them
        if (authorities.isEmpty()) {
            authorities.addAll(SeedData.getInitialAuthorities());
            saveToFile();
        }
    }

    public synchronized void saveToFile() {
        try {
            if (dbFile == null) {
                File dataDir = new File("data");
                if (!dataDir.exists()) dataDir.mkdirs();
                dbFile = new File(dataDir, "db.json");
            }
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("authorities", authorities);
            data.put("cases", cases);
            data.put("deadlines", deadlines);
            data.put("appeals", appeals);
            data.put("users", users);

            mapper.writeValue(dbFile, data);
        } catch (Exception e) {
            System.err.println("[JsonDataStore] Failed to write db.json: " + e.getMessage());
        }
    }

    // =========================================================================
    // AUTHORITIES
    // =========================================================================

    public List<Authority> getAuthorities(String search, String jurisdiction, String level) {
        return authorities.stream()
                .filter(a -> {
                    if (jurisdiction != null && !jurisdiction.isBlank()) {
                        if (a.getJurisdiction() == null || !a.getJurisdiction().equalsIgnoreCase(jurisdiction.trim())) {
                            return false;
                        }
                    }
                    if (level != null && !level.isBlank()) {
                        if (a.getLevel() == null || !a.getLevel().equalsIgnoreCase(level.trim())) {
                            return false;
                        }
                    }
                    if (search != null && !search.isBlank()) {
                        String q = search.toLowerCase().trim();
                        boolean matchesName = a.getName() != null && a.getName().toLowerCase().contains(q);
                        boolean matchesMinistry = a.getMinistry() != null && a.getMinistry().toLowerCase().contains(q);
                        boolean matchesDept = a.getDepartment() != null && a.getDepartment().toLowerCase().contains(q);
                        boolean matchesPio = a.getPio() != null && a.getPio().getName() != null && a.getPio().getName().toLowerCase().contains(q);
                        boolean matchesTag = a.getCategoryTags() != null && a.getCategoryTags().stream().anyMatch(t -> t.toLowerCase().contains(q));
                        return matchesName || matchesMinistry || matchesDept || matchesPio || matchesTag;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public Authority getAuthorityById(String id) {
        if (id == null) return null;
        return authorities.stream().filter(a -> id.equals(a.getId())).findFirst().orElse(null);
    }

    // =========================================================================
    // CASES
    // =========================================================================

    public List<CaseItem> getCases(String status, String search) {
        return cases.stream()
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
                .collect(Collectors.toList());
    }

    public CaseItem getCaseById(String id) {
        if (id == null) return null;
        CaseItem c = cases.stream().filter(item -> id.equals(item.getId())).findFirst().orElse(null);
        if (c == null) return null;

        // Enrich with authority, latest deadlines and appeals
        if (c.getAuthorityId() != null) {
            Authority auth = getAuthorityById(c.getAuthorityId());
            if (auth != null) c.setAuthority(auth);
        }
        List<Deadline> dl = deadlines.stream().filter(d -> id.equals(d.getCaseId())).collect(Collectors.toList());
        if (!dl.isEmpty()) {
            c.setDeadlines(dl);
        }
        List<Appeal> app = appeals.stream().filter(a -> id.equals(a.getCaseId())).collect(Collectors.toList());
        if (!app.isEmpty()) {
            c.setAppeals(app);
        }
        return c;
    }

    public synchronized CaseItem createCase(CaseItem data) {
        String id = data.getId() != null ? data.getId() : "case-" + System.currentTimeMillis();
        data.setId(id);

        String now = Instant.now().toString();
        String filingDate = data.getFilingDate() != null ? data.getFilingDate() : now;
        data.setFilingDate(filingDate);

        boolean isEmergency = Boolean.TRUE.equals(data.getIsLifeAndLiberty());
        int daysAllowed = isEmergency ? 2 : 30;
        String dueDate = Instant.now().plus(daysAllowed, ChronoUnit.DAYS).toString();

        Authority auth = getAuthorityById(data.getAuthorityId());
        if (auth == null && data.getAuthority() != null && data.getAuthority().getId() != null) {
            auth = getAuthorityById(data.getAuthority().getId());
        }
        if (auth == null && !authorities.isEmpty()) {
            auth = authorities.get(0);
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
            data.setSummary((data.getQueries() != null && !data.getQueries().isEmpty()) ? data.getQueries().get(0) : "RTI application under Section 6(1)");
        }
        if (data.getDescription() == null || data.getDescription().isBlank()) {
            data.setDescription("Application filed under Section 6(1) of the Right to Information Act, 2005.");
        }
        if (data.getQueries() == null || data.getQueries().isEmpty()) {
            data.setQueries(new ArrayList<>(Collections.singletonList("Certified copies of relevant files and administrative sanctions.")));
        }
        if (data.getApplicant() == null) {
            data.setApplicant(new ApplicantInfo("Vikramaditya Roy", "vikram.roy@example.com"));
        }
        if (data.getStatus() == null || data.getStatus().isBlank()) {
            data.setStatus("submitted");
        }
        data.setCreatedAt(filingDate);
        data.setUpdatedAt(filingDate);

        // Generate statutory deadline
        Deadline defaultDl = new Deadline();
        defaultDl.setId("dl-" + System.currentTimeMillis());
        defaultDl.setCaseId(id);
        defaultDl.setTitle(isEmergency ? "Life & Liberty Urgent Reply Window (48h)" : "PIO 30-Day Mandatory Response Window");
        defaultDl.setType(isEmergency ? "life_and_liberty" : "pio_response");
        defaultDl.setDueDate(dueDate);
        defaultDl.setCalculatedDays(daysAllowed);
        defaultDl.setDaysRemaining(daysAllowed);
        defaultDl.setStatus("pending");
        defaultDl.setIsLifeAndLiberty(isEmergency);
        defaultDl.setActSectionReference(isEmergency ? "RTI Act Sec 7(1) Proviso" : "RTI Act Sec 7(1)");
        defaultDl.setNotes(isEmergency
                ? "Emergency 48-hour deadline concerning life and liberty under Section 7(1) proviso."
                : "Mandatory 30-day statutory response period from date of receipt by CPIO under Section 7(1).");
        defaultDl.setCreatedAt(filingDate);

        data.setDeadlines(new ArrayList<>(Collections.singletonList(defaultDl)));

        cases.add(0, data);
        deadlines.add(0, defaultDl);
        saveToFile();

        return data;
    }

    public synchronized CaseItem updateCase(String id, CaseItem updates) {
        CaseItem existing = cases.stream().filter(c -> id.equals(c.getId())).findFirst().orElse(null);
        if (existing == null) return null;

        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getSummary() != null) existing.setSummary(updates.getSummary());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getPioResponseSummary() != null) existing.setPioResponseSummary(updates.getPioResponseSummary());
        if (updates.getPioResponseDate() != null) existing.setPioResponseDate(updates.getPioResponseDate());
        if (updates.getQueries() != null && !updates.getQueries().isEmpty()) existing.setQueries(updates.getQueries());
        if (updates.getTags() != null) existing.setTags(updates.getTags());
        if (updates.getFeePaid() != null) existing.setFeePaid(updates.getFeePaid());
        if (updates.getPaymentReference() != null) existing.setPaymentReference(updates.getPaymentReference());

        existing.setUpdatedAt(Instant.now().toString());
        saveToFile();
        return getCaseById(id);
    }

    public synchronized boolean deleteCase(String id) {
        boolean removed = cases.removeIf(c -> id.equals(c.getId()));
        if (removed) {
            deadlines.removeIf(d -> id.equals(d.getCaseId()));
            appeals.removeIf(a -> id.equals(a.getCaseId()));
            saveToFile();
        }
        return removed;
    }

    public synchronized CaseDocument addDocumentToCase(String caseId, CaseDocument docData) {
        CaseItem c = getCaseById(caseId);
        if (c == null) return null;

        if (docData.getId() == null) docData.setId("doc-" + System.currentTimeMillis());
        docData.setCaseId(caseId);
        if (docData.getUploadedAt() == null) docData.setUploadedAt(Instant.now().toString());

        if (c.getDocuments() == null) c.setDocuments(new ArrayList<>());
        c.getDocuments().add(0, docData);
        c.setUpdatedAt(Instant.now().toString());
        saveToFile();
        return docData;
    }

    // =========================================================================
    // DEADLINES
    // =========================================================================

    public List<Deadline> getDeadlines(String caseId, String status) {
        return deadlines.stream()
                .filter(d -> {
                    if (caseId != null && !caseId.isBlank() && !caseId.equals(d.getCaseId())) {
                        return false;
                    }
                    if (status != null && !status.isBlank() && !status.equalsIgnoreCase(d.getStatus())) {
                        return false;
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    public Deadline getDeadlineById(String id) {
        if (id == null) return null;
        return deadlines.stream().filter(d -> id.equals(d.getId())).findFirst().orElse(null);
    }

    public synchronized Deadline createDeadline(Deadline d) {
        if (d.getId() == null) d.setId("dl-" + System.currentTimeMillis());
        if (d.getCreatedAt() == null) d.setCreatedAt(Instant.now().toString());
        if (d.getStatus() == null) d.setStatus("pending");
        if (d.getCalculatedDays() == null) d.setCalculatedDays(30);
        if (d.getDaysRemaining() == null) d.setDaysRemaining(d.getCalculatedDays());

        deadlines.add(0, d);
        if (d.getCaseId() != null) {
            CaseItem c = cases.stream().filter(item -> d.getCaseId().equals(item.getId())).findFirst().orElse(null);
            if (c != null) {
                if (c.getDeadlines() == null) c.setDeadlines(new ArrayList<>());
                c.getDeadlines().add(0, d);
            }
        }
        saveToFile();
        return d;
    }

    public synchronized Deadline updateDeadline(String id, Deadline updates) {
        Deadline d = getDeadlineById(id);
        if (d == null) return null;

        if (updates.getTitle() != null) d.setTitle(updates.getTitle());
        if (updates.getStatus() != null) d.setStatus(updates.getStatus());
        if (updates.getDueDate() != null) d.setDueDate(updates.getDueDate());
        if (updates.getDaysRemaining() != null) d.setDaysRemaining(updates.getDaysRemaining());
        if (updates.getNotes() != null) d.setNotes(updates.getNotes());
        if (updates.getCompletedAt() != null) d.setCompletedAt(updates.getCompletedAt());
        d.setUpdatedAt(Instant.now().toString());

        saveToFile();
        return d;
    }

    public synchronized Deadline completeDeadline(String id) {
        Deadline d = getDeadlineById(id);
        if (d == null) return null;
        d.setStatus("completed");
        d.setCompletedAt(Instant.now().toString());
        d.setUpdatedAt(Instant.now().toString());
        saveToFile();
        return d;
    }

    public synchronized boolean deleteDeadline(String id) {
        boolean removed = deadlines.removeIf(d -> id.equals(d.getId()));
        if (removed) saveToFile();
        return removed;
    }

    // =========================================================================
    // APPEALS
    // =========================================================================

    public List<Appeal> getAppeals(String caseId) {
        if (caseId == null || caseId.isBlank()) {
            return new ArrayList<>(appeals);
        }
        return appeals.stream().filter(a -> caseId.equals(a.getCaseId())).collect(Collectors.toList());
    }

    public Appeal getAppealById(String id) {
        if (id == null) return null;
        return appeals.stream().filter(a -> id.equals(a.getId())).findFirst().orElse(null);
    }

    public synchronized Appeal createAppeal(Appeal a) {
        if (a.getId() == null) a.setId("appeal-" + System.currentTimeMillis());
        if (a.getCreatedAt() == null) a.setCreatedAt(Instant.now().toString());
        if (a.getUpdatedAt() == null) a.setUpdatedAt(Instant.now().toString());
        if (a.getStatus() == null) a.setStatus("ready_to_send");
        if (a.getAppealNumber() == null) {
            a.setAppealNumber("FAA-2026-" + (1000 + new Random().nextInt(9000)));
        }

        appeals.add(0, a);

        if (a.getCaseId() != null) {
            CaseItem c = cases.stream().filter(item -> a.getCaseId().equals(item.getId())).findFirst().orElse(null);
            if (c != null) {
                if (c.getAppeals() == null) c.setAppeals(new ArrayList<>());
                c.getAppeals().add(a);
                c.setStatus("first_appeal_pending");
                c.setUpdatedAt(Instant.now().toString());
            }
        }
        saveToFile();
        return a;
    }

    public synchronized Appeal updateAppeal(String id, Appeal updates) {
        Appeal a = getAppealById(id);
        if (a == null) return null;

        if (updates.getStatus() != null) a.setStatus(updates.getStatus());
        if (updates.getDraftContent() != null) a.setDraftContent(updates.getDraftContent());
        if (updates.getGroundOfAppeal() != null) a.setGroundOfAppeal(updates.getGroundOfAppeal());
        if (updates.getGroundsSummary() != null) a.setGroundsSummary(updates.getGroundsSummary());
        a.setUpdatedAt(Instant.now().toString());

        saveToFile();
        return a;
    }

    public synchronized boolean deleteAppeal(String id) {
        boolean removed = appeals.removeIf(a -> id.equals(a.getId()));
        if (removed) saveToFile();
        return removed;
    }

    // =========================================================================
    // USERS
    // =========================================================================

    public List<User> getUsers() {
        return new ArrayList<>(users);
    }

    public User getUserById(String id) {
        if (id == null) return null;
        return users.stream().filter(u -> id.equals(u.getId())).findFirst().orElse(null);
    }

    public User findUserByEmail(String email) {
        if (email == null) return null;
        return users.stream().filter(u -> email.equalsIgnoreCase(u.getEmail())).findFirst().orElse(null);
    }

    public synchronized User createUser(User user) {
        if (user.getId() == null) user.setId("usr-" + System.currentTimeMillis());
        if (user.getCreatedAt() == null) user.setCreatedAt(Instant.now().toString());
        user.setEmailVerified(true);
        users.add(user);
        saveToFile();
        return user;
    }

    public synchronized User updateUserPassword(String email, String password) {
        User u = findUserByEmail(email);
        if (u == null) return null;
        u.setPassword(password);
        u.setHasPassword(true);
        u.setEmailVerified(true);
        u.setUpdatedAt(Instant.now().toString());
        saveToFile();
        return u;
    }
}
