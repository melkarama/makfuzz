package com.makfuzz.core;

import java.util.List;

import lombok.Data;

@Data
public class LineSimResult implements Comparable<LineSimResult> {

	private String[] candidate;

	private SimResult[] simResults;

	private SimResult maxSimResult;

	public void initSimResults(List<Criteria> critierias) {
		simResults = new SimResult[critierias.size()];

		for (int i = 0; i < critierias.size(); i++) {
			Criteria c = critierias.get(i);
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
