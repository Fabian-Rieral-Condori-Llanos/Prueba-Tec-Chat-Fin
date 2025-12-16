package com.chat.module.chat.repository;

import com.chat.model.postgres.MessageMetadata;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessageMetadataRepository extends JpaRepository<MessageMetadata, Long> {
    
    Optional<MessageMetadata> findByMessageMongoId(String messageMongoId);
    
    Page<MessageMetadata> findByChatIdAndIsDeletedOrderBySentAtDesc(
        Long chatId, Boolean isDeleted, Pageable pageable);
    
    List<MessageMetadata> findByChatIdAndIsDeletedOrderBySentAtDesc(Long chatId, Boolean isDeleted);
    
    @Query("SELECT mm FROM MessageMetadata mm WHERE mm.chat.id = :chatId " +
           "AND mm.sentAt >= :startDate AND mm.sentAt <= :endDate " +
           "AND mm.isDeleted = false ORDER BY mm.sentAt DESC")
    List<MessageMetadata> findMessagesByDateRange(
        @Param("chatId") Long chatId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(mm) FROM MessageMetadata mm WHERE mm.chat.id = :chatId AND mm.isDeleted = false")
    Long countByChatId(@Param("chatId") Long chatId);
    
    List<MessageMetadata> findBySenderIdAndMessageType(Long senderId, MessageMetadata.MessageType messageType);
}