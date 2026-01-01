package com.makfuzz.api.core;

import lombok.Data;

@Data
public class SimResult implements Comparable<SimResult> {

    private Criteria criteria;
    private double score;
    private double spellingScore;
    private double phoneticScore;
    private int columnIndex = -1;
    private String value;

    public SimResult() {
    }

    public SimResult(Criteria criteria) {
        this.criteria = criteria;
    }

    @Override
    public int compareTo(SimResult o) {
        return Double.compare(this.score, o.score);
    }
}
