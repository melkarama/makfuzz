package com.makfuzz.api.core;

import lombok.Data;

import java.util.List;

@Data
public class SearchResult {
    private List<LineSimResult> results;
    private List<LineSimResult> allFoundResults;
    private double maxUnderThreshold = 0.0;
    private double minAboveThreshold = 0.0;
    private double maxAboveThreshold = 0.0;
    private int totalFound;
    private int totalResults;

    public SearchResult() {
    }

    public SearchResult(List<LineSimResult> results, double maxUnder, double minAbove, double maxAbove, int totalFound) {
        this.results = results;
        this.maxUnderThreshold = maxUnder;
        this.minAboveThreshold = minAbove;
        this.maxAboveThreshold = maxAbove;
        this.totalFound = totalFound;
    }

    public SearchResult(List<LineSimResult> results, int totalFound) {
        this.results = results;
        this.totalFound = totalFound;
    }

    public SearchResult(List<LineSimResult> results) {
        this.results = results;
        this.totalFound = results != null ? results.size() : 0;
    }
}
