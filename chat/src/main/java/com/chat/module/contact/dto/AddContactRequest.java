package com.chat.module.contact.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddContactRequest {
    
    @NotBlank(message = "Username or email is required")
    private String usernameOrEmail;
    
    private String nickname;
}
