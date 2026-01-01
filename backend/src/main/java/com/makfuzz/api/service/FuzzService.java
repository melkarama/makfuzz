package com.makfuzz.api.service;

import com.makfuzz.api.core.*;
import com.makfuzz.api.dto.*;
import org.apache.commons.io.FilenameUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FuzzService {

    private final FuzzEngine fuzzEngine = new FuzzEngine();
    private final Map<String, FileData> fileCache = new ConcurrentHashMap<>();

    public FileInfoDTO uploadFile(MultipartFile file) throws IOException {
        String fileId = UUID.randomUUID().toString();
        List<String[]> data = new ArrayList<>();
        List<String> headers = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine != null) {
                headers.addAll(Arrays.asList(parseCSVLine(headerLine)));
            }

            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.trim().isEmpty()) {
                    data.add(parseCSVLine(line));
                }
            }
        }

        FileData fileData = new FileData();
        fileData.setFileName(file.getOriginalFilename());
        fileData.setHeaders(headers);
        fileData.setData(data);
        fileData.setFileSize(file.getSize());

        fileCache.put(fileId, fileData);

        FileInfoDTO info = new FileInfoDTO();
        info.setFileId(fileId);
        info.setFileName(file.getOriginalFilename());
        info.setHeaders(headers);
        info.setTotalRows(data.size());
        info.setFileSizeBytes(file.getSize());

        return info;
    }

    public SearchResponseDTO search(String fileId, SearchRequestDTO request) {
        FileData fileData = fileCache.get(fileId);
        if (fileData == null) {
            throw new IllegalArgumentException("File not found. Please upload a file first.");
        }

        long startTime = System.currentTimeMillis();

        // Convert DTOs to core objects
        List<Criteria> criterias = request.getCriterias().stream()
                .map(dto -> new Criteria(
                        dto.getValue(),
                        dto.getSpellingWeight(),
                        dto.getPhoneticWeight(),
                        dto.getMinSpellingScore(),
                        dto.getMinPhoneticScore(),
                        dto.getMatchingType()
                ))
                .toList();

        SearchResult result = fuzzEngine.bestMatch(
                fileData.getData(),
                criterias,
                request.getSearchColumnIndexes(),
                request.getThreshold(),
                request.getTopN(),
                request.getLanguage()
        );

        long searchTime = System.currentTimeMillis() - startTime;

        // Convert to response DTO
        SearchResponseDTO response = new SearchResponseDTO();
        response.setTotalFound(result.getTotalFound());
        response.setTotalResults(result.getTotalResults());
        response.setMaxUnderThreshold(result.getMaxUnderThreshold());
        response.setMinAboveThreshold(result.getMinAboveThreshold());
        response.setMaxAboveThreshold(result.getMaxAboveThreshold());
        response.setSearchTimeMs(searchTime);

        List<MatchResultDTO> matchResults = new ArrayList<>();
        if (result.getResults() != null) {
            for (LineSimResult lsr : result.getResults()) {
                MatchResultDTO matchResult = new MatchResultDTO();
                matchResult.setTotalScore(lsr.getScore());
                matchResult.setCandidateValues(Arrays.asList(lsr.getCandidate()));

                List<CriteriaMatchDTO> criteriaMatches = new ArrayList<>();
                for (SimResult sr : lsr.getSimResults()) {
                    CriteriaMatchDTO cm = new CriteriaMatchDTO();
                    cm.setMatchedValue(sr.getValue());
                    cm.setSpellingScore(sr.getSpellingScore());
                    cm.setPhoneticScore(sr.getPhoneticScore());
                    cm.setScore(sr.getScore());
                    cm.setColumnIndex(sr.getColumnIndex());
                    criteriaMatches.add(cm);
                }
                matchResult.setCriteriaMatches(criteriaMatches);
                matchResults.add(matchResult);
            }
        }
        response.setResults(matchResults);

        return response;
    }

    public FileInfoDTO getFileInfo(String fileId) {
        FileData fileData = fileCache.get(fileId);
        if (fileData == null) {
            return null;
        }

        FileInfoDTO info = new FileInfoDTO();
        info.setFileId(fileId);
        info.setFileName(fileData.getFileName());
        info.setHeaders(fileData.getHeaders());
        info.setTotalRows(fileData.getData().size());
        info.setFileSizeBytes(fileData.getFileSize());

        return info;
    }

    public void deleteFile(String fileId) {
        fileCache.remove(fileId);
    }

    public byte[] exportToCSV(String fileId, SearchRequestDTO request) throws IOException {
        SearchResponseDTO searchResponse = search(fileId, request);
        FileData fileData = fileCache.get(fileId);

        StringBuilder sb = new StringBuilder();
        
        // Header
        sb.append("Score");
        for (int i = 0; i < request.getCriterias().size(); i++) {
            sb.append(",Criteria_").append(i + 1).append("_Match");
            sb.append(",Spelling_%");
            sb.append(",Phonetic_%");
        }
        for (String header : fileData.getHeaders()) {
            sb.append(",").append(escapeCSV(header));
        }
        sb.append("\n");

        // Data rows
        for (MatchResultDTO match : searchResponse.getResults()) {
            sb.append(String.format("%.4f", match.getTotalScore()));
            for (CriteriaMatchDTO cm : match.getCriteriaMatches()) {
                sb.append(",").append(escapeCSV(cm.getMatchedValue() != null ? cm.getMatchedValue() : ""));
                sb.append(",").append(String.format("%.2f%%", cm.getSpellingScore() * 100));
                sb.append(",").append(String.format("%.2f%%", cm.getPhoneticScore() * 100));
            }
            for (String val : match.getCandidateValues()) {
                sb.append(",").append(escapeCSV(val != null ? val : ""));
            }
            sb.append("\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCSV(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private String[] parseCSVLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        char separator = line.contains(";") ? ';' : ',';

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == separator && !inQuotes) {
                result.add(current.toString().trim());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        result.add(current.toString().trim());

        return result.toArray(new String[0]);
    }

    private static class FileData {
        private String fileName;
        private List<String> headers;
        private List<String[]> data;
        private long fileSize;

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        public List<String> getHeaders() { return headers; }
        public void setHeaders(List<String> headers) { this.headers = headers; }
        public List<String[]> getData() { return data; }
        public void setData(List<String[]> data) { this.data = data; }
        public long getFileSize() { return fileSize; }
        public void setFileSize(long fileSize) { this.fileSize = fileSize; }
    }
}
