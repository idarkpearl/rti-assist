package org.rtiassist.service;

import org.rtiassist.entity.DeadlineEntity;
import org.rtiassist.entity.ReminderLogEntity;
import org.rtiassist.repository.DeadlineRepository;
import org.rtiassist.repository.ReminderLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * Periodically evaluates pending statutory RTI deadlines using the injected Clock,
 * updates daysRemaining/status, and logs reminders idempotently in reminder_log.
 */
@Service
public class ReminderSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(ReminderSchedulerService.class);

    private final DeadlineRepository deadlineRepository;
    private final ReminderLogRepository reminderLogRepository;
    private final Clock clock;

    public ReminderSchedulerService(
            DeadlineRepository deadlineRepository,
            ReminderLogRepository reminderLogRepository,
            Clock clock
    ) {
        this.deadlineRepository = deadlineRepository;
        this.reminderLogRepository = reminderLogRepository;
        this.clock = clock;
    }

    @Scheduled(cron = "${REMINDER_CRON:0 0 9 * * ?}")
    @Transactional
    public int evaluateDeadlinesAndSendReminders() {
        Instant now = Instant.now(clock);
        List<DeadlineEntity> deadlines = deadlineRepository.findAll();
        int remindersTriggered = 0;

        for (DeadlineEntity dl : deadlines) {
            if (dl.getDueDate() == null || "completed".equalsIgnoreCase(dl.getStatus()) || "waived".equalsIgnoreCase(dl.getStatus())) {
                continue;
            }
            try {
                Instant due = Instant.parse(dl.getDueDate());
                long secondsRemaining = Duration.between(now, due).getSeconds();
                int daysRemaining = (int) Math.ceil(secondsRemaining / 86400.0);
                dl.setDaysRemaining(daysRemaining);

                String reminderType = null;
                if (daysRemaining <= 0) {
                    dl.setStatus("overdue");
                    reminderType = "overdue_sec7_2";
                } else if (daysRemaining <= 3) {
                    dl.setStatus("due_soon");
                    reminderType = "due_soon_3d";
                }

                if (reminderType != null && !reminderLogRepository.existsByCaseIdAndReminderType(dl.getCaseId(), reminderType)) {
                    reminderLogRepository.save(new ReminderLogEntity(dl.getCaseId(), reminderType, now.toString()));
                    dl.setReminderSent(true);
                    remindersTriggered++;
                    log.info("[ReminderScheduler] Recorded {} reminder for case {}", reminderType, dl.getCaseId());
                }

                dl.setUpdatedAt(now.toString());
                deadlineRepository.save(dl);
            } catch (Exception e) {
                log.debug("[ReminderScheduler] Skipping deadline {} with unparseable dueDate: {}", dl.getId(), dl.getDueDate());
            }
        }
        return remindersTriggered;
    }
}
