package org.rtiassist.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApplicantInfo {
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private Boolean isBelowPovertyLine;

    public ApplicantInfo() {}

    public ApplicantInfo(String fullName, String email) {
        this.fullName = fullName;
        this.email = email;
    }

    public ApplicantInfo(String fullName, String email, String phone, String address, Boolean isBelowPovertyLine) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.isBelowPovertyLine = isBelowPovertyLine;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Boolean getIsBelowPovertyLine() { return isBelowPovertyLine; }
    public void setIsBelowPovertyLine(Boolean isBelowPovertyLine) { this.isBelowPovertyLine = isBelowPovertyLine; }
}
