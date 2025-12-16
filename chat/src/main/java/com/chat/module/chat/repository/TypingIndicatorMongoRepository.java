package com.chat.module.chat.repository;

import com.chat.model.mongo.TypingIndicator;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TypingIndicatorMongoRepository extends MongoRepository<TypingIndicator, String> {
    
    List<TypingIndicator> findByChatIdAndIsTyping(Long chatId, Boolean isTyping);
    
    Optional<TypingIndicator> findByChatIdAndUserId(Long chatId, Long userId);
    
    void deleteByChatIdAndUserId(Long chatId, Long userId);
}