package org.rtiassist.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DraftAppealDto {
    private String caseId;
    private String appealType;
    private Object caseDetails;
    private String draftText;
    private String disclaimer;

    public DraftAppealDto() {}

    public DraftAppealDto(String draftText, String disclaimer) {
        this.draftText = draftText;
        this.disclaimer = disclaimer;
    }

    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }

    public String getAppealType() { return appealType; }
    public void setAppealType(String appealType) { this.appealType = appealType; }

    public Object getCaseDetails() { return caseDetails; }
    public void setCaseDetails(Object caseDetails) { this.caseDetails = caseDetails; }

    public String getDraftText() { return draftText; }
    public void setDraftText(String draftText) { this.draftText = draftText; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
