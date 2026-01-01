package com.makfuzz.core;

/**
 * French Phonetic Encoder based on French phonetic rules Handles
 * French-specific pronunciation patterns, silent letters, and accents
 */
public class FrenchSoundex {

	public String encode(String input) {
		if (input == null || input.isEmpty()) {
			return "";
		}

		// Step 1: Normalize and uppercase
		String word = input.trim().toUpperCase();

		// Step 2: Remove accents and normalize French characters
		word = removeAccents(word);

		// Step 3: Apply French phonetic rules
		word = applyFrenchRules(word);

		// Step 4: Remove consecutive duplicates
		word = removeConsecutiveDuplicates(word);

		// Step 5: Keep only letters
		word = word.replaceAll("[^A-Z]", "");

		return word;
	}

	private String removeAccents(String text) {
		return text.replaceAll("[ÀÁÂÃÄÅ]", "A").replaceAll("[ÈÉÊË]", "E").replaceAll("[ÌÍÎÏ]", "I")
				.replaceAll("[ÒÓÔÕÖØ]", "O").replaceAll("[ÙÚÛÜ]", "U").replaceAll("Ç", "S").replaceAll("Ñ", "N")
				.replaceAll("Æ", "E").replaceAll("Œ", "E");
	}

	private String applyFrenchRules(String word) {
		// French phonetic transformations (order matters!)

		// Handle initial letters
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
		word = word.replaceAll("C([EIY])", "S$1"); // CE, CI, CY -> SE, SI, SY
		word = word.replaceAll("C([AOU])", "K$1"); // CA, CO, CU -> KA, KO, KU
		word = word.replaceAll("CC", "K");
		word = word.replaceAll("CK", "K");
		word = word.replaceAll("C", "K");

		// Handle G variations
		word = word.replaceAll("G([EIY])", "J$1"); // GE, GI, GY -> JE, JI, JY
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

		// Remove silent final letters (common in French)
		word = word.replaceAll("E$", ""); // Silent final E
		word = word.replaceAll("S$", ""); // Silent final S
		word = word.replaceAll("T$", ""); // Silent final T
		word = word.replaceAll("X$", ""); // Silent final X
		word = word.replaceAll("Z$", ""); // Silent final Z
		word = word.replaceAll("D$", ""); // Silent final D
		word = word.replaceAll("P$", ""); // Silent final P

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