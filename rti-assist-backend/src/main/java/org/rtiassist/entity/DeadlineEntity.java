package org.rtiassist.entity;

import jakarta.persistence.*;
import org.rtiassist.model.Deadline;

@Entity
@Table(name = "deadlines")
public class DeadlineEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "case_id", length = 64, nullable = false)
    private String caseId;

    @Column(name = "title")
    private String title;

    @Column(name = "type", length = 64)
    private String type;

    @Column(name = "due_date", length = 64)
    private String dueDate;

    @Column(name = "calculated_days")
    private Integer calculatedDays;

    @Column(name = "days_remaining")
    private Integer daysRemaining;

    @Column(name = "status", length = 64)
    private String status = "pending";

    @Column(name = "is_life_and_liberty")
    private Boolean isLifeAndLiberty = false;

    @Column(name = "act_section_reference", length = 128)
    private String actSectionReference = "RTI Act Sec 7(1)";

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "reminder_sent")
    private Boolean reminderSent = false;

    @Column(name = "created_at", length = 64)
    private String createdAt;

    @Column(name = "completed_at", length = 64)
    private String completedAt;

    @Column(name = "updated_at", length = 64)
    private String updatedAt;

    public DeadlineEntity() {}

    public DeadlineEntity(Deadline model) {
        if (model == null) return;
        this.id = model.getId();
        this.caseId = model.getCaseId();
        this.title = model.getTitle();
        this.type = model.getType();
        this.dueDate = model.getDueDate();
        this.calculatedDays = model.getCalculatedDays();
        this.daysRemaining = model.getDaysRemaining();
        this.status = model.getStatus() != null ? model.getStatus() : "pending";
        this.isLifeAndLiberty = model.getIsLifeAndLiberty() != null ? model.getIsLifeAndLiberty() : false;
        this.actSectionReference = model.getActSectionReference();
        this.notes = model.getNotes();
        this.reminderSent = model.getReminderSent() != null ? model.getReminderSent() : false;
        this.createdAt = model.getCreatedAt();
        this.completedAt = model.getCompletedAt();
        this.updatedAt = model.getUpdatedAt();
    }

    public Deadline toModel() {
        Deadline d = new Deadline();
        d.setId(this.id);
        d.setCaseId(this.caseId);
        d.setTitle(this.title);
        d.setType(this.type);
        d.setDueDate(this.dueDate);
        d.setCalculatedDays(this.calculatedDays);
        d.setDaysRemaining(this.daysRemaining);
        d.setStatus(this.status);
        d.setIsLifeAndLiberty(this.isLifeAndLiberty);
        d.setActSectionReference(this.actSectionReference);
        d.setNotes(this.notes);
        d.setReminderSent(this.reminderSent);
        d.setCreatedAt(this.createdAt);
        d.setCompletedAt(this.completedAt);
        d.setUpdatedAt(this.updatedAt);
        return d;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
    public Integer getCalculatedDays() { return calculatedDays; }
    public void setCalculatedDays(Integer calculatedDays) { this.calculatedDays = calculatedDays; }
    public Integer getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(Integer daysRemaining) { this.daysRemaining = daysRemaining; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Boolean getIsLifeAndLiberty() { return isLifeAndLiberty; }
    public void setIsLifeAndLiberty(Boolean isLifeAndLiberty) { this.isLifeAndLiberty = isLifeAndLiberty; }
    public String getActSectionReference() { return actSectionReference; }
    public void setActSectionReference(String actSectionReference) { this.actSectionReference = actSectionReference; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Boolean getReminderSent() { return reminderSent; }
    public void setReminderSent(Boolean reminderSent) { this.reminderSent = reminderSent; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
