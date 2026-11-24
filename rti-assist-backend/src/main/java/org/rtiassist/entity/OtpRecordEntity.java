package org.rtiassist.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "otp_records")
public class OtpRecordEntity {

    @Id
    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "otp", length = 16, nullable = false)
    private String otp;

    @Column(name = "expires_at", nullable = false)
    private Long expiresAt;

    @Column(name = "attempts", nullable = false)
    private Integer attempts = 0;

    @Column(name = "created_at", nullable = false)
    private Long createdAt;

    public OtpRecordEntity() {}

    public OtpRecordEntity(String email, String otp, Long expiresAt, Integer attempts, Long createdAt) {
        this.email = email;
        this.otp = otp;
        this.expiresAt = expiresAt;
        this.attempts = attempts != null ? attempts : 0;
        this.createdAt = createdAt;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public Long getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Long expiresAt) { this.expiresAt = expiresAt; }

    public Integer getAttempts() { return attempts; }
    public void setAttempts(Integer attempts) { this.attempts = attempts; }

    public Long getCreatedAt() { return createdAt; }
    public void setCreatedAt(Long createdAt) { this.createdAt = createdAt; }
}
