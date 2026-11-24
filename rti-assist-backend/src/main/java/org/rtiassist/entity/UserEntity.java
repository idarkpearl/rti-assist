package org.rtiassist.entity;

import jakarta.persistence.*;
import org.rtiassist.model.User;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "role", length = 64)
    private String role = "citizen";

    @Column(name = "password")
    private String password = "";

    @Column(name = "has_password")
    private Boolean hasPassword = false;

    @Column(name = "email_verified")
    private Boolean emailVerified = true;

    @Column(name = "created_at", length = 64)
    private String createdAt;

    @Column(name = "updated_at", length = 64)
    private String updatedAt;

    public UserEntity() {}

    public UserEntity(User model) {
        if (model == null) return;
        this.id = model.getId();
        this.name = model.getName();
        this.email = model.getEmail();
        this.role = model.getRole();
        this.password = model.getPassword();
        this.hasPassword = model.getHasPassword();
        this.emailVerified = model.getEmailVerified();
        this.createdAt = model.getCreatedAt();
        this.updatedAt = model.getUpdatedAt();
    }

    public User toModel() {
        User u = new User();
        u.setId(this.id);
        u.setName(this.name);
        u.setEmail(this.email);
        u.setRole(this.role);
        u.setPassword(this.password);
        u.setHasPassword(this.hasPassword);
        u.setEmailVerified(this.emailVerified);
        u.setCreatedAt(this.createdAt);
        u.setUpdatedAt(this.updatedAt);
        return u;
    }

    // Getters and Setters
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
