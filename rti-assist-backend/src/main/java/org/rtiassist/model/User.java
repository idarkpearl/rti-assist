package org.rtiassist.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class User {
    private String id;
    private String name;
    private String email;
    private String role = "citizen";

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password = "";

    private Boolean hasPassword = false;
    private Boolean emailVerified = true;
    private String createdAt;
    private String updatedAt;

    public User() {}

    public User(String id, String name, String email, String role, String password, Boolean hasPassword) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = (role != null) ? role : "citizen";
        this.password = (password != null) ? password : "";
        this.hasPassword = (hasPassword != null) ? hasPassword : false;
        this.emailVerified = true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Boolean getHasPassword() { return hasPassword; }
    public void setHasPassword(Boolean hasPassword) { this.hasPassword = hasPassword; }

    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
