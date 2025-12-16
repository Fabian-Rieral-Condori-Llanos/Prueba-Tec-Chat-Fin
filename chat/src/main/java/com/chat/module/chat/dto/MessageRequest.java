package com.chat.module.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequest {
    
    @NotNull(message = "Chat ID is required")
    private Long chatId;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    private String messageType;
    
    private String replyTo;
    
    private FileMetadata metadata;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileMetadata {
        private String fileName;
        private Long fileSize;
        private String mimeType;
        private Integer duration;
        private String thumbnailUrl;
    }
}