package com.chat.module.chat.service;

import com.chat.exception.CustomExceptions;
import com.chat.model.mongo.Message;
import com.chat.model.mongo.TypingIndicator;
import com.chat.model.postgres.Chat;
import com.chat.model.postgres.ChatParticipant;
import com.chat.model.postgres.MessageMetadata;
import com.chat.model.postgres.User;
import com.chat.module.auth.repository.UserRepository;
import com.chat.module.chat.dto.MessageRequest;
import com.chat.module.chat.dto.MessageResponse;
import com.chat.module.chat.dto.ReadReceiptRequest;
import com.chat.module.chat.dto.TypingIndicatorRequest;
import com.chat.module.chat.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageService {

    private final MessageMongoRepository messageMongoRepository;
    private final MessageMetadataRepository messageMetadataRepository;
    private final ChatRepository chatRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final UserRepository userRepository;
    private final TypingIndicatorMongoRepository typingIndicatorMongoRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Envía un nuevo mensaje
     */
    @Transactional
    public MessageResponse sendMessage(Long userId, MessageRequest request) {
        log.info("Sending message to chat {} from user {}", request.getChatId(), userId);

        // Verificar que el chat existe
        Chat chat = chatRepository.findById(request.getChatId())
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Chat not found"));

        // Verificar que el usuario es participante del chat
        ChatParticipant participant = chatParticipantRepository.findByChatIdAndUserId(request.getChatId(), userId)
                .orElseThrow(() -> new CustomExceptions.ForbiddenException("Not a participant of this chat"));

        if (!participant.getIsActive()) {
            throw new CustomExceptions.ForbiddenException("You have left this chat");
        }

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        // Crear mensaje en MongoDB
        Message message = new Message();
        message.setChatId(request.getChatId());
        message.setSenderId(userId);
        message.setContent(request.getContent());
        message.setMessageType(request.getMessageType() != null ? request.getMessageType() : "TEXT");
        message.setSentAt(LocalDateTime.now());
        message.setReactions(new ArrayList<>());
        message.setReadBy(new ArrayList<>());

        // Agregar metadata si es archivo
        if (request.getMetadata() != null) {
            Message.MessageMetadata metadata = new Message.MessageMetadata();
            metadata.setFileName(request.getMetadata().getFileName());
            metadata.setFileSize(request.getMetadata().getFileSize());
            metadata.setMimeType(request.getMetadata().getMimeType());
            metadata.setDuration(request.getMetadata().getDuration());
            metadata.setThumbnailUrl(request.getMetadata().getThumbnailUrl());
            message.setMetadata(metadata);
        }

        // Reply to
        if (request.getReplyTo() != null) {
            message.setReplyTo(request.getReplyTo());
        }

        message = messageMongoRepository.save(message);
        log.info("Message saved to MongoDB with ID: {}", message.getId());

        // Crear metadata en PostgreSQL
        MessageMetadata messageMetadata = new MessageMetadata();
        messageMetadata.setChat(chat);
        messageMetadata.setMessageMongoId(message.getId());
        messageMetadata.setSender(sender);
        
        try {
            MessageMetadata.MessageType msgType = MessageMetadata.MessageType.valueOf(message.getMessageType().toUpperCase());
            messageMetadata.setMessageType(msgType);
        } catch (IllegalArgumentException e) {
            messageMetadata.setMessageType(MessageMetadata.MessageType.TEXT);
        }
        
        messageMetadata.setIsDeleted(false);

        messageMetadataRepository.save(messageMetadata);
        log.info("Message metadata saved to PostgreSQL");

        // Actualizar el timestamp del chat
        chat.setUpdatedAt(LocalDateTime.now());
        chatRepository.save(chat);

        // Preparar respuesta
        MessageResponse response = MessageResponse.fromMessage(message);
        response.setSenderUsername(sender.getUsername());
        response.setSenderProfilePicture(sender.getProfilePictureUrl());
        response.setIsRead(false);

        // Enviar notificación en tiempo real a los participantes del chat
        messagingTemplate.convertAndSend("/topic/chat/" + request.getChatId(), response);

        return response;
    }

    /**
     * Obtiene mensajes de un chat con paginación
     */
    @Transactional(readOnly = true)
    public List<MessageResponse> getChatMessages(Long userId, Long chatId, int page, int size) {
        log.info("Getting messages for chat {} by user {}, page: {}, size: {}", chatId, userId, page, size);

        // Verificar acceso al chat
        if (!chatParticipantRepository.existsByChatIdAndUserId(chatId, userId)) {
            throw new CustomExceptions.ForbiddenException("Access denied to this chat");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messagesPage = messageMongoRepository.findByChatIdAndDeletedAtIsNullOrderBySentAtDesc(chatId, pageable);

        return messagesPage.getContent().stream()
                .map(message -> {
                    MessageResponse response = MessageResponse.fromMessage(message);
                    
                    // Agregar información del remitente
                    User sender = userRepository.findById(message.getSenderId()).orElse(null);
                    if (sender != null) {
                        response.setSenderUsername(sender.getUsername());
                        response.setSenderProfilePicture(sender.getProfilePictureUrl());
                    }

                    // Verificar si el mensaje fue leído por el usuario actual
                    boolean isRead = message.getReadBy() != null && 
                            message.getReadBy().stream()
                                    .anyMatch(rb -> rb.getUserId().equals(userId));
                    response.setIsRead(isRead);

                    // Enriquecer información de reacciones con usernames
                    if (message.getReactions() != null) {
                        List<MessageResponse.ReactionInfo> enrichedReactions = message.getReactions().stream()
                                .map(r -> {
                                    User reactionUser = userRepository.findById(r.getUserId()).orElse(null);
                                    MessageResponse.ReactionInfo reactionInfo = MessageResponse.ReactionInfo.builder()
                                            .userId(r.getUserId())
                                            .emoji(r.getEmoji())
                                            .createdAt(r.getCreatedAt())
                                            .build();
                                    if (reactionUser != null) {
                                        reactionInfo.setUsername(reactionUser.getUsername());
                                    }
                                    return reactionInfo;
                                })
                                .collect(Collectors.toList());
                        response.setReactions(enrichedReactions);
                    }

                    // Enriquecer información de read receipts con usernames
                    if (message.getReadBy() != null) {
                        List<MessageResponse.ReadReceiptInfo> enrichedReadBy = message.getReadBy().stream()
                                .map(rb -> {
                                    User readUser = userRepository.findById(rb.getUserId()).orElse(null);
                                    MessageResponse.ReadReceiptInfo readInfo = MessageResponse.ReadReceiptInfo.builder()
                                            .userId(rb.getUserId())
                                            .readAt(rb.getReadAt())
                                            .build();
                                    if (readUser != null) {
                                        readInfo.setUsername(readUser.getUsername());
                                    }
                                    return readInfo;
                                })
                                .collect(Collectors.toList());
                        response.setReadBy(enrichedReadBy);
                    }

                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un mensaje específico
     */
    @Transactional(readOnly = true)
    public MessageResponse getMessageById(Long userId, String messageId) {
        log.info("Getting message {} by user {}", messageId, userId);

        Message message = messageMongoRepository.findById(messageId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Message not found"));

        // Verificar acceso al chat
        if (!chatParticipantRepository.existsByChatIdAndUserId(message.getChatId(), userId)) {
            throw new CustomExceptions.ForbiddenException("Access denied to this message");
        }

        MessageResponse response = MessageResponse.fromMessage(message);
        
        // Agregar información del remitente
        User sender = userRepository.findById(message.getSenderId()).orElse(null);
        if (sender != null) {
            response.setSenderUsername(sender.getUsername());
            response.setSenderProfilePicture(sender.getProfilePictureUrl());
        }

        return response;
    }

    /**
     * Edita un mensaje
     */
    @Transactional
    public MessageResponse editMessage(Long userId, String messageId, String newContent) {
        log.info("Editing message {} by user {}", messageId, userId);

        Message message = messageMongoRepository.findById(messageId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Message not found"));

        // Verificar que el usuario es el remitente
        if (!message.getSenderId().equals(userId)) {
            throw new CustomExceptions.ForbiddenException("Can only edit your own messages");
        }

        // Verificar que el mensaje no fue eliminado
        if (message.getDeletedAt() != null) {
            throw new CustomExceptions.BadRequestException("Cannot edit deleted messages");
        }

        message.setContent(newContent);
        message.setEditedAt(LocalDateTime.now());

        message = messageMongoRepository.save(message);
        log.info("Message {} edited successfully", messageId);

        MessageResponse response = MessageResponse.fromMessage(message);
        
        // Agregar información del remitente
        User sender = userRepository.findById(message.getSenderId()).orElse(null);
        if (sender != null) {
            response.setSenderUsername(sender.getUsername());
            response.setSenderProfilePicture(sender.getProfilePictureUrl());
        }

        // Notificar en tiempo real
        messagingTemplate.convertAndSend("/topic/chat/" + message.getChatId() + "/edit", response);

        return response;
    }

    /**
     * Elimina un mensaje
     */
    @Transactional
    public void deleteMessage(Long userId, String messageId) {
        log.info("Deleting message {} by user {}", messageId, userId);

        Message message = messageMongoRepository.findById(messageId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Message not found"));

        // Verificar que el usuario es el remitente o admin del chat
        if (!message.getSenderId().equals(userId)) {
            ChatParticipant participant = chatParticipantRepository.findByChatIdAndUserId(message.getChatId(), userId)
                    .orElseThrow(() -> new CustomExceptions.ForbiddenException("Access denied"));
            
            if (participant.getRole() != ChatParticipant.ParticipantRole.ADMIN) {
                throw new CustomExceptions.ForbiddenException("Can only delete your own messages or be an admin");
            }
        }

        message.setDeletedAt(LocalDateTime.now());
        messageMongoRepository.save(message);

        // Actualizar metadata en PostgreSQL
        MessageMetadata metadata = messageMetadataRepository.findByMessageMongoId(messageId).orElse(null);
        if (metadata != null) {
            metadata.setIsDeleted(true);
            messageMetadataRepository.save(metadata);
        }

        log.info("Message {} deleted successfully", messageId);

        // Notificar en tiempo real
        messagingTemplate.convertAndSend("/topic/chat/" + message.getChatId() + "/delete", messageId);
    }

    /**
     * Marca mensajes como leídos
     */
    @Transactional
    public void markMessagesAsRead(Long userId, ReadReceiptRequest request) {
        log.info("Marking messages as read in chat {} by user {}", request.getChatId(), userId);

        // Verificar acceso al chat
        if (!chatParticipantRepository.existsByChatIdAndUserId(request.getChatId(), userId)) {
            throw new CustomExceptions.ForbiddenException("Access denied to this chat");
        }

        for (String messageId : request.getMessageIds()) {
            Message message = messageMongoRepository.findById(messageId).orElse(null);
            if (message == null) {
                log.warn("Message {} not found", messageId);
                continue;
            }

            // Verificar si ya fue leído por este usuario
            boolean alreadyRead = message.getReadBy() != null && 
                    message.getReadBy().stream().anyMatch(rb -> rb.getUserId().equals(userId));

            if (!alreadyRead) {
                if (message.getReadBy() == null) {
                    message.setReadBy(new ArrayList<>());
                }

                Message.ReadReceipt readReceipt = new Message.ReadReceipt();
                readReceipt.setUserId(userId);
                readReceipt.setReadAt(LocalDateTime.now());
                message.getReadBy().add(readReceipt);

                messageMongoRepository.save(message);
                
                // Notificar al remitente
                messagingTemplate.convertAndSendToUser(
                        message.getSenderId().toString(),
                        "/queue/read-receipt",
                        messageId
                );
            }
        }

        log.info("Messages marked as read successfully");
    }

    /**
     * Agrega una reacción a un mensaje
     */
    @Transactional
    public MessageResponse addReaction(Long userId, String messageId, String emoji) {
        log.info("Adding reaction {} to message {} by user {}", emoji, messageId, userId);

        Message message = messageMongoRepository.findById(messageId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Message not found"));

        // Verificar acceso al chat
        if (!chatParticipantRepository.existsByChatIdAndUserId(message.getChatId(), userId)) {
            throw new CustomExceptions.ForbiddenException("Access denied to this chat");
        }

        if (message.getReactions() == null) {
            message.setReactions(new ArrayList<>());
        }

        // Verificar si el usuario ya reaccionó con ese emoji
        boolean alreadyReacted = message.getReactions().stream()
                .anyMatch(r -> r.getUserId().equals(userId) && r.getEmoji().equals(emoji));

        if (alreadyReacted) {
            throw new CustomExceptions.BadRequestException("Already reacted with this emoji");
        }

        Message.Reaction reaction = new Message.Reaction();
        reaction.setUserId(userId);
        reaction.setEmoji(emoji);
        reaction.setCreatedAt(LocalDateTime.now());
        message.getReactions().add(reaction);

        message = messageMongoRepository.save(message);
        log.info("Reaction added successfully");

        MessageResponse response = MessageResponse.fromMessage(message);
        
        // Notificar en tiempo real
        messagingTemplate.convertAndSend("/topic/chat/" + message.getChatId() + "/reaction", response);

        return response;
    }

    /**
     * Elimina una reacción de un mensaje
     */
    @Transactional
    public MessageResponse removeReaction(Long userId, String messageId, String emoji) {
        log.info("Removing reaction {} from message {} by user {}", emoji, messageId, userId);

        Message message = messageMongoRepository.findById(messageId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Message not found"));

        // Verificar acceso al chat
        if (!chatParticipantRepository.existsByChatIdAndUserId(message.getChatId(), userId)) {
            throw new CustomExceptions.ForbiddenException("Access denied to this chat");
        }

        if (message.getReactions() != null) {
            message.getReactions().removeIf(r -> r.getUserId().equals(userId) && r.getEmoji().equals(emoji));
            message = messageMongoRepository.save(message);
            log.info("Reaction removed successfully");

            MessageResponse response = MessageResponse.fromMessage(message);
            
            // Notificar en tiempo real
            messagingTemplate.convertAndSend("/topic/chat/" + message.getChatId() + "/reaction", response);

            return response;
        }

        throw new CustomExceptions.ResourceNotFoundException("Reaction not found");
    }

    /**
     * Maneja el indicador de escritura
     */
    @Transactional
    public void handleTypingIndicator(Long userId, TypingIndicatorRequest request) {
        log.info("Handling typing indicator for user {} in chat {}: {}", userId, request.getChatId(), request.getIsTyping());

        // Verificar acceso al chat
        if (!chatParticipantRepository.existsByChatIdAndUserId(request.getChatId(), userId)) {
            throw new CustomExceptions.ForbiddenException("Access denied to this chat");
        }

        TypingIndicator indicator = typingIndicatorMongoRepository.findByChatIdAndUserId(request.getChatId(), userId)
                .orElse(new TypingIndicator());

        indicator.setChatId(request.getChatId());
        indicator.setUserId(userId);
        indicator.setIsTyping(request.getIsTyping());
        indicator.setTimestamp(LocalDateTime.now());

        typingIndicatorMongoRepository.save(indicator);

        // Notificar en tiempo real a otros participantes
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            messagingTemplate.convertAndSend(
                    "/topic/chat/" + request.getChatId() + "/typing",
                    new TypingIndicatorResponse(userId, user.getUsername(), request.getIsTyping())
            );
        }
    }

    /**
     * Busca mensajes en un chat
     */
    @Transactional(readOnly = true)
    public List<MessageResponse> searchMessages(Long userId, Long chatId, String searchTerm) {
        log.info("Searching messages in chat {} with term: {}", chatId, searchTerm);

        // Verificar acceso al chat
        if (!chatParticipantRepository.existsByChatIdAndUserId(chatId, userId)) {
            throw new CustomExceptions.ForbiddenException("Access denied to this chat");
        }

        List<Message> messages = messageMongoRepository.searchMessagesByContent(chatId, searchTerm);

        return messages.stream()
                .map(message -> {
                    MessageResponse response = MessageResponse.fromMessage(message);
                    User sender = userRepository.findById(message.getSenderId()).orElse(null);
                    if (sender != null) {
                        response.setSenderUsername(sender.getUsername());
                        response.setSenderProfilePicture(sender.getProfilePictureUrl());
                    }
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Clase auxiliar para respuesta de typing indicator
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class TypingIndicatorResponse {
        private Long userId;
        private String username;
        private Boolean isTyping;
    }
}