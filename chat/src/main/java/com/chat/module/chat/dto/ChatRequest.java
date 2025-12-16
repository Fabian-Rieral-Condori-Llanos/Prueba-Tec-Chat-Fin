package com.chat.module.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    
    @NotBlank(message = "Chat type is required")
    private String chatType;
    
    @NotNull(message = "Participant IDs are required")
    @Size(min = 1, message = "At least one participant is required")
    private List<Long> participantIds;
    
    private String name;
    private String description;
    private String pictureUrl;
}