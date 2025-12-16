package com.chat.module.contact.repository;

import com.chat.model.postgres.Contact;
import com.chat.model.postgres.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    
    List<Contact> findByUserId(Long userId);
    
    List<Contact> findByUserIdAndIsBlocked(Long userId, Boolean isBlocked);
    
    List<Contact> findByUserIdAndIsFavorite(Long userId, Boolean isFavorite);
    
    Optional<Contact> findByUserIdAndContactUserId(Long userId, Long contactUserId);
    
    Boolean existsByUserIdAndContactUserId(Long userId, Long contactUserId);
    
    @Query("SELECT c FROM Contact c WHERE c.user.id = :userId AND " +
           "(LOWER(c.nickname) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(c.contactUser.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Contact> searchContacts(@Param("userId") Long userId, @Param("searchTerm") String searchTerm);
}