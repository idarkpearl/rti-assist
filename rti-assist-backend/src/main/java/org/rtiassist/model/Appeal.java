package org.rtiassist.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Appeal {
    private String id;
    private String caseId;
    private String type = "first_appeal";
    private String appealNumber;
    private String authorityId;
    private String authorityName;
    private String groundOfAppeal = "no_response";
    private String groundsSummary;
    private String draftContent;
    private String status = "ready_to_send";
    private String createdAt;
    private String updatedAt;

    public Appeal() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getAppealNumber() { return appealNumber; }
    public void setAppealNumber(String appealNumber) { this.appealNumber = appealNumber; }

    public String getAuthorityId() { return authorityId; }
    public void setAuthorityId(String authorityId) { this.authorityId = authorityId; }

    public String getAuthorityName() { return authorityName; }
    public void setAuthorityName(String authorityName) { this.authorityName = authorityName; }

    public String getGroundOfAppeal() { return groundOfAppeal; }
    public void setGroundOfAppeal(String groundOfAppeal) { this.groundOfAppeal = groundOfAppeal; }

    public String getGroundsSummary() { return groundsSummary; }
    public void setGroundsSummary(String groundsSummary) { this.groundsSummary = groundsSummary; }

    public String getDraftContent() { return draftContent; }
    public void setDraftContent(String draftContent) { this.draftContent = draftContent; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
