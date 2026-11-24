package org.rtiassist.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.rtiassist.entity.UserEntity;
import org.rtiassist.model.CaseItem;
import org.rtiassist.model.Deadline;
import org.rtiassist.service.CaseService;
import org.rtiassist.service.ReminderSchedulerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RepositoryAndScopingTest {

    @Autowired
    private CaseService caseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private ReminderSchedulerService reminderSchedulerService;

    @Autowired
    private ReminderLogRepository reminderLogRepository;

    @BeforeEach
    void setUp() {
        // Ensure test users exist in database
        if (!userRepository.existsById("usr_alice")) {
            UserEntity alice = new UserEntity();
            alice.setId("usr_alice");
            alice.setName("Alice Sharma");
            alice.setEmail("alice@example.com");
            userRepository.save(alice);
        }
        if (!userRepository.existsById("usr_bob")) {
            UserEntity bob = new UserEntity();
            bob.setId("usr_bob");
            bob.setName("Bob Verma");
            bob.setEmail("bob@example.com");
            userRepository.save(bob);
        }
    }

    @Test
    @DisplayName("Statutory Integrity: Regular RTI application sets 30-day PIO deadline under Sec 7(1)")
    void testCaseCreation30DayDeadline() {
        CaseItem item = new CaseItem();
        item.setTitle("Tender procurement records for school building");
        item.setIsLifeAndLiberty(false);
        item.setFilingDate(Instant.now().toString());

        CaseItem created = caseService.createCase(item, "usr_alice");
        assertNotNull(created.getId());
        assertNotNull(created.getDeadlines());
        assertFalse(created.getDeadlines().isEmpty());

        Deadline deadline = created.getDeadlines().get(0);
        assertEquals("pio_response", deadline.getType());
        assertEquals(30, deadline.getCalculatedDays());
        assertEquals("RTI Act Sec 7(1)", deadline.getActSectionReference());

        // Verify dueDate is approximately 30 days in future
        Instant filedAt = Instant.parse(created.getFilingDate());
        Instant dueAt = Instant.parse(deadline.getDueDate());
        long daysDiff = Duration.between(filedAt, dueAt).toDays();
        assertEquals(30, daysDiff);
    }

    @Test
    @DisplayName("Statutory Integrity: Life and Liberty RTI application sets 48-hour emergency deadline under Sec 7(1) Proviso")
    void testCaseCreation48HourLifeAndLibertyDeadline() {
        CaseItem emergencyItem = new CaseItem();
        emergencyItem.setTitle("Medical records of detained person");
        emergencyItem.setIsLifeAndLiberty(true);
        emergencyItem.setFilingDate(Instant.now().toString());

        CaseItem created = caseService.createCase(emergencyItem, "usr_alice");
        assertNotNull(created.getId());
        assertNotNull(created.getDeadlines());
        assertFalse(created.getDeadlines().isEmpty());

        Deadline deadline = created.getDeadlines().get(0);
        assertEquals("life_and_liberty", deadline.getType());
        assertTrue(deadline.getIsLifeAndLiberty());
        assertEquals("RTI Act Sec 7(1) Proviso", deadline.getActSectionReference());

        // Verify dueDate is exactly 48 hours from filing
        Instant filedAt = Instant.parse(created.getFilingDate());
        Instant dueAt = Instant.parse(deadline.getDueDate());
        long hoursDiff = Duration.between(filedAt, dueAt).toHours();
        assertEquals(48, hoursDiff);
    }

    @Test
    @DisplayName("Security & Isolation: Users can only see and access their own scoped cases")
    void testPerUserScoping() {
        // Alice creates a case
        CaseItem caseAlice = new CaseItem();
        caseAlice.setTitle("Alice Confidential RTI Request");
        caseAlice.setIsLifeAndLiberty(false);
        CaseItem createdAlice = caseService.createCase(caseAlice, "usr_alice");

        // Bob creates a case
        CaseItem caseBob = new CaseItem();
        caseBob.setTitle("Bob Public Works RTI Request");
        caseBob.setIsLifeAndLiberty(false);
        CaseItem createdBob = caseService.createCase(caseBob, "usr_bob");

        // Alice lists her cases
        List<CaseItem> aliceCases = caseService.listCases("usr_alice", null, null);
        assertTrue(aliceCases.stream().anyMatch(c -> c.getId().equals(createdAlice.getId())));
        assertFalse(aliceCases.stream().anyMatch(c -> c.getId().equals(createdBob.getId())));

        // Bob lists his cases
        List<CaseItem> bobCases = caseService.listCases("usr_bob", null, null);
        assertTrue(bobCases.stream().anyMatch(c -> c.getId().equals(createdBob.getId())));
        assertFalse(bobCases.stream().anyMatch(c -> c.getId().equals(createdAlice.getId())));

        // Bob attempts to fetch Alice's case by ID directly -> must be rejected (returns null)
        CaseItem unauthorizedFetch = caseService.getCaseById(createdAlice.getId(), "usr_bob");
        assertNull(unauthorizedFetch, "Bob should not be able to read Alice's case");

        // Alice can fetch her own case
        CaseItem authorizedFetch = caseService.getCaseById(createdAlice.getId(), "usr_alice");
        assertNotNull(authorizedFetch);
        assertEquals("Alice Confidential RTI Request", authorizedFetch.getTitle());
    }

    @Test
    @DisplayName("JPA Repository: Authorities seeded via Flyway are accessible")
    void testSeededAuthorities() {
        assertTrue(authorityRepository.count() >= 9);
        assertTrue(authorityRepository.findById("auth-9").isPresent());
    }

    @Test
    @DisplayName("Reminder Scheduler: Overdue deadlines trigger idempotent reminder_log entries")
    void testReminderSchedulerIdempotency() {
        CaseItem overdueCase = new CaseItem();
        overdueCase.setTitle("Overdue RTI Test");
        overdueCase.setIsLifeAndLiberty(false);
        overdueCase.setFilingDate(Instant.now().minus(Duration.ofDays(35)).toString());

        CaseItem created = caseService.createCase(overdueCase, "usr_alice");
        int firstRun = reminderSchedulerService.evaluateDeadlinesAndSendReminders();
        assertTrue(firstRun >= 1);
        assertTrue(reminderLogRepository.existsByCaseIdAndReminderType(created.getId(), "overdue_sec7_2"));

        // Second run must not duplicate reminder_log entry for the same case
        int secondRun = reminderSchedulerService.evaluateDeadlinesAndSendReminders();
        assertEquals(0, secondRun);
    }
}
