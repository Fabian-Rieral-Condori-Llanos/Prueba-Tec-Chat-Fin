package com.chat.model.mongo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "messages")
@CompoundIndex(name = "chat_sent_idx", def = "{'chatId': 1, 'sentAt': -1}")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    
    @Id
    private String id;
    
    @Indexed
    private Long chatId;
    
    @Indexed
    private Long senderId;
    
    private String content;
    
    private String messageType;
    
    private MessageMetadata metadata;
    
    private String replyTo;
    
    private LocalDateTime sentAt;
    
    private LocalDateTime editedAt;
    
    private LocalDateTime deletedAt;
    
    private List<Reaction> reactions = new ArrayList<>();
    
    private List<ReadReceipt> readBy = new ArrayList<>();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageMetadata {
        private String fileName;
        private Long fileSize;
        private String mimeType;
        private Integer duration;
        private String thumbnailUrl;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Reaction {
        private Long userId;
        private String emoji;
        private LocalDateTime createdAt;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReadReceipt {
        private Long userId;
        private LocalDateTime readAt;
    }
}
