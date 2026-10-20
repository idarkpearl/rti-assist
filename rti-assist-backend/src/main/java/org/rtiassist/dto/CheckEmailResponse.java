package org.rtiassist.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CheckEmailResponse {
    private boolean exists;
    private boolean hasPassword;
    private String name;

    public CheckEmailResponse() {}

    public CheckEmailResponse(boolean exists, boolean hasPassword, String name) {
        this.exists = exists;
        this.hasPassword = hasPassword;
        this.name = name;
    }

    public boolean isExists() { return exists; }
    public void setExists(boolean exists) { this.exists = exists; }

    public boolean isHasPassword() { return hasPassword; }
    public void setHasPassword(boolean hasPassword) { this.hasPassword = hasPassword; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
