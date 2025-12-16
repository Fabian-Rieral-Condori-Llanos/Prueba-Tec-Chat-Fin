package com.chat.module.chat.controller;

import com.chat.module.auth.dto.UserResponse;
import com.chat.module.auth.service.UserService;
import com.chat.module.chat.dto.MessageRequest;
import com.chat.module.chat.dto.MessageResponse;
import com.chat.module.chat.dto.TypingIndicatorRequest;
import com.chat.module.chat.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class MessageWebSocketController {

    private final MessageService messageService;
    private final UserService userService;

    /**
     * Obtiene el ID del usuario desde el principal
     */
    private Long getUserIdFromPrincipal(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("User not authenticated");
        }
        String username = principal.getName();
        UserResponse user = userService.getUserByUsername(username);
        return user.getId();
    }

    /**
     * Envía un mensaje a través de WebSocket
     * Cliente envía a: /app/chat.send
     * Servidor publica en: /topic/chat/{chatId}
     */
    @MessageMapping("/chat.send")
    public MessageResponse sendMessage(
            @Payload MessageRequest request,
            Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        log.info("WebSocket: Send message from user {} to chat {}", userId, request.getChatId());

        return messageService.sendMessage(userId, request);
    }

    /**
     * Maneja indicadores de escritura
     * Cliente envía a: /app/chat.typing
     * Servidor publica en: /topic/chat/{chatId}/typing
     */
    @MessageMapping("/chat.typing")
    public void handleTypingIndicator(
            @Payload TypingIndicatorRequest request,
            Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        log.info("WebSocket: Typing indicator from user {} in chat {}: {}", 
                userId, request.getChatId(), request.getIsTyping());

        messageService.handleTypingIndicator(userId, request);
    }

    /**
     * Maneja la conexión de un usuario
     * Cliente envía a: /app/chat.connect
     */
    @MessageMapping("/chat.connect")
    public void handleConnect(Principal principal, SimpMessageHeaderAccessor headerAccessor) {
        if (principal != null) {
            String username = principal.getName();
            log.info("WebSocket: User {} connected", username);
            
            // Aquí podrías actualizar el estado del usuario a ONLINE
            // userService.updateUserStatus(userId, User.UserStatus.ONLINE);
        }
    }

    /**
     * Maneja la desconexión de un usuario
     * Cliente envía a: /app/chat.disconnect
     */
    @MessageMapping("/chat.disconnect")
    public void handleDisconnect(Principal principal) {
        if (principal != null) {
            String username = principal.getName();
            log.info("WebSocket: User {} disconnected", username);
            
            // Aquí podrías actualizar el estado del usuario a OFFLINE
            // userService.updateUserStatus(userId, User.UserStatus.OFFLINE);
        }
    }
}