export interface FileInfo {
    fileId: string;
    fileName: string;
    headers: string[];
    totalRows: number;
    fileSizeBytes: number;
}

export interface CriteriaInput {
    value: string;
    spellingWeight: number;
    phoneticWeight: number;
    minSpellingScore: number;
    minPhoneticScore: number;
    matchingType: 'SIMILARITY' | 'EXACT' | 'REGEX';
}

export interface SearchState {
    criterias: CriteriaInput[];
    searchColumnIndexes: number[];
    threshold: number;
    topN: number;
    language: 'en' | 'fr';
}

export interface CriteriaMatch {
    matchedValue: string | null;
    spellingScore: number;
    phoneticScore: number;
    score: number;
    columnIndex: number;
}

export interface MatchResult {
    totalScore: number;
    lineIndex: number;
    candidateValues: string[];
    rawLine?: string;
    criteriaMatches: CriteriaMatch[];
}

export interface SearchResponse {
    results: MatchResult[];
    totalFound: number;
    totalResults: number;
    maxUnderThreshold: number;
    minAboveThreshold: number;
    maxAboveThreshold: number;
    searchTimeMs: number;
}
