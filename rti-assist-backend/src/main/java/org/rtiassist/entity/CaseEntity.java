package org.rtiassist.entity;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import org.rtiassist.dto.ClassificationResult;
import org.rtiassist.model.ApplicantInfo;
import org.rtiassist.model.CaseItem;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cases")
public class CaseEntity {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "user_id", length = 64)
    private String userId;

    @Column(name = "tracking_number", length = 128)
    private String trackingNumber;

    @Column(name = "title", length = 512, nullable = false)
    private String title;

    @Column(name = "subject_category")
    private String subjectCategory;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "queries", columnDefinition = "TEXT")
    private String queriesJson;

    @Column(name = "applicant_name")
    private String applicantName;

    @Column(name = "applicant_email")
    private String applicantEmail;

    @Column(name = "applicant_phone", length = 64)
    private String applicantPhone;

    @Column(name = "applicant_address", columnDefinition = "TEXT")
    private String applicantAddress;

    @Column(name = "applicant_is_bpl")
    private Boolean applicantIsBpl = false;

    @Column(name = "authority_id", length = 64)
    private String authorityId;

    @Column(name = "status", length = 64)
    private String status = "submitted";

    @Column(name = "is_life_and_liberty")
    private Boolean isLifeAndLiberty = false;

    @Column(name = "filing_date", length = 64)
    private String filingDate;

    @Column(name = "submission_mode", length = 64)
    private String submissionMode = "online_portal";

    @Column(name = "fee_paid", length = 64)
    private String feePaid = "10";

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tagsJson;

    @Column(name = "pio_response_summary", columnDefinition = "TEXT")
    private String pioResponseSummary;

    @Column(name = "pio_response_date", length = 64)
    private String pioResponseDate;

    @Column(name = "last_response_status", length = 64)
    private String lastResponseStatus;

    @Column(name = "response_classification", columnDefinition = "TEXT")
    private String responseClassificationJson;

    @Column(name = "created_at", length = 64)
    private String createdAt;

    @Column(name = "updated_at", length = 64)
    private String updatedAt;

    public CaseEntity() {}

    public CaseEntity(CaseItem model, String userId) {
        if (model == null) return;
        this.id = model.getId();
        this.userId = (userId != null && !userId.isBlank()) ? userId : "usr_demo";
        this.trackingNumber = model.getTrackingNumber();
        this.title = model.getTitle();
        this.subjectCategory = model.getSubjectCategory();
        this.summary = model.getSummary();
        this.description = model.getDescription();
        this.authorityId = model.getAuthorityId();
        this.status = model.getStatus() != null ? model.getStatus() : "submitted";
        this.isLifeAndLiberty = model.getIsLifeAndLiberty() != null ? model.getIsLifeAndLiberty() : false;
        this.filingDate = model.getFilingDate();
        this.submissionMode = model.getSubmissionMode() != null ? model.getSubmissionMode() : "online_portal";
        this.feePaid = model.getFeePaid() != null ? String.valueOf(model.getFeePaid()) : "10";
        this.paymentReference = model.getPaymentReference();
        this.pioResponseSummary = model.getPioResponseSummary();
        this.pioResponseDate = model.getPioResponseDate();
        this.lastResponseStatus = model.getLastResponseStatus();
        this.createdAt = model.getCreatedAt();
        this.updatedAt = model.getUpdatedAt();

        if (model.getApplicant() != null) {
            this.applicantName = model.getApplicant().getFullName();
            this.applicantEmail = model.getApplicant().getEmail();
            this.applicantPhone = model.getApplicant().getPhone();
            this.applicantAddress = model.getApplicant().getAddress();
            this.applicantIsBpl = Boolean.TRUE.equals(model.getApplicant().getIsBelowPovertyLine());
        }

        try {
            this.queriesJson = model.getQueries() != null ? MAPPER.writeValueAsString(model.getQueries()) : "[]";
            this.tagsJson = model.getTags() != null ? MAPPER.writeValueAsString(model.getTags()) : "[]";
            if (model.getResponseClassification() != null) {
                this.responseClassificationJson = MAPPER.writeValueAsString(model.getResponseClassification());
                if (this.lastResponseStatus == null) {
                    this.lastResponseStatus = model.getResponseClassification().getStatus();
                }
            }
        } catch (Exception ignored) {
            this.queriesJson = "[]";
            this.tagsJson = "[]";
        }
    }

    public CaseItem toModel() {
        CaseItem c = new CaseItem();
        c.setId(this.id);
        c.setTrackingNumber(this.trackingNumber);
        c.setTitle(this.title);
        c.setSubjectCategory(this.subjectCategory);
        c.setSummary(this.summary);
        c.setDescription(this.description);
        c.setAuthorityId(this.authorityId);
        c.setStatus(this.status);
        c.setIsLifeAndLiberty(this.isLifeAndLiberty);
        c.setFilingDate(this.filingDate);
        c.setSubmissionMode(this.submissionMode);
        c.setFeePaid(this.feePaid);
        c.setPaymentReference(this.paymentReference);
        c.setPioResponseSummary(this.pioResponseSummary);
        c.setPioResponseDate(this.pioResponseDate);
        c.setLastResponseStatus(this.lastResponseStatus);
        c.setCreatedAt(this.createdAt);
        c.setUpdatedAt(this.updatedAt);

        if (this.applicantName != null || this.applicantEmail != null || this.applicantPhone != null || this.applicantAddress != null) {
            c.setApplicant(new ApplicantInfo(this.applicantName, this.applicantEmail, this.applicantPhone, this.applicantAddress, this.applicantIsBpl));
        }

        try {
            if (this.queriesJson != null && !this.queriesJson.isBlank()) {
                c.setQueries(MAPPER.readValue(this.queriesJson, new TypeReference<List<String>>() {}));
            }
            if (this.tagsJson != null && !this.tagsJson.isBlank()) {
                c.setTags(MAPPER.readValue(this.tagsJson, new TypeReference<List<String>>() {}));
            }
            if (this.responseClassificationJson != null && !this.responseClassificationJson.isBlank()) {
                c.setResponseClassification(MAPPER.readValue(this.responseClassificationJson, ClassificationResult.class));
            }
        } catch (Exception ignored) {}

        return c;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
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
    public String getQueriesJson() { return queriesJson; }
    public void setQueriesJson(String queriesJson) { this.queriesJson = queriesJson; }
    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }
    public String getApplicantEmail() { return applicantEmail; }
    public void setApplicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; }
    public String getApplicantPhone() { return applicantPhone; }
    public void setApplicantPhone(String applicantPhone) { this.applicantPhone = applicantPhone; }
    public String getApplicantAddress() { return applicantAddress; }
    public void setApplicantAddress(String applicantAddress) { this.applicantAddress = applicantAddress; }
    public String getAuthorityId() { return authorityId; }
    public void setAuthorityId(String authorityId) { this.authorityId = authorityId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Boolean getIsLifeAndLiberty() { return isLifeAndLiberty; }
    public void setIsLifeAndLiberty(Boolean isLifeAndLiberty) { this.isLifeAndLiberty = isLifeAndLiberty; }
    public String getFilingDate() { return filingDate; }
    public void setFilingDate(String filingDate) { this.filingDate = filingDate; }
    public String getSubmissionMode() { return submissionMode; }
    public void setSubmissionMode(String submissionMode) { this.submissionMode = submissionMode; }
    public String getFeePaid() { return feePaid; }
    public void setFeePaid(String feePaid) { this.feePaid = feePaid; }
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
    public String getTagsJson() { return tagsJson; }
    public void setTagsJson(String tagsJson) { this.tagsJson = tagsJson; }
    public String getPioResponseSummary() { return pioResponseSummary; }
    public void setPioResponseSummary(String pioResponseSummary) { this.pioResponseSummary = pioResponseSummary; }
    public String getPioResponseDate() { return pioResponseDate; }
    public void setPioResponseDate(String pioResponseDate) { this.pioResponseDate = pioResponseDate; }
    public Boolean getApplicantIsBpl() { return applicantIsBpl; }
    public void setApplicantIsBpl(Boolean applicantIsBpl) { this.applicantIsBpl = applicantIsBpl; }
    public String getLastResponseStatus() { return lastResponseStatus; }
    public void setLastResponseStatus(String lastResponseStatus) { this.lastResponseStatus = lastResponseStatus; }
    public String getResponseClassificationJson() { return responseClassificationJson; }
    public void setResponseClassificationJson(String responseClassificationJson) { this.responseClassificationJson = responseClassificationJson; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
