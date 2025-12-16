package com.chat.module.auth.repository;

import com.chat.model.postgres.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByUsernameOrEmail(String username, String email);
    
    Boolean existsByUsername(String username);
    
    Boolean existsByEmail(String email);
    
    @Modifying
    @Query("UPDATE User u SET u.status = :status, u.lastSeen = :lastSeen WHERE u.id = :userId")
    void updateUserStatus(@Param("userId") Long userId, 
                        @Param("status") User.UserStatus status, 
                        @Param("lastSeen") LocalDateTime lastSeen);
    
    @Modifying
    @Query("UPDATE User u SET u.profilePictureUrl = :url WHERE u.id = :userId")
    void updateProfilePicture(@Param("userId") Long userId, @Param("url") String url);
}