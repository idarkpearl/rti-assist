package org.rtiassist.entity;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import org.rtiassist.model.Authority;
import org.rtiassist.model.FaaInfo;
import org.rtiassist.model.PioInfo;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "authorities")
public class AuthorityEntity {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", length = 64)
    private String code;

    @Column(name = "ministry")
    private String ministry;

    @Column(name = "department")
    private String department;

    @Column(name = "level", length = 64)
    private String level;

    @Column(name = "jurisdiction", length = 128)
    private String jurisdiction;

    @Column(name = "category_tags", columnDefinition = "TEXT")
    private String categoryTagsJson;

    @Column(name = "portal_url", length = 512)
    private String portalUrl;

    @Column(name = "application_fee", length = 64)
    private String applicationFee = "10";

    @Column(name = "payment_modes", columnDefinition = "TEXT")
    private String paymentModesJson;

    @Column(name = "pio_name")
    private String pioName;

    @Column(name = "pio_designation")
    private String pioDesignation;

    @Column(name = "pio_email")
    private String pioEmail;

    @Column(name = "pio_phone", length = 64)
    private String pioPhone;

    @Column(name = "pio_address", columnDefinition = "TEXT")
    private String pioAddress;

    @Column(name = "faa_name")
    private String faaName;

    @Column(name = "faa_designation")
    private String faaDesignation;

    @Column(name = "faa_email")
    private String faaEmail;

    @Column(name = "faa_phone", length = 64)
    private String faaPhone;

    @Column(name = "faa_address", columnDefinition = "TEXT")
    private String faaAddress;

    @Column(name = "created_at", length = 64)
    private String createdAt;

    public AuthorityEntity() {}

    public AuthorityEntity(Authority model) {
        if (model == null) return;
        this.id = model.getId();
        this.name = model.getName();
        this.code = model.getCode();
        this.ministry = model.getMinistry();
        this.department = model.getDepartment();
        this.level = model.getLevel();
        this.jurisdiction = model.getJurisdiction();
        this.portalUrl = model.getPortalUrl();
        this.applicationFee = model.getApplicationFee() != null ? String.valueOf(model.getApplicationFee()) : "10";
        this.createdAt = model.getCreatedAt();

        try {
            this.categoryTagsJson = model.getCategoryTags() != null ? MAPPER.writeValueAsString(model.getCategoryTags()) : "[]";
            this.paymentModesJson = model.getPaymentModes() != null ? MAPPER.writeValueAsString(model.getPaymentModes()) : "[]";
        } catch (Exception ignored) {
            this.categoryTagsJson = "[]";
            this.paymentModesJson = "[]";
        }

        if (model.getPio() != null) {
            this.pioName = model.getPio().getName();
            this.pioDesignation = model.getPio().getDesignation();
            this.pioEmail = model.getPio().getEmail();
            this.pioPhone = model.getPio().getPhone();
            this.pioAddress = model.getPio().getAddress();
        }
        if (model.getFirstAppellateAuthority() != null) {
            this.faaName = model.getFirstAppellateAuthority().getName();
            this.faaDesignation = model.getFirstAppellateAuthority().getDesignation();
            this.faaEmail = model.getFirstAppellateAuthority().getEmail();
            this.faaPhone = model.getFirstAppellateAuthority().getPhone();
            this.faaAddress = model.getFirstAppellateAuthority().getAddress();
        }
    }

    public Authority toModel() {
        Authority a = new Authority();
        a.setId(this.id);
        a.setName(this.name);
        a.setCode(this.code);
        a.setMinistry(this.ministry);
        a.setDepartment(this.department);
        a.setLevel(this.level);
        a.setJurisdiction(this.jurisdiction);
        a.setPortalUrl(this.portalUrl);
        a.setApplicationFee(this.applicationFee != null ? this.applicationFee : "10");
        a.setCreatedAt(this.createdAt);

        try {
            if (this.categoryTagsJson != null && !this.categoryTagsJson.isBlank()) {
                a.setCategoryTags(MAPPER.readValue(this.categoryTagsJson, new TypeReference<List<String>>() {}));
            }
            if (this.paymentModesJson != null && !this.paymentModesJson.isBlank()) {
                a.setPaymentModes(MAPPER.readValue(this.paymentModesJson, new TypeReference<List<String>>() {}));
            }
        } catch (Exception ignored) {}

        if (this.pioName != null || this.pioDesignation != null) {
            a.setPio(new PioInfo(this.pioName, this.pioDesignation, this.pioEmail, this.pioPhone, this.pioAddress));
        }
        if (this.faaName != null || this.faaDesignation != null) {
            a.setFirstAppellateAuthority(new FaaInfo(this.faaName, this.faaDesignation, this.faaEmail, this.faaPhone, this.faaAddress));
        }
        return a;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getMinistry() { return ministry; }
    public void setMinistry(String ministry) { this.ministry = ministry; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public String getJurisdiction() { return jurisdiction; }
    public void setJurisdiction(String jurisdiction) { this.jurisdiction = jurisdiction; }
    public String getCategoryTagsJson() { return categoryTagsJson; }
    public void setCategoryTagsJson(String categoryTagsJson) { this.categoryTagsJson = categoryTagsJson; }
    public String getPortalUrl() { return portalUrl; }
    public void setPortalUrl(String portalUrl) { this.portalUrl = portalUrl; }
    public String getApplicationFee() { return applicationFee; }
    public void setApplicationFee(String applicationFee) { this.applicationFee = applicationFee; }
    public String getPaymentModesJson() { return paymentModesJson; }
    public void setPaymentModesJson(String paymentModesJson) { this.paymentModesJson = paymentModesJson; }
    public String getPioName() { return pioName; }
    public void setPioName(String pioName) { this.pioName = pioName; }
    public String getPioDesignation() { return pioDesignation; }
    public void setPioDesignation(String pioDesignation) { this.pioDesignation = pioDesignation; }
    public String getPioEmail() { return pioEmail; }
    public void setPioEmail(String pioEmail) { this.pioEmail = pioEmail; }
    public String getPioPhone() { return pioPhone; }
    public void setPioPhone(String pioPhone) { this.pioPhone = pioPhone; }
    public String getPioAddress() { return pioAddress; }
    public void setPioAddress(String pioAddress) { this.pioAddress = pioAddress; }
    public String getFaaName() { return faaName; }
    public void setFaaName(String faaName) { this.faaName = faaName; }
    public String getFaaDesignation() { return faaDesignation; }
    public void setFaaDesignation(String faaDesignation) { this.faaDesignation = faaDesignation; }
    public String getFaaEmail() { return faaEmail; }
    public void setFaaEmail(String faaEmail) { this.faaEmail = faaEmail; }
    public String getFaaPhone() { return faaPhone; }
    public void setFaaPhone(String faaPhone) { this.faaPhone = faaPhone; }
    public String getFaaAddress() { return faaAddress; }
    public void setFaaAddress(String faaAddress) { this.faaAddress = faaAddress; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
