package org.rtiassist.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Appeal {
    private String id;
    private String caseId;
    private String userId;
    private String type = "first_appeal";
    private String appealNumber;
    private String authorityId;
    private String authorityName;
    private String appellateAuthorityName;
    private String appellateAuthorityDesignation;
    private ApplicantInfo appellant;
    private String originalApplicationDate;
    private String originalPioName;
    private String groundOfAppeal = "no_response";
    private String groundsSummary;
    private List<String> detailedGrounds;
    private String reliefSought;
    private String draftContent;
    private String status = "ready_to_send";
    private String submissionDate;
    private String createdAt;
    private String updatedAt;

    public Appeal() {}

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

    public ApplicantInfo getAppellant() { return appellant; }
    public void setAppellant(ApplicantInfo appellant) { this.appellant = appellant; }

    public String getOriginalApplicationDate() { return originalApplicationDate; }
    public void setOriginalApplicationDate(String originalApplicationDate) { this.originalApplicationDate = originalApplicationDate; }

    public String getOriginalPioName() { return originalPioName; }
    public void setOriginalPioName(String originalPioName) { this.originalPioName = originalPioName; }

    public String getGroundOfAppeal() { return groundOfAppeal; }
    public void setGroundOfAppeal(String groundOfAppeal) { this.groundOfAppeal = groundOfAppeal; }

    public String getGroundsSummary() { return groundsSummary; }
    public void setGroundsSummary(String groundsSummary) { this.groundsSummary = groundsSummary; }

    public List<String> getDetailedGrounds() { return detailedGrounds; }
    public void setDetailedGrounds(List<String> detailedGrounds) { this.detailedGrounds = detailedGrounds; }

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
