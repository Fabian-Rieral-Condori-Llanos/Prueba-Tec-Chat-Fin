package com.chat.module.auth.repository;

import com.chat.model.mongo.UserSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionMongoRepository extends MongoRepository<UserSession, String> {
    
    List<UserSession> findByUserId(Long userId);
    
    List<UserSession> findByUserIdAndIsActive(Long userId, Boolean isActive);
    
    Optional<UserSession> findByUserIdAndDeviceId(Long userId, String deviceId);
    
    void deleteByUserId(Long userId);
    
    void deleteByUserIdAndDeviceId(Long userId, String deviceId);
}