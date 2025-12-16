package com.chat.module.chat.controller;

import com.chat.module.auth.dto.UserResponse;
import com.chat.module.auth.service.UserService;
import com.chat.module.chat.dto.MessageRequest;
import com.chat.module.chat.dto.MessageResponse;
import com.chat.module.chat.dto.ReadReceiptRequest;
import com.chat.module.chat.dto.ReactionRequest;
import com.chat.module.chat.service.MessageService;
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
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class MessageController {

    private final MessageService messageService;
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
     * Envía un mensaje
     * POST /api/messages
     */
    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(@Valid @RequestBody MessageRequest request) {
        Long userId = getCurrentUserId();
        log.info("Send message request from user: {} to chat: {}", userId, request.getChatId());

        MessageResponse response = messageService.sendMessage(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Obtiene mensajes de un chat con paginación
     * GET /api/messages/chat/{chatId}?page=0&size=50
     */
    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<MessageResponse>> getChatMessages(
            @PathVariable Long chatId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Long userId = getCurrentUserId();
        log.info("Get messages request from user: {} for chat: {}, page: {}, size: {}", 
                userId, chatId, page, size);

        List<MessageResponse> messages = messageService.getChatMessages(userId, chatId, page, size);
        return ResponseEntity.ok(messages);
    }

    /**
     * Obtiene un mensaje específico
     * GET /api/messages/{messageId}
     */
    @GetMapping("/{messageId}")
    public ResponseEntity<MessageResponse> getMessageById(@PathVariable String messageId) {
        Long userId = getCurrentUserId();
        log.info("Get message {} request from user: {}", messageId, userId);

        MessageResponse response = messageService.getMessageById(userId, messageId);
        return ResponseEntity.ok(response);
    }

    /**
     * Edita un mensaje
     * PUT /api/messages/{messageId}
     */
    @PutMapping("/{messageId}")
    public ResponseEntity<MessageResponse> editMessage(
            @PathVariable String messageId,
            @RequestBody Map<String, String> request) {
        Long userId = getCurrentUserId();
        log.info("Edit message {} request from user: {}", messageId, userId);

        String newContent = request.get("content");
        if (newContent == null || newContent.trim().isEmpty()) {
            throw new RuntimeException("Content is required");
        }

        MessageResponse response = messageService.editMessage(userId, messageId, newContent);
        return ResponseEntity.ok(response);
    }

    /**
     * Elimina un mensaje
     * DELETE /api/messages/{messageId}
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<Map<String, String>> deleteMessage(@PathVariable String messageId) {
        Long userId = getCurrentUserId();
        log.info("Delete message {} request from user: {}", messageId, userId);

        messageService.deleteMessage(userId, messageId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Message deleted successfully");

        return ResponseEntity.ok(response);
    }

    /**
     * Marca mensajes como leídos
     * POST /api/messages/read
     */
    @PostMapping("/read")
    public ResponseEntity<Map<String, String>> markMessagesAsRead(
            @Valid @RequestBody ReadReceiptRequest request) {
        Long userId = getCurrentUserId();
        log.info("Mark messages as read request from user: {} for chat: {}", userId, request.getChatId());

        messageService.markMessagesAsRead(userId, request);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Messages marked as read");

        return ResponseEntity.ok(response);
    }

    /**
     * Agrega una reacción a un mensaje
     * POST /api/messages/{messageId}/reactions
     */
    @PostMapping("/{messageId}/reactions")
    public ResponseEntity<MessageResponse> addReaction(
            @PathVariable String messageId,
            @Valid @RequestBody ReactionRequest request) {
        Long userId = getCurrentUserId();
        log.info("Add reaction to message {} request from user: {}", messageId, userId);

        MessageResponse response = messageService.addReaction(userId, messageId, request.getEmoji());
        return ResponseEntity.ok(response);
    }

    /**
     * Elimina una reacción de un mensaje
     * DELETE /api/messages/{messageId}/reactions
     */
    @DeleteMapping("/{messageId}/reactions")
    public ResponseEntity<MessageResponse> removeReaction(
            @PathVariable String messageId,
            @RequestParam String emoji) {
        Long userId = getCurrentUserId();
        log.info("Remove reaction from message {} request from user: {}", messageId, userId);

        MessageResponse response = messageService.removeReaction(userId, messageId, emoji);
        return ResponseEntity.ok(response);
    }

    /**
     * Busca mensajes en un chat
     * GET /api/messages/chat/{chatId}/search?q=searchTerm
     */
    @GetMapping("/chat/{chatId}/search")
    public ResponseEntity<List<MessageResponse>> searchMessages(
            @PathVariable Long chatId,
            @RequestParam String q) {
        Long userId = getCurrentUserId();
        log.info("Search messages in chat {} request from user: {} with term: {}", chatId, userId, q);

        List<MessageResponse> messages = messageService.searchMessages(userId, chatId, q);
        return ResponseEntity.ok(messages);
    }
}