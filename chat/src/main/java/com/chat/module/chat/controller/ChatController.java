package com.chat.module.chat.controller;

import com.chat.module.auth.dto.UserResponse;
import com.chat.module.auth.service.UserService;
import com.chat.module.chat.dto.ChatRequest;
import com.chat.module.chat.dto.ChatResponse;
import com.chat.module.chat.service.ChatService;
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
@RequestMapping("/api/chats")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatController {

    private final ChatService chatService;
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
     * Crea un nuevo chat (privado o grupal)
     * POST /api/chats
     */
    @PostMapping
    public ResponseEntity<ChatResponse> createChat(@Valid @RequestBody ChatRequest request) {
        Long userId = getCurrentUserId();
        log.info("Create chat request from user: {}", userId);

        ChatResponse response = chatService.createChat(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Obtiene un chat por ID
     * GET /api/chats/{chatId}
     */
    @GetMapping("/{chatId}")
    public ResponseEntity<ChatResponse> getChatById(@PathVariable Long chatId) {
        Long userId = getCurrentUserId();
        log.info("Get chat {} request from user: {}", chatId, userId);

        ChatResponse response = chatService.getChatById(userId, chatId);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene todos los chats del usuario
     * GET /api/chats
     */
    @GetMapping
    public ResponseEntity<List<ChatResponse>> getUserChats() {
        Long userId = getCurrentUserId();
        log.info("Get all chats request from user: {}", userId);

        List<ChatResponse> chats = chatService.getUserChats(userId);
        return ResponseEntity.ok(chats);
    }

    /**
     * Obtiene chats privados del usuario
     * GET /api/chats/private
     */
    @GetMapping("/private")
    public ResponseEntity<List<ChatResponse>> getPrivateChats() {
        Long userId = getCurrentUserId();
        log.info("Get private chats request from user: {}", userId);

        List<ChatResponse> chats = chatService.getPrivateChats(userId);
        return ResponseEntity.ok(chats);
    }

    /**
     * Obtiene chats grupales del usuario
     * GET /api/chats/group
     */
    @GetMapping("/group")
    public ResponseEntity<List<ChatResponse>> getGroupChats() {
        Long userId = getCurrentUserId();
        log.info("Get group chats request from user: {}", userId);

        List<ChatResponse> chats = chatService.getGroupChats(userId);
        return ResponseEntity.ok(chats);
    }

    /**
     * Agrega participantes a un chat grupal
     * POST /api/chats/{chatId}/participants
     */
    @PostMapping("/{chatId}/participants")
    public ResponseEntity<ChatResponse> addParticipants(
            @PathVariable Long chatId,
            @RequestBody Map<String, List<Long>> request) {
        Long userId = getCurrentUserId();
        log.info("Add participants to chat {} request from user: {}", chatId, userId);

        List<Long> participantIds = request.get("participantIds");
        if (participantIds == null || participantIds.isEmpty()) {
            throw new RuntimeException("Participant IDs are required");
        }

        ChatResponse response = chatService.addParticipants(userId, chatId, participantIds);
        return ResponseEntity.ok(response);
    }

    /**
     * Elimina un participante de un chat grupal
     * DELETE /api/chats/{chatId}/participants/{participantId}
     */
    @DeleteMapping("/{chatId}/participants/{participantId}")
    public ResponseEntity<ChatResponse> removeParticipant(
            @PathVariable Long chatId,
            @PathVariable Long participantId) {
        Long userId = getCurrentUserId();
        log.info("Remove participant {} from chat {} request from user: {}", participantId, chatId, userId);

        ChatResponse response = chatService.removeParticipant(userId, chatId, participantId);
        return ResponseEntity.ok(response);
    }

    /**
     * Sale de un chat
     * POST /api/chats/{chatId}/leave
     */
    @PostMapping("/{chatId}/leave")
    public ResponseEntity<Map<String, String>> leaveChat(@PathVariable Long chatId) {
        Long userId = getCurrentUserId();
        log.info("Leave chat {} request from user: {}", chatId, userId);

        chatService.leaveChat(userId, chatId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Left chat successfully");

        return ResponseEntity.ok(response);
    }

    /**
     * Actualiza la información del chat grupal
     * PUT /api/chats/{chatId}
     */
    @PutMapping("/{chatId}")
    public ResponseEntity<ChatResponse> updateGroupChat(
            @PathVariable Long chatId,
            @Valid @RequestBody ChatRequest request) {
        Long userId = getCurrentUserId();
        log.info("Update group chat {} request from user: {}", chatId, userId);

        ChatResponse response = chatService.updateGroupChat(userId, chatId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Promueve un participante a admin
     * POST /api/chats/{chatId}/participants/{participantId}/promote
     */
    @PostMapping("/{chatId}/participants/{participantId}/promote")
    public ResponseEntity<ChatResponse> promoteToAdmin(
            @PathVariable Long chatId,
            @PathVariable Long participantId) {
        Long userId = getCurrentUserId();
        log.info("Promote participant {} to admin in chat {} request from user: {}", 
                participantId, chatId, userId);

        ChatResponse response = chatService.promoteToAdmin(userId, chatId, participantId);
        return ResponseEntity.ok(response);
    }

    /**
     * Elimina un chat
     * DELETE /api/chats/{chatId}
     */
    @DeleteMapping("/{chatId}")
    public ResponseEntity<Map<String, String>> deleteChat(@PathVariable Long chatId) {
        Long userId = getCurrentUserId();
        log.info("Delete chat {} request from user: {}", chatId, userId);

        chatService.deleteChat(userId, chatId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Chat deleted successfully");

        return ResponseEntity.ok(response);
    }
}