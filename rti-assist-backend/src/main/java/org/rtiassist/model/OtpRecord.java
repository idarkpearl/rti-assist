package org.rtiassist.model;

public class OtpRecord {
    private String otp;
    private long expiresAt;
    private int attempts;
    private long createdAt;

    public OtpRecord() {}

    public OtpRecord(String otp, long expiresAt, int attempts, long createdAt) {
        this.otp = otp;
        this.expiresAt = expiresAt;
        this.attempts = attempts;
        this.createdAt = createdAt;
    }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public long getExpiresAt() { return expiresAt; }
    public void setExpiresAt(long expiresAt) { this.expiresAt = expiresAt; }

    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }

    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
}
