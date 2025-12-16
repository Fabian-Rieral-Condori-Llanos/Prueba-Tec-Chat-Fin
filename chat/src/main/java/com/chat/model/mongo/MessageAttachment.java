package com.chat.model.mongo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "message_attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageAttachment {
    
    @Id
    private String id;
    
    @Indexed
    private String messageId;
    
    @Indexed
    private Long chatId;
    
    private Long senderId;
    
    private String fileUrl;
    
    private String fileName;
    
    private Long fileSize;
    
    private String mimeType;
    
    private String thumbnailUrl;
    
    private LocalDateTime uploadedAt;
}
