package com.makfuzz.api.core;

import java.util.regex.Pattern;

import org.apache.commons.lang3.StringUtils;

import lombok.Data;

@Data
public class Criteria {

    public enum MatchingType {
        REGEX, SIMILARITY, EXACT
    }

    private String value;
    private double minSpellingScore;
    private double minPhoneticScore;
    private MatchingType matchingType;
    private Pattern pattern;
    private double spellingWeight;
    private double phoneticWeight;

    public Criteria() {
    }

    public Criteria(String value, double spellingWeight, double phoneticWeight, double minSpellingScore,
            double minPhoneticScore, MatchingType matchingType) {
        this.value = StringUtils.isBlank(value) ? null : value.trim().toUpperCase();
        this.spellingWeight = spellingWeight;
        this.phoneticWeight = phoneticWeight;
        this.minSpellingScore = minSpellingScore;
        this.minPhoneticScore = minPhoneticScore;
        this.matchingType = matchingType;

        if (matchingType == MatchingType.REGEX && this.value != null) {
            try {
                this.pattern = Pattern.compile(this.value, Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
            } catch (Exception ex) {
                throw new IllegalStateException("Invalid regex pattern: " + this.value, ex);
            }
        }
    }

    public static Criteria similarity(String value, double spellingWeight, double phoneticWeight, double minSpelling,
            double minPhonetic) {
        return new Criteria(value, spellingWeight, phoneticWeight, minSpelling, minPhonetic, MatchingType.SIMILARITY);
    }

    public static Criteria exact(String value, double spellingWeight, double phoneticWeight) {
        return new Criteria(value, spellingWeight, phoneticWeight, -1, -1, MatchingType.EXACT);
    }

    public static Criteria regex(String value, double spellingWeight, double phoneticWeight) {
        return new Criteria(value, spellingWeight, phoneticWeight, -1, -1, MatchingType.REGEX);
    }

    public boolean isBlank() {
        return StringUtils.isBlank(value);
    }
}
