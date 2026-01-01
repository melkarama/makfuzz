package com.makfuzz.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;

@SpringBootApplication
@OpenAPIDefinition(
    info = @Info(
        title = "MakFuzz API",
        version = "1.0.0",
        description = "Fuzzy Matching Engine for Data Cleaning & Deduplication",
        contact = @Contact(name = "MakFuzz Team")
    )
)
public class MakFuzzApplication {

    public static void main(String[] args) {
        SpringApplication.run(MakFuzzApplication.class, args);
    }
}
