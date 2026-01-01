package com.makfuzz.api.service;

import com.makfuzz.api.core.*;
import com.makfuzz.api.dto.*;
import org.apache.commons.io.FilenameUtils;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
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

        FileData fileData = new FileData();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine != null) {
                headers.addAll(Arrays.asList(parseCSVLine(headerLine)));
            }

            String line;
            List<String> rawLines = new ArrayList<>();
            while ((line = reader.readLine()) != null) {
                if (!line.trim().isEmpty()) {
                    data.add(parseCSVLine(line));
                    rawLines.add(line);
                }
            }
            fileData.setRawLines(rawLines);
        }

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
        long startTime = System.currentTimeMillis();
        SearchResult result = performSearch(fileId, request);
        FileData fileData = fileCache.get(fileId);
        SearchResponseDTO response = convertToResponseDTO(result, request.getTopN(), fileData);
        response.setSearchTimeMs(System.currentTimeMillis() - startTime);
        return response;
    }

    private SearchResult performSearch(String fileId, SearchRequestDTO request) {
        FileData fileData = fileCache.get(fileId);
        if (fileData == null) {
            throw new IllegalArgumentException("File not found. Please upload a file first.");
        }

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

        return fuzzEngine.bestMatch(
                fileData.getData(),
                criterias,
                request.getSearchColumnIndexes(),
                request.getThreshold(),
                request.getTopN(),
                request.getLanguage()
        );
    }

    private SearchResponseDTO convertToResponseDTO(SearchResult result, int topN, FileData fileData) {
        long startTime = System.currentTimeMillis();
        // Convert to response DTO
        SearchResponseDTO response = new SearchResponseDTO();
        response.setTotalFound(result.getTotalFound());
        response.setTotalResults(result.getTotalResults());
        response.setMaxUnderThreshold(result.getMaxUnderThreshold());
        response.setMinAboveThreshold(result.getMinAboveThreshold());
        response.setMaxAboveThreshold(result.getMaxAboveThreshold());
        response.setSearchTimeMs(0); // This will be set by the caller if needed

        List<MatchResultDTO> matchResults = new ArrayList<>();
        List<LineSimResult> matchesToExport = result.getResults(); // This is already limited by topN in fuzzEngine

        if (matchesToExport != null) {
            for (LineSimResult lsr : matchesToExport) {
                matchResults.add(convertToMatchResultDTO(lsr, fileData));
            }
        }
        response.setResults(matchResults);
        return response;
    }

    private MatchResultDTO convertToMatchResultDTO(LineSimResult lsr, FileData fileData) {
        MatchResultDTO matchResult = new MatchResultDTO();
        matchResult.setTotalScore(lsr.getScore());
        matchResult.setLineIndex(lsr.getLineIndex());
        matchResult.setCandidateValues(Arrays.asList(lsr.getCandidate()));
        
        if (fileData != null && fileData.getRawLines() != null && lsr.getLineIndex() > 0 && lsr.getLineIndex() <= fileData.getRawLines().size()) {
            matchResult.setRawLine(fileData.getRawLines().get(lsr.getLineIndex() - 1));
        }

        List<CriteriaMatchDTO> criteriaMatches = new ArrayList<>();
        for (SimResult sr : lsr.getSimResults()) {
            CriteriaMatchDTO cm = new CriteriaMatchDTO();
            cm.setMatchedValue(sr.getValue() != null ? sr.getValue() : "");
            cm.setSpellingScore(sr.getSpellingScore());
            cm.setPhoneticScore(sr.getPhoneticScore());
            cm.setScore(sr.getScore());
            cm.setColumnIndex(sr.getColumnIndex());
            criteriaMatches.add(cm);
        }
        matchResult.setCriteriaMatches(criteriaMatches);
        return matchResult;
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
        SearchResult searchResult = performSearch(fileId, request);
        FileData fileData = fileCache.get(fileId);

        StringBuilder sb = new StringBuilder();
        
        // Header
        sb.append("Row #,Score");
        for (int i = 0; i < request.getCriterias().size(); i++) {
            sb.append(",Criteria_").append(i + 1).append("_Match");
            sb.append(",Spelling_%");
            sb.append(",Phonetic_%");
        }
        for (String header : fileData.getHeaders()) {
            sb.append(",").append(escapeCSV(header));
        }
        sb.append("\n");

        // Data rows (using ALL found results)
        for (LineSimResult lsr : searchResult.getAllFoundResults()) {
            MatchResultDTO match = convertToMatchResultDTO(lsr, fileData);
            sb.append(match.getLineIndex()).append(",");
            sb.append(String.format("%.4f", match.getTotalScore()));
            for (CriteriaMatchDTO cm : match.getCriteriaMatches()) {
                sb.append(",").append(escapeCSV(cm.getMatchedValue()));
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

    public byte[] exportToExcel(String fileId, SearchRequestDTO request) throws IOException {
        SearchResult searchResult = performSearch(fileId, request);
        FileData fileData = fileCache.get(fileId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Match Results");

            // Style: Synthesis Header (Royal Blue)
            CellStyle synthesisStyle = workbook.createCellStyle();
            synthesisStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
            synthesisStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font synthesisFont = workbook.createFont();
            synthesisFont.setBold(true);
            synthesisFont.setColor(IndexedColors.WHITE.getIndex());
            synthesisStyle.setFont(synthesisFont);

            // Style: Original Header (Light Grey)
            CellStyle originalStyle = workbook.createCellStyle();
            originalStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            originalStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font originalFont = workbook.createFont();
            originalFont.setBold(true);
            originalStyle.setFont(originalFont);

            // Create Header Row
            Row headerRow = sheet.createRow(0);
            int colIdx = 0;
            
            // Synthesis Columns
            headerRow.createCell(colIdx++).setCellValue("Row #");
            headerRow.createCell(colIdx++).setCellValue("Score");
            for (int i = 0; i < request.getCriterias().size(); i++) {
                headerRow.createCell(colIdx++).setCellValue("Criteria " + (i + 1) + " Match");
                headerRow.createCell(colIdx++).setCellValue("Spelling %");
                headerRow.createCell(colIdx++).setCellValue("Phonetic %");
            }
            int synthesisColCount = colIdx;

            // Original Columns
            for (String header : fileData.getHeaders()) {
                headerRow.createCell(colIdx++).setCellValue(header);
            }

            // Apply specific styles to headers
            for (int i = 0; i < colIdx; i++) {
                if (i < synthesisColCount) {
                    headerRow.getCell(i).setCellStyle(synthesisStyle);
                } else {
                    headerRow.getCell(i).setCellStyle(originalStyle);
                }
            }

            // Style: Percentage Formatting (XX.XX%)
            CellStyle percentStyle = workbook.createCellStyle();
            percentStyle.setDataFormat(workbook.createDataFormat().getFormat("0.00%"));

            // Style: Regular Number (No % for total score if preferred, or use same)
            // Total score is usually 0-1, so percentage is also appropriate

            // Frozen Panes: Freeze synthesis columns
            sheet.createFreezePane(synthesisColCount, 1);

            // Data Rows
            int rowIdx = 1;
            for (LineSimResult lsr : searchResult.getAllFoundResults()) {
                MatchResultDTO match = convertToMatchResultDTO(lsr, fileData);
                Row row = sheet.createRow(rowIdx++);
                int cIdx = 0;
                
                // Line Index Cell
                row.createCell(cIdx++).setCellValue(match.getLineIndex());

                // Total Score Cell
                Cell totalScoreCell = row.createCell(cIdx++);
                totalScoreCell.setCellValue(match.getTotalScore());
                totalScoreCell.setCellStyle(percentStyle);

                for (CriteriaMatchDTO cm : match.getCriteriaMatches()) {
                    row.createCell(cIdx++).setCellValue(cm.getMatchedValue() != null ? cm.getMatchedValue() : "");
                    
                    // Spelling Score Cell
                    Cell spellCell = row.createCell(cIdx++);
                    spellCell.setCellValue(cm.getSpellingScore());
                    spellCell.setCellStyle(percentStyle);

                    // Phonetic Score Cell
                    Cell phonCell = row.createCell(cIdx++);
                    phonCell.setCellValue(cm.getPhoneticScore());
                    phonCell.setCellStyle(percentStyle);
                }
                for (String val : match.getCandidateValues()) {
                    row.createCell(cIdx++).setCellValue(val != null ? val : "");
                }
                if (rowIdx >= 1048575) break;
            }

            // Auto-filter for all columns
            if (colIdx > 0 && rowIdx > 1) {
                sheet.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(0, rowIdx - 1, 0, colIdx - 1));
            }

            // Auto-size all columns
            for (int i = 0; i < colIdx; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
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
        private List<String> rawLines;
        private long fileSize;

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        public List<String> getHeaders() { return headers; }
        public void setHeaders(List<String> headers) { this.headers = headers; }
        public List<String[]> getData() { return data; }
        public void setData(List<String[]> data) { this.data = data; }
        public List<String> getRawLines() { return rawLines; }
        public void setRawLines(List<String> rawLines) { this.rawLines = rawLines; }
        public long getFileSize() { return fileSize; }
        public void setFileSize(long fileSize) { this.fileSize = fileSize; }
    }
}
