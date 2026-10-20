package org.rtiassist.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DraftRequestDto {
    private String concern;
    private String title;
    private String category;
    private String draftText;
    private String suggestedAuthorityType;
    private String disclaimer;

    public DraftRequestDto() {}

    public DraftRequestDto(String category, String draftText, String suggestedAuthorityType, String disclaimer) {
        this.category = category;
        this.draftText = draftText;
        this.suggestedAuthorityType = suggestedAuthorityType;
        this.disclaimer = disclaimer;
    }

    public String getConcern() { return concern; }
    public void setConcern(String concern) { this.concern = concern; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDraftText() { return draftText; }
    public void setDraftText(String draftText) { this.draftText = draftText; }

    public String getSuggestedAuthorityType() { return suggestedAuthorityType; }
    public void setSuggestedAuthorityType(String suggestedAuthorityType) { this.suggestedAuthorityType = suggestedAuthorityType; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
}
