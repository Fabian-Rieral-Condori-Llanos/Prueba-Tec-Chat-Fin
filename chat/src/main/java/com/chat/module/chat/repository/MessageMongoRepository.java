package com.chat.module.chat.repository;

import com.chat.model.mongo.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageMongoRepository extends MongoRepository<Message, String> {
    
    Page<Message> findByChatIdAndDeletedAtIsNullOrderBySentAtDesc(Long chatId, Pageable pageable);
    
    List<Message> findByChatIdAndDeletedAtIsNullOrderBySentAtDesc(Long chatId);
    
    @Query("{ 'chatId': ?0, 'content': { $regex: ?1, $options: 'i' }, 'deletedAt': null }")
    List<Message> searchMessagesByContent(Long chatId, String searchTerm);
    
    List<Message> findByChatIdAndSenderIdAndDeletedAtIsNull(Long chatId, Long senderId);
    
    @Query("{ 'chatId': ?0, 'sentAt': { $gte: ?1, $lte: ?2 }, 'deletedAt': null }")
    List<Message> findMessagesByDateRange(Long chatId, LocalDateTime startDate, LocalDateTime endDate);
    
    Long countByChatIdAndDeletedAtIsNull(Long chatId);
    
    @Query("{ 'chatId': ?0, 'readBy.userId': { $ne: ?1 }, 'senderId': { $ne: ?1 }, 'deletedAt': null }")
    List<Message> findUnreadMessages(Long chatId, Long userId);
}