package com.chat.module.chat.repository;

import com.chat.model.mongo.MessageAttachment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageAttachmentMongoRepository extends MongoRepository<MessageAttachment, String> {
    
    List<MessageAttachment> findByMessageId(String messageId);
    
    List<MessageAttachment> findByChatId(Long chatId);
    
    List<MessageAttachment> findByChatIdAndSenderId(Long chatId, Long senderId);
    
    List<MessageAttachment> findByMessageIdIn(List<String> messageIds);
}