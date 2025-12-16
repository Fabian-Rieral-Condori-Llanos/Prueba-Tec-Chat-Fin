package com.chat.module.contact.dto;

import com.chat.model.postgres.Contact;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactResponse {
    private Long id;
    private Long userId;
    private Long contactUserId;
    private String contactUsername;
    private String contactEmail;
    private String contactPhoneNumber;
    private String contactProfilePictureUrl;
    private String contactStatus;
    private LocalDateTime contactLastSeen;
    private String nickname;
    private Boolean isBlocked;
    private Boolean isFavorite;
    private LocalDateTime createdAt;

    public static ContactResponse fromContact(Contact contact) {
        return ContactResponse.builder()
                .id(contact.getId())
                .userId(contact.getUser().getId())
                .contactUserId(contact.getContactUser().getId())
                .contactUsername(contact.getContactUser().getUsername())
                .contactEmail(contact.getContactUser().getEmail())
                .contactPhoneNumber(contact.getContactUser().getPhoneNumber())
                .contactProfilePictureUrl(contact.getContactUser().getProfilePictureUrl())
                .contactStatus(contact.getContactUser().getStatus().name())
                .contactLastSeen(contact.getContactUser().getLastSeen())
                .nickname(contact.getNickname())
                .isBlocked(contact.getIsBlocked())
                .isFavorite(contact.getIsFavorite())
                .createdAt(contact.getCreatedAt())
                .build();
    }
}