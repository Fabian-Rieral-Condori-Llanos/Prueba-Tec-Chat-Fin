package com.chat.module.chat.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypingIndicatorRequest {
    
    @NotNull(message = "Chat ID is required")
    private Long chatId;
    
    @NotNull(message = "Is typing status is required")
    private Boolean isTyping;
}
