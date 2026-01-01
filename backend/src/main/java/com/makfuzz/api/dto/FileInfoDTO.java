package com.makfuzz.api.dto;

import lombok.Data;

import java.util.List;

@Data
public class FileInfoDTO {
    private String fileName;
    private String fileId;
    private List<String> headers;
    private int totalRows;
    private long fileSizeBytes;
}
