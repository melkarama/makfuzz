package com.makfuzz.api.controller;

import com.makfuzz.api.dto.*;
import com.makfuzz.api.service.FuzzService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/fuzz")
@Tag(name = "Fuzzy Matching", description = "Fuzzy matching operations for data cleaning and deduplication")
public class FuzzController {

    private final FuzzService fuzzService;

    public FuzzController(FuzzService fuzzService) {
        this.fuzzService = fuzzService;
    }

    @PostMapping("/upload")
    @Operation(summary = "Upload CSV file", description = "Upload a CSV file for fuzzy matching. Returns file info including headers.")
    public ResponseEntity<FileInfoDTO> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            FileInfoDTO info = fuzzService.uploadFile(file);
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/file/{fileId}")
    @Operation(summary = "Get file info", description = "Get information about an uploaded file")
    public ResponseEntity<FileInfoDTO> getFileInfo(@PathVariable String fileId) {
        FileInfoDTO info = fuzzService.getFileInfo(fileId);
        if (info == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(info);
    }

    @DeleteMapping("/file/{fileId}")
    @Operation(summary = "Delete file", description = "Delete an uploaded file from cache")
    public ResponseEntity<Void> deleteFile(@PathVariable String fileId) {
        fuzzService.deleteFile(fileId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/search/{fileId}")
    @Operation(summary = "Search for matches", description = "Perform fuzzy matching search on the uploaded file")
    public ResponseEntity<SearchResponseDTO> search(
            @PathVariable String fileId,
            @Valid @RequestBody SearchRequestDTO request) {
        try {
            SearchResponseDTO response = fuzzService.search(fileId, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/export/{fileId}/csv")
    @Operation(summary = "Export results to CSV", description = "Export search results as a CSV file")
    public ResponseEntity<byte[]> exportCSV(
            @PathVariable String fileId,
            @Valid @RequestBody SearchRequestDTO request) {
        try {
            byte[] csvData = fuzzService.exportToCSV(fileId, request);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"makfuzz_results.csv\"")
                    .body(csvData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/export/{fileId}/excel")
    @Operation(summary = "Export results to Excel", description = "Export search results as an Excel file")
    public ResponseEntity<byte[]> exportExcel(
            @PathVariable String fileId,
            @Valid @RequestBody SearchRequestDTO request) {
        try {
            byte[] excelData = fuzzService.exportToExcel(fileId, request);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"makfuzz_results.xlsx\"")
                    .body(excelData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if the API is running")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("MakFuzz API is running!");
    }
}
