package com.makfuzz.api.core;

/**
 * French Phonetic Encoder based on French phonetic rules
 * Handles French-specific pronunciation patterns, silent letters, and accents
 */
public class FrenchSoundex {

    public String encode(String input) {
        if (input == null || input.isEmpty()) {
            return "";
        }

        String word = input.trim().toUpperCase();
        word = removeAccents(word);
        word = applyFrenchRules(word);
        word = removeConsecutiveDuplicates(word);
        word = word.replaceAll("[^A-Z]", "");

        return word;
    }

    private String removeAccents(String text) {
        return text.replaceAll("[ÀÁÂÃÄÅ]", "A")
                .replaceAll("[ÈÉÊË]", "E")
                .replaceAll("[ÌÍÎÏ]", "I")
                .replaceAll("[ÒÓÔÕÖØ]", "O")
                .replaceAll("[ÙÚÛÜ]", "U")
                .replaceAll("Ç", "S")
                .replaceAll("Ñ", "N")
                .replaceAll("Æ", "E")
                .replaceAll("Œ", "E");
    }

    private String applyFrenchRules(String word) {
        // Initial letters
        word = word.replaceAll("^PH", "F");
        word = word.replaceAll("^GN", "NI");

        // Common French patterns
        word = word.replaceAll("PH", "F");
        word = word.replaceAll("GN", "NI");
        word = word.replaceAll("CH", "SH");

        // Handle QU
        word = word.replaceAll("QU", "K");
        word = word.replaceAll("Q", "K");

        // Handle C variations
        word = word.replaceAll("C([EIY])", "S$1");
        word = word.replaceAll("C([AOU])", "K$1");
        word = word.replaceAll("CC", "K");
        word = word.replaceAll("CK", "K");
        word = word.replaceAll("C", "K");

        // Handle G variations
        word = word.replaceAll("G([EIY])", "J$1");
        word = word.replaceAll("GA", "KA");
        word = word.replaceAll("GO", "KO");
        word = word.replaceAll("GU", "K");
        word = word.replaceAll("G", "K");

        // Handle French EAU, EAUX -> O
        word = word.replaceAll("EAUX?", "O");
        word = word.replaceAll("EAU", "O");

        // Handle AI, EI -> E
        word = word.replaceAll("AI", "E");
        word = word.replaceAll("EI", "E");
        word = word.replaceAll("AY", "E");

        // Handle OU -> U
        word = word.replaceAll("OU", "U");

        // Handle silent H
        word = word.replaceAll("H", "");

        // Handle W -> V
        word = word.replaceAll("W", "V");

        // Handle Y -> I
        word = word.replaceAll("Y", "I");

        // Handle double consonants
        word = word.replaceAll("LL", "L");
        word = word.replaceAll("MM", "M");
        word = word.replaceAll("NN", "N");
        word = word.replaceAll("PP", "P");
        word = word.replaceAll("RR", "R");
        word = word.replaceAll("SS", "S");
        word = word.replaceAll("TT", "T");

        // Remove silent final letters
        word = word.replaceAll("E$", "");
        word = word.replaceAll("S$", "");
        word = word.replaceAll("T$", "");
        word = word.replaceAll("X$", "");
        word = word.replaceAll("Z$", "");
        word = word.replaceAll("D$", "");
        word = word.replaceAll("P$", "");

        return word;
    }

    private String removeConsecutiveDuplicates(String text) {
        if (text.length() <= 1) {
            return text;
        }

        StringBuilder result = new StringBuilder();
        char prev = text.charAt(0);
        result.append(prev);

        for (int i = 1; i < text.length(); i++) {
            char current = text.charAt(i);
            if (current != prev) {
                result.append(current);
                prev = current;
            }
        }

        return result.toString();
    }
}
