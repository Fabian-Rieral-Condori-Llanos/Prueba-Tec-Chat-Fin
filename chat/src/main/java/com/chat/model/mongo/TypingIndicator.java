package com.chat.model.mongo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "typing_indicators")
@CompoundIndex(name = "chat_user_idx", def = "{'chatId': 1, 'userId': 1}", unique = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypingIndicator {
    
    @Id
    private String id;
    
    @Indexed
    private Long chatId;
    
    @Indexed
    private Long userId;
    
    private Boolean isTyping;
    
    @Indexed(expireAfterSeconds = 10)
    private LocalDateTime timestamp;
}
