package org.rtiassist.entity;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import org.rtiassist.model.Appeal;
import org.rtiassist.model.ApplicantInfo;

import java.util.List;

@Entity
@Table(name = "appeals")
public class AppealEntity {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "case_id", length = 64, nullable = false)
    private String caseId;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "type", length = 64)
    private String type = "first_appeal";

    @Column(name = "appeal_number", length = 128)
    private String appealNumber;

    @Column(name = "authority_id", length = 64)
    private String authorityId;

    @Column(name = "authority_name")
    private String authorityName;

    @Column(name = "appellate_authority_name")
    private String appellateAuthorityName;

    @Column(name = "appellate_authority_designation")
    private String appellateAuthorityDesignation;

    @Column(name = "appellant_json", columnDefinition = "TEXT")
    private String appellantJson;

    @Column(name = "original_application_date", length = 64)
    private String originalApplicationDate;

    @Column(name = "original_pio_name")
    private String originalPioName;

    @Column(name = "ground_of_appeal", length = 128)
    private String groundOfAppeal = "no_response";

    @Column(name = "grounds_summary", columnDefinition = "TEXT")
    private String groundsSummary;

    @Column(name = "detailed_grounds", columnDefinition = "TEXT")
    private String detailedGroundsJson;

    @Column(name = "relief_sought", columnDefinition = "TEXT")
    private String reliefSought;

    @Column(name = "draft_content", columnDefinition = "TEXT")
    private String draftContent;

    @Column(name = "status", length = 64)
    private String status = "ready_to_send";

    @Column(name = "submission_date", length = 64)
    private String submissionDate;

    @Column(name = "created_at", length = 64)
    private String createdAt;

    @Column(name = "updated_at", length = 64)
    private String updatedAt;

    public AppealEntity() {}

    public AppealEntity(Appeal model) {
        if (model == null) return;
        this.id = model.getId();
        this.caseId = model.getCaseId();
        this.userId = model.getUserId();
        this.type = model.getType() != null ? model.getType() : "first_appeal";
        this.appealNumber = model.getAppealNumber();
        this.authorityId = model.getAuthorityId();
        this.authorityName = model.getAuthorityName();
        this.appellateAuthorityName = model.getAppellateAuthorityName();
        this.appellateAuthorityDesignation = model.getAppellateAuthorityDesignation();
        this.originalApplicationDate = model.getOriginalApplicationDate();
        this.originalPioName = model.getOriginalPioName();
        this.groundOfAppeal = model.getGroundOfAppeal();
        this.groundsSummary = model.getGroundsSummary();
        this.reliefSought = model.getReliefSought();
        this.draftContent = model.getDraftContent();
        this.status = model.getStatus() != null ? model.getStatus() : "ready_to_send";
        this.submissionDate = model.getSubmissionDate();
        this.createdAt = model.getCreatedAt();
        this.updatedAt = model.getUpdatedAt();
        try {
            if (model.getAppellant() != null) {
                this.appellantJson = MAPPER.writeValueAsString(model.getAppellant());
            }
            if (model.getDetailedGrounds() != null) {
                this.detailedGroundsJson = MAPPER.writeValueAsString(model.getDetailedGrounds());
            }
        } catch (Exception ignored) {}
    }

    public Appeal toModel() {
        Appeal a = new Appeal();
        a.setId(this.id);
        a.setCaseId(this.caseId);
        a.setUserId(this.userId);
        a.setType(this.type);
        a.setAppealNumber(this.appealNumber);
        a.setAuthorityId(this.authorityId);
        a.setAuthorityName(this.authorityName);
        a.setAppellateAuthorityName(this.appellateAuthorityName);
        a.setAppellateAuthorityDesignation(this.appellateAuthorityDesignation);
        a.setOriginalApplicationDate(this.originalApplicationDate);
        a.setOriginalPioName(this.originalPioName);
        a.setGroundOfAppeal(this.groundOfAppeal);
        a.setGroundsSummary(this.groundsSummary);
        a.setReliefSought(this.reliefSought);
        a.setDraftContent(this.draftContent);
        a.setStatus(this.status);
        a.setSubmissionDate(this.submissionDate);
        a.setCreatedAt(this.createdAt);
        a.setUpdatedAt(this.updatedAt);
        try {
            if (this.appellantJson != null && !this.appellantJson.isBlank()) {
                a.setAppellant(MAPPER.readValue(this.appellantJson, ApplicantInfo.class));
            }
            if (this.detailedGroundsJson != null && !this.detailedGroundsJson.isBlank()) {
                a.setDetailedGrounds(MAPPER.readValue(this.detailedGroundsJson, new TypeReference<List<String>>() {}));
            }
        } catch (Exception ignored) {}
        return a;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getAppealNumber() { return appealNumber; }
    public void setAppealNumber(String appealNumber) { this.appealNumber = appealNumber; }
    public String getAuthorityId() { return authorityId; }
    public void setAuthorityId(String authorityId) { this.authorityId = authorityId; }
    public String getAuthorityName() { return authorityName; }
    public void setAuthorityName(String authorityName) { this.authorityName = authorityName; }
    public String getAppellateAuthorityName() { return appellateAuthorityName; }
    public void setAppellateAuthorityName(String appellateAuthorityName) { this.appellateAuthorityName = appellateAuthorityName; }
    public String getAppellateAuthorityDesignation() { return appellateAuthorityDesignation; }
    public void setAppellateAuthorityDesignation(String appellateAuthorityDesignation) { this.appellateAuthorityDesignation = appellateAuthorityDesignation; }
    public String getAppellantJson() { return appellantJson; }
    public void setAppellantJson(String appellantJson) { this.appellantJson = appellantJson; }
    public String getOriginalApplicationDate() { return originalApplicationDate; }
    public void setOriginalApplicationDate(String originalApplicationDate) { this.originalApplicationDate = originalApplicationDate; }
    public String getOriginalPioName() { return originalPioName; }
    public void setOriginalPioName(String originalPioName) { this.originalPioName = originalPioName; }
    public String getGroundOfAppeal() { return groundOfAppeal; }
    public void setGroundOfAppeal(String groundOfAppeal) { this.groundOfAppeal = groundOfAppeal; }
    public String getGroundsSummary() { return groundsSummary; }
    public void setGroundsSummary(String groundsSummary) { this.groundsSummary = groundsSummary; }
    public String getDetailedGroundsJson() { return detailedGroundsJson; }
    public void setDetailedGroundsJson(String detailedGroundsJson) { this.detailedGroundsJson = detailedGroundsJson; }
    public String getReliefSought() { return reliefSought; }
    public void setReliefSought(String reliefSought) { this.reliefSought = reliefSought; }
    public String getDraftContent() { return draftContent; }
    public void setDraftContent(String draftContent) { this.draftContent = draftContent; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(String submissionDate) { this.submissionDate = submissionDate; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
