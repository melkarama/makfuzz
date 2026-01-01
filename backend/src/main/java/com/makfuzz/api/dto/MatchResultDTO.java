package com.makfuzz.api.dto;

import lombok.Data;

import java.util.List;

@Data
public class MatchResultDTO {
    private double totalScore;
    private List<String> candidateValues;
    private List<CriteriaMatchDTO> criteriaMatches;
}
