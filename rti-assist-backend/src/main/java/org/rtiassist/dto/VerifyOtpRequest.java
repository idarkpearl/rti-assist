package org.rtiassist.dto;

public class VerifyOtpRequest {
    private String email;
    private String otp;
    private String name;

    public VerifyOtpRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
