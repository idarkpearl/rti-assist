package org.rtiassist.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.rtiassist.model.User;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {
    private boolean success;
    private String message;
    private String token;
    private User user;
    private Boolean requiresPasswordSetup;
    private Boolean isNewUser;
    private Boolean sentViaBrevo;
    private String devOtp;

    public AuthResponse() {}

    public static AuthResponse success(String message) {
        AuthResponse resp = new AuthResponse();
        resp.setSuccess(true);
        resp.setMessage(message);
        return resp;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Boolean getRequiresPasswordSetup() { return requiresPasswordSetup; }
    public void setRequiresPasswordSetup(Boolean requiresPasswordSetup) { this.requiresPasswordSetup = requiresPasswordSetup; }

    public Boolean getIsNewUser() { return isNewUser; }
    public void setIsNewUser(Boolean isNewUser) { this.isNewUser = isNewUser; }

    public Boolean getSentViaBrevo() { return sentViaBrevo; }
    public void setSentViaBrevo(Boolean sentViaBrevo) { this.sentViaBrevo = sentViaBrevo; }

    public String getDevOtp() { return devOtp; }
    public void setDevOtp(String devOtp) { this.devOtp = devOtp; }
}
