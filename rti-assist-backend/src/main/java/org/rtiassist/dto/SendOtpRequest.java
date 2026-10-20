package org.rtiassist.dto;

public class SendOtpRequest {
    private String email;
    private String name;

    public SendOtpRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
