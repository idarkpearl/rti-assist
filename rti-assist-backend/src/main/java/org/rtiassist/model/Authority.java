package org.rtiassist.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class Authority {
    private String id;
    private String name;
    private String code;
    private String ministry;
    private String department;
    private String level;
    private String jurisdiction;
    private List<String> categoryTags = new ArrayList<>();
    private String portalUrl;
    private Object applicationFee = 10;
    private List<String> paymentModes = new ArrayList<>();
    private PioInfo pio;
    private FaaInfo firstAppellateAuthority;
    private String createdAt;

    public Authority() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getMinistry() { return ministry; }
    public void setMinistry(String ministry) { this.ministry = ministry; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getJurisdiction() { return jurisdiction; }
    public void setJurisdiction(String jurisdiction) { this.jurisdiction = jurisdiction; }

    public List<String> getCategoryTags() { return categoryTags; }
    public void setCategoryTags(List<String> categoryTags) { this.categoryTags = categoryTags; }

    public String getPortalUrl() { return portalUrl; }
    public void setPortalUrl(String portalUrl) { this.portalUrl = portalUrl; }

    public Object getApplicationFee() { return applicationFee; }
    public void setApplicationFee(Object applicationFee) { this.applicationFee = applicationFee; }

    public List<String> getPaymentModes() { return paymentModes; }
    public void setPaymentModes(List<String> paymentModes) { this.paymentModes = paymentModes; }

    public PioInfo getPio() { return pio; }
    public void setPio(PioInfo pio) { this.pio = pio; }

    public FaaInfo getFirstAppellateAuthority() { return firstAppellateAuthority; }
    public void setFirstAppellateAuthority(FaaInfo firstAppellateAuthority) { this.firstAppellateAuthority = firstAppellateAuthority; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
