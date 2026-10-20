package org.rtiassist.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class RequestContextDto {
    private String originalRequestText;
    private String filingDate;
    private String authorityName;

    public RequestContextDto() {}

    public String getOriginalRequestText() { return originalRequestText; }
    public void setOriginalRequestText(String originalRequestText) { this.originalRequestText = originalRequestText; }

    public String getFilingDate() { return filingDate; }
    public void setFilingDate(String filingDate) { this.filingDate = filingDate; }

    public String getAuthorityName() { return authorityName; }
    public void setAuthorityName(String authorityName) { this.authorityName = authorityName; }
}
