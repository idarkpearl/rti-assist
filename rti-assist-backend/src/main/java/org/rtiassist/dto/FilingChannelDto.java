package org.rtiassist.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class FilingChannelDto {
    private String type;
    private String portalName;
    private String portalUrl;
    private Object fee;
    private List<String> paymentModes;

    public FilingChannelDto() {}

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getPortalName() { return portalName; }
    public void setPortalName(String portalName) { this.portalName = portalName; }

    public String getPortalUrl() { return portalUrl; }
    public void setPortalUrl(String portalUrl) { this.portalUrl = portalUrl; }

    public Object getFee() { return fee; }
    public void setFee(Object fee) { this.fee = fee; }

    public List<String> getPaymentModes() { return paymentModes; }
    public void setPaymentModes(List<String> paymentModes) { this.paymentModes = paymentModes; }
}
