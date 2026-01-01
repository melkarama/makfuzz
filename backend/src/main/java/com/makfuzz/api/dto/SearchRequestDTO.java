package com.makfuzz.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class SearchRequestDTO {
    @NotEmpty(message = "At least one criteria is required")
    @Valid
    private List<CriteriaDTO> criterias;

    @NotEmpty(message = "At least one column index is required")
    private List<Integer> searchColumnIndexes;

    @Min(value = 0, message = "Threshold must be between 0 and 1")
    @Max(value = 1, message = "Threshold must be between 0 and 1")
    private double threshold = 0.5;

    @Min(value = 1, message = "Top N must be at least 1")
    @Max(value = 100000, message = "Top N must be at most 100000")
    private int topN = 100;

    private String language = "en";
}
