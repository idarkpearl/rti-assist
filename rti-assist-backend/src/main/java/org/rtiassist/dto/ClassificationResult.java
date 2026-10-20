package org.rtiassist.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.ALWAYS)
public class ClassificationResult {
    private String status;
    private String sectionCited;
    private String reason;
    private String suggestedNextStep;
    private String confidence;
    private String disclaimer = "AI-generated analysis. This is not legal advice — verify before deciding on an appeal.";

    public ClassificationResult() {}

    public ClassificationResult(String status, String sectionCited, String reason, String suggestedNextStep, String confidence) {
        this.status = status;
        this.sectionCited = sectionCited;
        this.reason = reason;
        this.suggestedNextStep = suggestedNextStep;
        this.confidence = confidence;
        this.disclaimer = "AI-generated analysis. This is not legal advice — verify before deciding on an appeal.";
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSectionCited() { return sectionCited; }
    public void setSectionCited(String sectionCited) { this.sectionCited = sectionCited; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getSuggestedNextStep() { return suggestedNextStep; }
    public void setSuggestedNextStep(String suggestedNextStep) { this.suggestedNextStep = suggestedNextStep; }

    public String getConfidence() { return confidence; }
    public void setConfidence(String confidence) { this.confidence = confidence; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
