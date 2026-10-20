package org.rtiassist.dto;

public class SetPasswordRequest {
    private String email;
    private String password;

    public SetPasswordRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
