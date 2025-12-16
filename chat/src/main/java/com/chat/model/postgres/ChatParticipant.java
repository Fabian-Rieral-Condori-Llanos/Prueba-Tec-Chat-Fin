package com.chat.model.postgres;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_participants",
    uniqueConstraints = @UniqueConstraint(columnNames = {"chat_id", "user_id"}),
    indexes = {
        @Index(name = "idx_chat_participants_chat", columnList = "chat_id"),
        @Index(name = "idx_chat_participants_user", columnList = "user_id")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatParticipant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ParticipantRole role = ParticipantRole.MEMBER;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "notifications_enabled")
    private Boolean notificationsEnabled = true;
    
    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;
    
    @Column(name = "left_at")
    private LocalDateTime leftAt;
    
    public enum ParticipantRole {
        ADMIN, MEMBER
    }
}
