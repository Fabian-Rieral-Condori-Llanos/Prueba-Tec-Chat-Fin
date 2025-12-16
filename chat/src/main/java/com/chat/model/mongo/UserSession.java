package com.chat.model.mongo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "user_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSession {
    
    @Id
    private String id;
    
    @Indexed
    private Long userId;
    
    private String deviceId;
    
    private String deviceType;
    
    private String fcmToken;
    
    @Indexed(expireAfterSeconds = 2592000)
    private LocalDateTime lastActivity;
    
    private String ipAddress;
    
    private String userAgent;
    
    private Boolean isActive;
}
