package org.rtiassist.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClassifyRequestDto {
    private String responseText;
    private RequestContextDto requestContext;

    public ClassifyRequestDto() {}

    public String getResponseText() { return responseText; }
    public void setResponseText(String responseText) { this.responseText = responseText; }

    public RequestContextDto getRequestContext() { return requestContext; }
    public void setRequestContext(RequestContextDto requestContext) { this.requestContext = requestContext; }
}
