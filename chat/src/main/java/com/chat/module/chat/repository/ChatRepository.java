package com.chat.module.chat.repository;

import com.chat.model.postgres.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    
    List<Chat> findByChatType(Chat.ChatType chatType);
    
    @Query("SELECT c FROM Chat c JOIN ChatParticipant cp ON c.id = cp.chat.id " +
           "WHERE cp.user.id = :userId AND cp.isActive = true " +
           "ORDER BY c.updatedAt DESC")
    List<Chat> findUserChats(@Param("userId") Long userId);
    
    @Query("SELECT c FROM Chat c JOIN ChatParticipant cp ON c.id = cp.chat.id " +
           "WHERE cp.user.id = :userId AND c.chatType = :chatType AND cp.isActive = true " +
           "ORDER BY c.updatedAt DESC")
    List<Chat> findUserChatsByType(@Param("userId") Long userId, @Param("chatType") Chat.ChatType chatType);
}