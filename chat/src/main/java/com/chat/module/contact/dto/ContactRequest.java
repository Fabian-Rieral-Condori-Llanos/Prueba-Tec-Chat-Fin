package com.chat.module.contact.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactRequest {
    
    @NotNull(message = "Contact user ID is required")
    private Long contactUserId;
    
    private String nickname;
}