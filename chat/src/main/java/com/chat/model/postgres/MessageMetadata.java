package com.chat.model.postgres;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "message_metadata",
    indexes = {
        @Index(name = "idx_message_metadata_chat", columnList = "chat_id"),
        @Index(name = "idx_message_metadata_sender", columnList = "sender_id"),
        @Index(name = "idx_message_metadata_mongo_id", columnList = "message_mongo_id")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageMetadata {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @Column(name = "message_mongo_id", nullable = false, length = 50)
    private String messageMongoId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", length = 20)
    private MessageType messageType = MessageType.TEXT;
    
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
    
    @CreationTimestamp
    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;
    
    public enum MessageType {
        TEXT, IMAGE, VIDEO, AUDIO, FILE
    }
}