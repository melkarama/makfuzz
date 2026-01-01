package com.makfuzz.api.dto;

import lombok.Data;

@Data
public class CriteriaMatchDTO {
    private String matchedValue;
    private double spellingScore;
    private double phoneticScore;
    private double score;
    private int columnIndex;
}
