package com.chat.module.contact.controller;

import com.chat.module.auth.dto.UserResponse;
import com.chat.module.auth.service.UserService;
import com.chat.module.contact.dto.AddContactRequest;
import com.chat.module.contact.dto.ContactRequest;
import com.chat.module.contact.dto.ContactResponse;
import com.chat.module.contact.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ContactController {

    private final ContactService contactService;
    private final UserService userService;

    /**
     * Obtiene el ID del usuario autenticado
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserResponse user = userService.getUserByUsername(username);
        return user.getId();
    }

    /**
     * Agrega un nuevo contacto por ID
     * POST /api/contacts
     */
    @PostMapping
    public ResponseEntity<ContactResponse> addContact(@Valid @RequestBody ContactRequest request) {
        Long userId = getCurrentUserId();
        log.info("Add contact request from user: {}", userId);
        
        ContactResponse response = contactService.addContact(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Agrega un nuevo contacto por username o email
     * POST /api/contacts/add-by-username
     */
    @PostMapping("/add-by-username")
    public ResponseEntity<ContactResponse> addContactByUsername(
            @Valid @RequestBody AddContactRequest request) {
        Long userId = getCurrentUserId();
        log.info("Add contact by username request from user: {}", userId);
        
        ContactResponse response = contactService.addContactByUsernameOrEmail(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Obtiene todos los contactos del usuario
     * GET /api/contacts
     */
    @GetMapping
    public ResponseEntity<List<ContactResponse>> getAllContacts() {
        Long userId = getCurrentUserId();
        log.info("Get all contacts request from user: {}", userId);
        
        List<ContactResponse> contacts = contactService.getAllContacts(userId);
        return ResponseEntity.ok(contacts);
    }

    /**
     * Obtiene un contacto específico
     * GET /api/contacts/{contactId}
     */
    @GetMapping("/{contactId}")
    public ResponseEntity<ContactResponse> getContact(@PathVariable Long contactId) {
        Long userId = getCurrentUserId();
        log.info("Get contact {} request from user: {}", contactId, userId);
        
        ContactResponse response = contactService.getContact(userId, contactId);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene contactos bloqueados
     * GET /api/contacts/blocked
     */
    @GetMapping("/blocked")
    public ResponseEntity<List<ContactResponse>> getBlockedContacts() {
        Long userId = getCurrentUserId();
        log.info("Get blocked contacts request from user: {}", userId);
        
        List<ContactResponse> contacts = contactService.getBlockedContacts(userId);
        return ResponseEntity.ok(contacts);
    }

    /**
     * Obtiene contactos favoritos
     * GET /api/contacts/favorites
     */
    @GetMapping("/favorites")
    public ResponseEntity<List<ContactResponse>> getFavoriteContacts() {
        Long userId = getCurrentUserId();
        log.info("Get favorite contacts request from user: {}", userId);
        
        List<ContactResponse> contacts = contactService.getFavoriteContacts(userId);
        return ResponseEntity.ok(contacts);
    }

    /**
     * Busca contactos
     * GET /api/contacts/search?q=searchTerm
     */
    @GetMapping("/search")
    public ResponseEntity<List<ContactResponse>> searchContacts(@RequestParam String q) {
        Long userId = getCurrentUserId();
        log.info("Search contacts request from user: {} with term: {}", userId, q);
        
        List<ContactResponse> contacts = contactService.searchContacts(userId, q);
        return ResponseEntity.ok(contacts);
    }

    /**
     * Actualiza el nickname de un contacto
     * PATCH /api/contacts/{contactId}/nickname
     */
    @PatchMapping("/{contactId}/nickname")
    public ResponseEntity<ContactResponse> updateNickname(
            @PathVariable Long contactId,
            @RequestParam String nickname) {
        Long userId = getCurrentUserId();
        log.info("Update nickname request for contact: {} from user: {}", contactId, userId);
        
        ContactResponse response = contactService.updateNickname(userId, contactId, nickname);
        return ResponseEntity.ok(response);
    }

    /**
     * Bloquea un contacto
     * POST /api/contacts/{contactId}/block
     */
    @PostMapping("/{contactId}/block")
    public ResponseEntity<ContactResponse> blockContact(@PathVariable Long contactId) {
        Long userId = getCurrentUserId();
        log.info("Block contact request for contact: {} from user: {}", contactId, userId);
        
        ContactResponse response = contactService.blockContact(userId, contactId);
        return ResponseEntity.ok(response);
    }

    /**
     * Desbloquea un contacto
     * POST /api/contacts/{contactId}/unblock
     */
    @PostMapping("/{contactId}/unblock")
    public ResponseEntity<ContactResponse> unblockContact(@PathVariable Long contactId) {
        Long userId = getCurrentUserId();
        log.info("Unblock contact request for contact: {} from user: {}", contactId, userId);
        
        ContactResponse response = contactService.unblockContact(userId, contactId);
        return ResponseEntity.ok(response);
    }

    /**
     * Marca un contacto como favorito
     * POST /api/contacts/{contactId}/favorite
     */
    @PostMapping("/{contactId}/favorite")
    public ResponseEntity<ContactResponse> markAsFavorite(@PathVariable Long contactId) {
        Long userId = getCurrentUserId();
        log.info("Mark as favorite request for contact: {} from user: {}", contactId, userId);
        
        ContactResponse response = contactService.markAsFavorite(userId, contactId);
        return ResponseEntity.ok(response);
    }

    /**
     * Desmarca un contacto como favorito
     * DELETE /api/contacts/{contactId}/favorite
     */
    @DeleteMapping("/{contactId}/favorite")
    public ResponseEntity<ContactResponse> unmarkAsFavorite(@PathVariable Long contactId) {
        Long userId = getCurrentUserId();
        log.info("Unmark as favorite request for contact: {} from user: {}", contactId, userId);
        
        ContactResponse response = contactService.unmarkAsFavorite(userId, contactId);
        return ResponseEntity.ok(response);
    }

    /**
     * Elimina un contacto
     * DELETE /api/contacts/{contactId}
     */
    @DeleteMapping("/{contactId}")
    public ResponseEntity<Map<String, String>> deleteContact(@PathVariable Long contactId) {
        Long userId = getCurrentUserId();
        log.info("Delete contact request for contact: {} from user: {}", contactId, userId);
        
        contactService.deleteContact(userId, contactId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Contact deleted successfully");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Verifica si dos usuarios son contactos
     * GET /api/contacts/check/{contactUserId}
     */
    @GetMapping("/check/{contactUserId}")
    public ResponseEntity<Map<String, Boolean>> checkContact(@PathVariable Long contactUserId) {
        Long userId = getCurrentUserId();
        log.info("Check contact request from user: {} for contact: {}", userId, contactUserId);
        
        boolean areContacts = contactService.areContacts(userId, contactUserId);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("areContacts", areContacts);
        
        return ResponseEntity.ok(response);
    }
}