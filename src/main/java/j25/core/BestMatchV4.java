package j25.core;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import net.ricecode.similarity.JaroWinklerStrategy;
import net.ricecode.similarity.SimilarityStrategy;

public class BestMatchV4 {

	static final String SEP = "[,;]";
	private static final SimilarityStrategy STRATEGY = new JaroWinklerStrategy();

//	public static void main(String[] args) throws IOException {
//
//		List<String> firstNames = FileUtils.readLines(new File("./names.csv"), StandardCharsets.UTF_8);
//
//		List<String[]> db = firstNames.stream().map(s -> s.toUpperCase().split(SEP)).toList();
//
//		List<Criteria> criterias = new ArrayList<>();
//		criterias.add(Criteria.similarity("ahmed", 1, 0.5d));
//
//		List<SimResult> bfn = bestMatch(db, criterias, 0.0, 100);
//		ObjectMapper mapper = new ObjectMapper();
//		mapper.enable(com.fasterxml.jackson.databind.SerializationFeature.INDENT_OUTPUT);
//		System.out.println(mapper.writeValueAsString(bfn));
//	}
	
	public static List<SimResult> bestMatch(Collection<String[]> candidates, List<Criteria> criterias, double threshold,
			int topN) {

		if (criterias == null || criterias.isEmpty()) {
			return java.util.Collections.emptyList();
		}

		int count = criterias.size();
		List<Integer> activeIndexes = new java.util.ArrayList<>();
		double totalWeight = 0.0;

		for (int i = 0; i < count; i++) {
			Criteria cI = criterias.get(i);
			if (cI != null && !cI.isBlank()) {
				activeIndexes.add(i);
				totalWeight += cI.weight;
			}
		}

		if (activeIndexes.isEmpty()) {
			// If no criteria are active, return the top candidates with a perfect score
			return candidates.stream()
					.limit(topN)
					.map(t -> new SimResult(t, 1.0, new double[count]))
					.collect(Collectors.toList());
		}

		if (totalWeight <= 0) {
			return java.util.Collections.emptyList();
		}

		final double finalTotalWeight = totalWeight;

		return candidates.stream()
				.map(t -> {
					double[] scoreDetails = new double[count];
					double weightedScoreSum = 0d;

					for (int i : activeIndexes) {
						Criteria cI = criterias.get(i);
						double simScore = 0.0;
						
						// Safety check for row length
						String cellValue = (t != null && i < t.length) ? t[i] : null;

						if (cI.matchingType == Criteria.MatchingType.EXACT) {
							if (cellValue != null && cellValue.equalsIgnoreCase(cI.value)) {
								simScore = 1.0;
							} else {
								return null;
							}
						} else if (cI.matchingType == Criteria.MatchingType.REGEX) {
							if (cI.pattern != null && cellValue != null && cI.pattern.matcher(cellValue).matches()) {
								simScore = 1.0;
							} else {
								return null;
							}
						} else {
							// SIMILARITY
							if (cellValue == null) {
								simScore = 0.0;
							} else {
								// RiceCode String Similarity Strategy
								simScore = STRATEGY.score(cellValue, cI.value);
							}
							
							if (simScore < cI.minScoreIfSimilarity) {
								return null;
							}
						}

						double weightedPart = simScore * cI.weight;
						scoreDetails[i] = weightedPart;
						weightedScoreSum += weightedPart;
					}

					double finalScore = weightedScoreSum / finalTotalWeight;
					return new SimResult(t, finalScore, scoreDetails);
				})
				.filter(p -> p != null && p.getScore() >= threshold)
				.distinct()
				.sorted()
				.limit(topN)
				.collect(Collectors.toList());
	}
}