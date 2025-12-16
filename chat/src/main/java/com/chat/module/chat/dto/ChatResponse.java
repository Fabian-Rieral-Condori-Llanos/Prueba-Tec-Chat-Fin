package com.chat.module.chat.dto;

import com.chat.model.postgres.Chat;
import com.chat.model.postgres.ChatParticipant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private Long id;
    private String chatType;
    private String name;
    private String description;
    private String pictureUrl;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ParticipantInfo> participants;
    private MessageResponse lastMessage;
    private Long unreadCount;

    @Data
    @Builder
    public static class ParticipantInfo {
        private Long userId;
        private String username;
        private String profilePictureUrl;
        private String role;
        private Boolean isActive;
        private LocalDateTime joinedAt;
    }

    public static ChatResponse fromChat(Chat chat, List<ChatParticipant> participants) {
        return ChatResponse.builder()
                .id(chat.getId())
                .chatType(chat.getChatType().name())
                .name(chat.getName())
                .description(chat.getDescription())
                .pictureUrl(chat.getPictureUrl())
                .createdBy(chat.getCreatedBy() != null ? chat.getCreatedBy().getId() : null)
                .createdAt(chat.getCreatedAt())
                .updatedAt(chat.getUpdatedAt())
                .participants(participants.stream()
                        .map(p -> ParticipantInfo.builder()
                                .userId(p.getUser().getId())
                                .username(p.getUser().getUsername())
                                .profilePictureUrl(p.getUser().getProfilePictureUrl())
                                .role(p.getRole().name())
                                .isActive(p.getIsActive())
                                .joinedAt(p.getJoinedAt())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
