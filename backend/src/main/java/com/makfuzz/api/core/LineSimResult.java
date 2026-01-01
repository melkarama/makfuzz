package com.makfuzz.api.core;

import lombok.Data;

import java.util.List;

@Data
public class LineSimResult implements Comparable<LineSimResult> {

    private String[] candidate;
    private SimResult[] simResults;
    private SimResult maxSimResult;
    private int lineIndex;

    public void initSimResults(List<Criteria> criterias) {
        simResults = new SimResult[criterias.size()];
        for (int i = 0; i < criterias.size(); i++) {
            Criteria c = criterias.get(i);
            simResults[i] = new SimResult(c);
        }
    }

    @Override
    public int compareTo(LineSimResult o) {
        return Double.compare(getScore(), o.getScore());
    }

    public double getScore() {
        double d = 1;
        for (SimResult sr : simResults) {
            d *= sr.getScore();
        }
        return d;
    }
}
