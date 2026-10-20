package org.rtiassist.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.rtiassist.model.Authority;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthorityRecommendationResponse {
    private Authority authority;
    private FilingChannelDto filingChannel;
    private String statutoryTimeframe;
    private String rationale;
    private Double confidenceScore = 0.95;
    private String disclaimer = "Administrative suggestion based on keyword analysis and public authority records. Please verify PIO details on the official portal before filing.";

    public AuthorityRecommendationResponse() {}

    public Authority getAuthority() { return authority; }
    public void setAuthority(Authority authority) { this.authority = authority; }

    public FilingChannelDto getFilingChannel() { return filingChannel; }
    public void setFilingChannel(FilingChannelDto filingChannel) { this.filingChannel = filingChannel; }

    public String getStatutoryTimeframe() { return statutoryTimeframe; }
    public void setStatutoryTimeframe(String statutoryTimeframe) { this.statutoryTimeframe = statutoryTimeframe; }

    public String getRationale() { return rationale; }
    public void setRationale(String rationale) { this.rationale = rationale; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
