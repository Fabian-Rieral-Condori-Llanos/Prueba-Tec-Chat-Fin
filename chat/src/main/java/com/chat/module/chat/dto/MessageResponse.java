package com.chat.module.chat.dto;

import com.chat.model.mongo.Message;
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
public class MessageResponse {
    private String id;
    private Long chatId;
    private Long senderId;
    private String senderUsername;
    private String senderProfilePicture;
    private String content;
    private String messageType;
    private MessageMetadataInfo metadata;
    private String replyTo;
    private LocalDateTime sentAt;
    private LocalDateTime editedAt;
    private Boolean isDeleted;
    private List<ReactionInfo> reactions;
    private List<ReadReceiptInfo> readBy;
    private Boolean isRead;

    @Data
    @Builder
    public static class MessageMetadataInfo {
        private String fileName;
        private Long fileSize;
        private String mimeType;
        private Integer duration;
        private String thumbnailUrl;
    }

    @Data
    @Builder
    public static class ReactionInfo {
        private Long userId;
        private String username;
        private String emoji;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    public static class ReadReceiptInfo {
        private Long userId;
        private String username;
        private LocalDateTime readAt;
    }

    public static MessageResponse fromMessage(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .chatId(message.getChatId())
                .senderId(message.getSenderId())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .metadata(message.getMetadata() != null ? 
                    MessageMetadataInfo.builder()
                        .fileName(message.getMetadata().getFileName())
                        .fileSize(message.getMetadata().getFileSize())
                        .mimeType(message.getMetadata().getMimeType())
                        .duration(message.getMetadata().getDuration())
                        .thumbnailUrl(message.getMetadata().getThumbnailUrl())
                        .build() : null)
                .replyTo(message.getReplyTo())
                .sentAt(message.getSentAt())
                .editedAt(message.getEditedAt())
                .isDeleted(message.getDeletedAt() != null)
                .reactions(message.getReactions() != null ?
                    message.getReactions().stream()
                        .map(r -> ReactionInfo.builder()
                                .userId(r.getUserId())
                                .emoji(r.getEmoji())
                                .createdAt(r.getCreatedAt())
                                .build())
                        .collect(Collectors.toList()) : null)
                .readBy(message.getReadBy() != null ?
                    message.getReadBy().stream()
                        .map(rb -> ReadReceiptInfo.builder()
                                .userId(rb.getUserId())
                                .readAt(rb.getReadAt())
                                .build())
                        .collect(Collectors.toList()) : null)
                .build();
    }
}
