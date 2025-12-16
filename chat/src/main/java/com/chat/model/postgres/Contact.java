package com.chat.model.postgres;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "contacts",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "contact_user_id"}),
    indexes = {
        @Index(name = "idx_contacts_user", columnList = "user_id"),
        @Index(name = "idx_contacts_contact_user", columnList = "contact_user_id")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contact {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_user_id", nullable = false)
    private User contactUser;
    
    @Column(length = 100)
    private String nickname;
    
    @Column(name = "is_blocked")
    private Boolean isBlocked = false;
    
    @Column(name = "is_favorite")
    private Boolean isFavorite = false;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}