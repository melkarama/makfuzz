package com.makfuzz.api.dto;

import com.makfuzz.api.core.Criteria.MatchingType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CriteriaDTO {
    @NotBlank(message = "Search value is required")
    private String value;
    
    private double spellingWeight = 1.0;
    private double phoneticWeight = 1.0;
    private double minSpellingScore = 0.0;
    private double minPhoneticScore = 0.0;
    private MatchingType matchingType = MatchingType.SIMILARITY;
}
