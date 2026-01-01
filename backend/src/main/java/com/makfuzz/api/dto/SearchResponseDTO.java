package com.makfuzz.api.dto;

import lombok.Data;

import java.util.List;

@Data
public class SearchResponseDTO {
    private List<MatchResultDTO> results;
    private int totalFound;
    private int totalResults;
    private double maxUnderThreshold;
    private double minAboveThreshold;
    private double maxAboveThreshold;
    private long searchTimeMs;
}
