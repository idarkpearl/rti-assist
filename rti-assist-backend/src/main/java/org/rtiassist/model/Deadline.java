package org.rtiassist.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Deadline {
    private String id;
    private String caseId;
    private String title;
    private String type; // pio_response, life_and_liberty, first_appeal, etc.
    private String dueDate;
    private Integer calculatedDays;
    private Integer daysRemaining;
    private String status = "pending"; // pending, completed, overdue
    private Boolean isLifeAndLiberty = false;
    private String actSectionReference = "RTI Act Sec 7(1)";
    private String notes;
    private String createdAt;
    private String completedAt;
    private String updatedAt;

    public Deadline() {}

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

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
