package com.makfuzz.api.core;

import org.apache.commons.codec.language.bm.NameType;
import org.apache.commons.codec.language.bm.PhoneticEngine;
import org.apache.commons.codec.language.bm.RuleType;
import org.apache.commons.text.similarity.JaroWinklerSimilarity;

import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class FuzzEngine {

    private static final JaroWinklerSimilarity SPELLING_STRATEGY = new JaroWinklerSimilarity();
    private static final FrenchSoundex FRENCH_ENGINE = new FrenchSoundex();
    private static final PhoneticEngine DEFAULT_ENGINE = new PhoneticEngine(NameType.GENERIC, RuleType.APPROX, true);
    
    private static final Map<String, String> PHONETIC_CACHE = new ConcurrentHashMap<>(2000);
    private static String currentCacheLang = "";

    public SearchResult bestMatch(Collection<String[]> candidates, List<Criteria> criterias,
            List<Integer> searchColumnIndexes, double threshold, int topN, String lang) {

        if (criterias == null || criterias.isEmpty()) {
            return new SearchResult(Collections.emptyList(), 0, 0, 0, 0);
        }

        // Clear cache if language changed
        if (!currentCacheLang.equalsIgnoreCase(lang)) {
            PHONETIC_CACHE.clear();
            currentCacheLang = lang;
        }

        boolean isFrench = "fr".equalsIgnoreCase(lang);
        int count = criterias.size();

        // Pre-optimized criteria data
        String[] criteriaValues = new String[count];
        String[] criteriaPhoneticCodes = new String[count];

        for (int i = 0; i < count; i++) {
            Criteria cI = criterias.get(i);
            if (cI != null && !cI.isBlank()) {
                criteriaValues[i] = cI.getValue();
                criteriaPhoneticCodes[i] = isFrench ? FRENCH_ENGINE.encode(cI.getValue()) : DEFAULT_ENGINE.encode(cI.getValue());
            }
        }

        List<LineSimResult> allMatches = candidates.parallelStream().map(t -> {
            LineSimResult lsr = new LineSimResult();
            lsr.setCandidate(t);
            lsr.initSimResults(criterias);

            boolean isExactOrRegexMatchingLineFalse = false;

            for (int i = 0; i < lsr.getSimResults().length; i++) {
                SimResult sr = lsr.getSimResults()[i];
                Criteria c = sr.getCriteria();

                boolean isExactOrRegexMatchingCriteria = c.getMatchingType() == Criteria.MatchingType.EXACT
                        || c.getMatchingType() == Criteria.MatchingType.REGEX;

                String critValue = c.getValue();
                String critPhonetic = criteriaPhoneticCodes[i];
                int nbExactOrRegexMatching = 0;

                for (int idx : searchColumnIndexes) {
                    String cellValue = (idx < t.length && t[idx] != null) ? t[idx].trim().toUpperCase() : "";
                    if (cellValue.isEmpty()) {
                        continue;
                    }

                    double spellingScore = 0.0;
                    double phoneticScore = 0.0;

                    if (c.getMatchingType() == Criteria.MatchingType.EXACT) {
                        boolean isMatching = cellValue.equalsIgnoreCase(critValue);
                        spellingScore = isMatching ? 1.0 : 0.0;
                        phoneticScore = 1.0;
                        if (isMatching) nbExactOrRegexMatching++;
                    } else if (c.getMatchingType() == Criteria.MatchingType.REGEX) {
                        boolean isMatching = c.getPattern().matcher(cellValue).find();
                        spellingScore = isMatching ? 1.0 : 0.0;
                        phoneticScore = 1.0;
                        if (isMatching) nbExactOrRegexMatching++;
                    } else {
                        spellingScore = SPELLING_STRATEGY.apply(cellValue, critValue);
                        String cellPhonetic = PHONETIC_CACHE.computeIfAbsent(cellValue,
                                k -> isFrench ? FRENCH_ENGINE.encode(k) : DEFAULT_ENGINE.encode(k));
                        phoneticScore = cellPhonetic.equals(critPhonetic) ? 1.0 : SPELLING_STRATEGY.apply(cellPhonetic, critPhonetic);
                    }

                    if (!isExactOrRegexMatchingCriteria || spellingScore > 0) {
                        double score = calculateScore(c, spellingScore, phoneticScore);
                        if (Double.compare(score, sr.getScore()) > 0 && spellingScore >= c.getMinSpellingScore()
                                && phoneticScore >= c.getMinPhoneticScore()) {
                            sr.setPhoneticScore(phoneticScore);
                            sr.setSpellingScore(spellingScore);
                            sr.setScore(score);
                            sr.setColumnIndex(idx);
                            sr.setValue(cellValue);
                        }
                    }
                }

                if (lsr.getMaxSimResult() == null || lsr.getMaxSimResult().compareTo(sr) < 0) {
                    lsr.setMaxSimResult(sr);
                }

                if (isExactOrRegexMatchingCriteria && nbExactOrRegexMatching == 0) {
                    isExactOrRegexMatchingLineFalse = true;
                }
            }

            if (isExactOrRegexMatchingLineFalse) {
                return null;
            }

            return lsr;
        }).filter(p -> p != null && p.getScore() > 0).toList();

        List<LineSimResult> allFoundMatches = allMatches.stream()
                .filter(p -> p.getScore() >= threshold)
                .sorted(Comparator.reverseOrder())
                .toList();

        int totalFound = allFoundMatches.size();
        List<LineSimResult> filtered = allFoundMatches.stream().limit(topN).toList();

        SearchResult sr = new SearchResult(filtered, totalFound);
        sr.setAllFoundResults(allFoundMatches);

        // Calculate metrics
        double maxUnder = 0;
        double minAbove = 1.0;
        double maxAbove = 0;

        for (LineSimResult lsr : allMatches) {
            double score = lsr.getScore();
            if (score < threshold) {
                if (score > maxUnder) maxUnder = score;
            } else {
                if (score < minAbove) minAbove = score;
                if (score > maxAbove) maxAbove = score;
            }
        }

        sr.setMaxUnderThreshold(maxUnder);
        sr.setMinAboveThreshold(minAbove == 1.0 && filtered.isEmpty() ? 0 : minAbove);
        sr.setMaxAboveThreshold(maxAbove);
        sr.setTotalResults(candidates.size());

        return sr;
    }

    private double calculateScore(Criteria cr, double spellingScore, double phoneticScore) {
        double totalWeight = cr.getSpellingWeight() + cr.getPhoneticWeight();
        if (totalWeight == 0) {
            return 0.0;
        }
        return (spellingScore * cr.getSpellingWeight() + phoneticScore * cr.getPhoneticWeight()) / totalWeight;
    }
}
