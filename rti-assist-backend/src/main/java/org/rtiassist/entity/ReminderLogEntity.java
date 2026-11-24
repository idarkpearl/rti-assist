package org.rtiassist.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "reminder_log", uniqueConstraints = {
    @UniqueConstraint(name = "uk_case_reminder", columnNames = {"case_id", "reminder_type"})
})
public class ReminderLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_id", length = 64, nullable = false)
    private String caseId;

    @Column(name = "reminder_type", length = 64, nullable = false)
    private String reminderType;

    @Column(name = "sent_at", length = 64, nullable = false)
    private String sentAt;

    public ReminderLogEntity() {}

    public ReminderLogEntity(String caseId, String reminderType, String sentAt) {
        this.caseId = caseId;
        this.reminderType = reminderType;
        this.sentAt = sentAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }
    public String getReminderType() { return reminderType; }
    public void setReminderType(String reminderType) { this.reminderType = reminderType; }
    public String getSentAt() { return sentAt; }
    public void setSentAt(String sentAt) { this.sentAt = sentAt; }
}
