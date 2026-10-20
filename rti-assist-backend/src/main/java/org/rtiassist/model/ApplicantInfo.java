package org.rtiassist.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApplicantInfo {
    private String fullName;
    private String email;

    public ApplicantInfo() {}

    public ApplicantInfo(String fullName, String email) {
        this.fullName = fullName;
        this.email = email;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
