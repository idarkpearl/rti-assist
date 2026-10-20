package org.rtiassist.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CaseItem {
    private String id;
    private String trackingNumber;
    private String title;
    private String subjectCategory;
    private String summary;
    private String description;
    private List<String> queries = new ArrayList<>();
    private ApplicantInfo applicant;
    private String authorityId;
    private Authority authority;
    private String status = "submitted";
    private Boolean isLifeAndLiberty = false;
    private String filingDate;
    private String submissionMode = "online_portal";
    private Object feePaid = 10;
    private String paymentReference;
    private List<Deadline> deadlines = new ArrayList<>();
    private List<Appeal> appeals = new ArrayList<>();
    private List<CaseDocument> documents = new ArrayList<>();
    private List<String> tags = new ArrayList<>();
    private String pioResponseSummary;
    private String pioResponseDate;
    private String createdAt;
    private String updatedAt;

    public CaseItem() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubjectCategory() { return subjectCategory; }
    public void setSubjectCategory(String subjectCategory) { this.subjectCategory = subjectCategory; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getQueries() { return queries; }
    public void setQueries(List<String> queries) { this.queries = queries; }

    public ApplicantInfo getApplicant() { return applicant; }
    public void setApplicant(ApplicantInfo applicant) { this.applicant = applicant; }

    public String getAuthorityId() { return authorityId; }
    public void setAuthorityId(String authorityId) { this.authorityId = authorityId; }

    public Authority getAuthority() { return authority; }
    public void setAuthority(Authority authority) { this.authority = authority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsLifeAndLiberty() { return isLifeAndLiberty; }
    public void setIsLifeAndLiberty(Boolean isLifeAndLiberty) { this.isLifeAndLiberty = isLifeAndLiberty; }

    public String getFilingDate() { return filingDate; }
    public void setFilingDate(String filingDate) { this.filingDate = filingDate; }

    public String getSubmissionMode() { return submissionMode; }
    public void setSubmissionMode(String submissionMode) { this.submissionMode = submissionMode; }

    public Object getFeePaid() { return feePaid; }
    public void setFeePaid(Object feePaid) { this.feePaid = feePaid; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

    public List<Deadline> getDeadlines() { return deadlines; }
    public void setDeadlines(List<Deadline> deadlines) { this.deadlines = deadlines; }

    public List<Appeal> getAppeals() { return appeals; }
    public void setAppeals(List<Appeal> appeals) { this.appeals = appeals; }

    public List<CaseDocument> getDocuments() { return documents; }
    public void setDocuments(List<CaseDocument> documents) { this.documents = documents; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getPioResponseSummary() { return pioResponseSummary; }
    public void setPioResponseSummary(String pioResponseSummary) { this.pioResponseSummary = pioResponseSummary; }

    public String getPioResponseDate() { return pioResponseDate; }
    public void setPioResponseDate(String pioResponseDate) { this.pioResponseDate = pioResponseDate; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
