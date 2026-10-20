package org.rtiassist.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse {
    private Boolean success;
    private String code;
    private String message;
    private Object details;

    public ApiResponse() {}

    public ApiResponse(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public ApiResponse(Boolean success, String code, String message) {
        this.success = success;
        this.code = code;
        this.message = message;
    }

    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Object getDetails() { return details; }
    public void setDetails(Object details) { this.details = details; }
}
