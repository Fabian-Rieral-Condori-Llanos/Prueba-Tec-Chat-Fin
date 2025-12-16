package com.chat.module.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReadReceiptRequest {
    
    @NotNull(message = "Chat ID is required")
    private Long chatId;
    
    @NotNull(message = "Message IDs are required")
    private List<String> messageIds;
}
