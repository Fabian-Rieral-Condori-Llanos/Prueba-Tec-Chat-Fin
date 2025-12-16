package com.chat.module.chat.repository;

import com.chat.model.postgres.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {
    
    List<ChatParticipant> findByChatIdAndIsActive(Long chatId, Boolean isActive);
    
    List<ChatParticipant> findByUserIdAndIsActive(Long userId, Boolean isActive);
    
    Optional<ChatParticipant> findByChatIdAndUserId(Long chatId, Long userId);
    
    Boolean existsByChatIdAndUserId(Long chatId, Long userId);
    
    @Query("SELECT COUNT(cp) FROM ChatParticipant cp WHERE cp.chat.id = :chatId AND cp.isActive = true")
    Long countActiveByChatId(@Param("chatId") Long chatId);
    
    @Modifying
    @Query("UPDATE ChatParticipant cp SET cp.isActive = false, cp.leftAt = CURRENT_TIMESTAMP " +
           "WHERE cp.chat.id = :chatId AND cp.user.id = :userId")
    void deactivateParticipant(@Param("chatId") Long chatId, @Param("userId") Long userId);
    
    @Query("SELECT cp FROM ChatParticipant cp WHERE cp.chat.id = :chatId AND cp.role = :role")
    List<ChatParticipant> findByChatIdAndRole(@Param("chatId") Long chatId, 
                                              @Param("role") ChatParticipant.ParticipantRole role);
}