package com.chat.module.chat.service;

import com.chat.exception.CustomExceptions;
import com.chat.model.postgres.Chat;
import com.chat.model.postgres.ChatParticipant;
import com.chat.model.postgres.User;
import com.chat.module.auth.repository.UserRepository;
import com.chat.module.chat.dto.ChatRequest;
import com.chat.module.chat.dto.ChatResponse;
import com.chat.module.chat.repository.ChatParticipantRepository;
import com.chat.module.chat.repository.ChatRepository;
import com.chat.module.chat.repository.MessageMongoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final UserRepository userRepository;
    private final MessageMongoRepository messageMongoRepository;

    /**
     * Crea un nuevo chat (privado o grupal)
     */
    @Transactional
    public ChatResponse createChat(Long userId, ChatRequest request) {
        log.info("Creating chat for user: {} with type: {}", userId, request.getChatType());

        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("User not found"));

        // Validar tipo de chat
        Chat.ChatType chatType;
        try {
            chatType = Chat.ChatType.valueOf(request.getChatType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new CustomExceptions.BadRequestException("Invalid chat type. Valid values: PRIVATE, GROUP");
        }

        // Validaciones específicas por tipo de chat
        if (chatType == Chat.ChatType.PRIVATE) {
            if (request.getParticipantIds().size() != 1) {
                throw new CustomExceptions.BadRequestException("Private chat must have exactly 1 other participant");
            }

            Long otherUserId = request.getParticipantIds().get(0);
            
            // Verificar que no sea el mismo usuario
            if (userId.equals(otherUserId)) {
                throw new CustomExceptions.BadRequestException("Cannot create private chat with yourself");
            }

            // Verificar si ya existe un chat privado entre estos usuarios
            List<Chat> existingChats = chatRepository.findUserChatsByType(userId, Chat.ChatType.PRIVATE);
            for (Chat existingChat : existingChats) {
                List<ChatParticipant> participants = chatParticipantRepository.findByChatIdAndIsActive(existingChat.getId(), true);
                if (participants.size() == 2) {
                    boolean hasOtherUser = participants.stream()
                            .anyMatch(p -> p.getUser().getId().equals(otherUserId));
                    if (hasOtherUser) {
                        log.info("Private chat already exists between users {} and {}", userId, otherUserId);
                        return getChatById(userId, existingChat.getId());
                    }
                }
            }
        } else if (chatType == Chat.ChatType.GROUP) {
            if (request.getParticipantIds().size() < 2) {
                throw new CustomExceptions.BadRequestException("Group chat must have at least 2 other participants");
            }
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                throw new CustomExceptions.BadRequestException("Group chat must have a name");
            }
        }

        // Crear el chat
        Chat chat = new Chat();
        chat.setChatType(chatType);
        chat.setName(request.getName());
        chat.setDescription(request.getDescription());
        chat.setPictureUrl(request.getPictureUrl());
        chat.setCreatedBy(creator);

        chat = chatRepository.save(chat);
        log.info("Chat created with ID: {}", chat.getId());

        // Agregar al creador como participante (admin en grupos)
        ChatParticipant creatorParticipant = new ChatParticipant();
        creatorParticipant.setChat(chat);
        creatorParticipant.setUser(creator);
        creatorParticipant.setRole(chatType == Chat.ChatType.GROUP ? 
                ChatParticipant.ParticipantRole.ADMIN : ChatParticipant.ParticipantRole.MEMBER);
        creatorParticipant.setIsActive(true);
        creatorParticipant.setNotificationsEnabled(true);
        chatParticipantRepository.save(creatorParticipant);

        // Agregar los otros participantes
        List<ChatParticipant> participants = new ArrayList<>();
        participants.add(creatorParticipant);

        for (Long participantId : request.getParticipantIds()) {
            if (participantId.equals(userId)) {
                continue; // Skip creator
            }

            User participant = userRepository.findById(participantId)
                    .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException(
                            "Participant with ID " + participantId + " not found"));

            ChatParticipant chatParticipant = new ChatParticipant();
            chatParticipant.setChat(chat);
            chatParticipant.setUser(participant);
            chatParticipant.setRole(ChatParticipant.ParticipantRole.MEMBER);
            chatParticipant.setIsActive(true);
            chatParticipant.setNotificationsEnabled(true);
            
            chatParticipant = chatParticipantRepository.save(chatParticipant);
            participants.add(chatParticipant);
            
            log.info("Added participant {} to chat {}", participantId, chat.getId());
        }

        return ChatResponse.fromChat(chat, participants);
    }

    /**
     * Obtiene un chat por ID
     */
    @Transactional(readOnly = true)
    public ChatResponse getChatById(Long userId, Long chatId) {
        log.info("Getting chat {} for user {}", chatId, userId);

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Chat not found"));

        // Verificar que el usuario sea participante del chat
        if (!chatParticipantRepository.existsByChatIdAndUserId(chatId, userId)) {
            throw new CustomExceptions.ForbiddenException("Access denied to this chat");
        }

        List<ChatParticipant> participants = chatParticipantRepository.findByChatIdAndIsActive(chatId, true);
        
        ChatResponse response = ChatResponse.fromChat(chat, participants);
        
        // Agregar conteo de mensajes no leídos
        response.setUnreadCount(getUnreadMessageCount(chatId, userId));

        return response;
    }

    /**
     * Obtiene todos los chats del usuario
     */
    @Transactional(readOnly = true)
    public List<ChatResponse> getUserChats(Long userId) {
        log.info("Getting all chats for user: {}", userId);

        List<Chat> chats = chatRepository.findUserChats(userId);
        
        return chats.stream()
                .map(chat -> {
                    List<ChatParticipant> participants = chatParticipantRepository.findByChatIdAndIsActive(chat.getId(), true);
                    ChatResponse response = ChatResponse.fromChat(chat, participants);
                    response.setUnreadCount(getUnreadMessageCount(chat.getId(), userId));
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Obtiene chats privados del usuario
     */
    @Transactional(readOnly = true)
    public List<ChatResponse> getPrivateChats(Long userId) {
        log.info("Getting private chats for user: {}", userId);

        List<Chat> chats = chatRepository.findUserChatsByType(userId, Chat.ChatType.PRIVATE);
        
        return chats.stream()
                .map(chat -> {
                    List<ChatParticipant> participants = chatParticipantRepository.findByChatIdAndIsActive(chat.getId(), true);
                    ChatResponse response = ChatResponse.fromChat(chat, participants);
                    response.setUnreadCount(getUnreadMessageCount(chat.getId(), userId));
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Obtiene chats grupales del usuario
     */
    @Transactional(readOnly = true)
    public List<ChatResponse> getGroupChats(Long userId) {
        log.info("Getting group chats for user: {}", userId);

        List<Chat> chats = chatRepository.findUserChatsByType(userId, Chat.ChatType.GROUP);
        
        return chats.stream()
                .map(chat -> {
                    List<ChatParticipant> participants = chatParticipantRepository.findByChatIdAndIsActive(chat.getId(), true);
                    ChatResponse response = ChatResponse.fromChat(chat, participants);
                    response.setUnreadCount(getUnreadMessageCount(chat.getId(), userId));
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Agrega participantes a un chat grupal
     */
    @Transactional
    public ChatResponse addParticipants(Long userId, Long chatId, List<Long> participantIds) {
        log.info("Adding participants to chat {} by user {}", chatId, userId);

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Chat not found"));

        // Verificar que sea un chat grupal
        if (chat.getChatType() != Chat.ChatType.GROUP) {
            throw new CustomExceptions.BadRequestException("Can only add participants to group chats");
        }

        // Verificar que el usuario sea admin del grupo
        ChatParticipant userParticipant = chatParticipantRepository.findByChatIdAndUserId(chatId, userId)
                .orElseThrow(() -> new CustomExceptions.ForbiddenException("Access denied to this chat"));

        if (userParticipant.getRole() != ChatParticipant.ParticipantRole.ADMIN) {
            throw new CustomExceptions.ForbiddenException("Only admins can add participants");
        }

        // Agregar los nuevos participantes
        for (Long participantId : participantIds) {
            // Verificar si ya es participante
            if (chatParticipantRepository.existsByChatIdAndUserId(chatId, participantId)) {
                log.warn("User {} is already a participant of chat {}", participantId, chatId);
                continue;
            }

            User participant = userRepository.findById(participantId)
                    .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException(
                            "User with ID " + participantId + " not found"));

            ChatParticipant chatParticipant = new ChatParticipant();
            chatParticipant.setChat(chat);
            chatParticipant.setUser(participant);
            chatParticipant.setRole(ChatParticipant.ParticipantRole.MEMBER);
            chatParticipant.setIsActive(true);
            chatParticipant.setNotificationsEnabled(true);

            chatParticipantRepository.save(chatParticipant);
            log.info("Added participant {} to chat {}", participantId, chatId);
        }

        List<ChatParticipant> participants = chatParticipantRepository.findByChatIdAndIsActive(chatId, true);
        return ChatResponse.fromChat(chat, participants);
    }

    /**
     * Elimina un participante de un chat grupal
     */
    @Transactional
    public ChatResponse removeParticipant(Long userId, Long chatId, Long participantId) {
        log.info("Removing participant {} from chat {} by user {}", participantId, chatId, userId);

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Chat not found"));

        if (chat.getChatType() != Chat.ChatType.GROUP) {
            throw new CustomExceptions.BadRequestException("Can only remove participants from group chats");
        }

        // Verificar que el usuario sea admin
        ChatParticipant userParticipant = chatParticipantRepository.findByChatIdAndUserId(chatId, userId)
                .orElseThrow(() -> new CustomExceptions.ForbiddenException("Access denied to this chat"));

        if (userParticipant.getRole() != ChatParticipant.ParticipantRole.ADMIN) {
            throw new CustomExceptions.ForbiddenException("Only admins can remove participants");
        }

        // No se puede eliminar a sí mismo si es el único admin
        if (userId.equals(participantId)) {
            List<ChatParticipant> admins = chatParticipantRepository.findByChatIdAndRole(
                    chatId, ChatParticipant.ParticipantRole.ADMIN);
            if (admins.size() == 1) {
                throw new CustomExceptions.BadRequestException(
                        "Cannot leave group as the only admin. Assign another admin first.");
            }
        }

        chatParticipantRepository.deactivateParticipant(chatId, participantId);
        log.info("Participant {} removed from chat {}", participantId, chatId);

        List<ChatParticipant> participants = chatParticipantRepository.findByChatIdAndIsActive(chatId, true);
        return ChatResponse.fromChat(chat, participants);
    }

    /**
     * Sale de un chat
     */
    @Transactional
    public void leaveChat(Long userId, Long chatId) {
        log.info("User {} leaving chat {}", userId, chatId);

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Chat not found"));

        if (chat.getChatType() == Chat.ChatType.GROUP) {
            // Para grupos, verificar si es el único admin
            ChatParticipant userParticipant = chatParticipantRepository.findByChatIdAndUserId(chatId, userId)
                    .orElseThrow(() -> new CustomExceptions.ForbiddenException("Not a participant of this chat"));

            if (userParticipant.getRole() == ChatParticipant.ParticipantRole.ADMIN) {
                List<ChatParticipant> admins = chatParticipantRepository.findByChatIdAndRole(
                        chatId, ChatParticipant.ParticipantRole.ADMIN);
                if (admins.size() == 1) {
                    throw new CustomExceptions.BadRequestException(
                            "Cannot leave group as the only admin. Assign another admin first.");
                }
            }
        }

        chatParticipantRepository.deactivateParticipant(chatId, userId);
        log.info("User {} left chat {}", userId, chatId);
    }

    /**
     * Actualiza la información del chat grupal
     */
    @Transactional
    public ChatResponse updateGroupChat(Long userId, Long chatId, ChatRequest request) {
        log.info("Updating group chat {} by user {}", chatId, userId);

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Chat not found"));

        if (chat.getChatType() != Chat.ChatType.GROUP) {
            throw new CustomExceptions.BadRequestException("Can only update group chats");
        }

        // Verificar que el usuario sea admin
        ChatParticipant userParticipant = chatParticipantRepository.findByChatIdAndUserId(chatId, userId)
                .orElseThrow(() -> new CustomExceptions.ForbiddenException("Access denied to this chat"));

        if (userParticipant.getRole() != ChatParticipant.ParticipantRole.ADMIN) {
            throw new CustomExceptions.ForbiddenException("Only admins can update group information");
        }

        // Actualizar información
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            chat.setName(request.getName());
        }
        if (request.getDescription() != null) {
            chat.setDescription(request.getDescription());
        }
        if (request.getPictureUrl() != null) {
            chat.setPictureUrl(request.getPictureUrl());
        }

        chat = chatRepository.save(chat);
        log.info("Group chat {} updated successfully", chatId);

        List<ChatParticipant> participants = chatParticipantRepository.findByChatIdAndIsActive(chatId, true);
        return ChatResponse.fromChat(chat, participants);
    }

    /**
     * Promueve un participante a admin
     */
    @Transactional
    public ChatResponse promoteToAdmin(Long userId, Long chatId, Long participantId) {
        log.info("Promoting participant {} to admin in chat {} by user {}", participantId, chatId, userId);

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Chat not found"));

        if (chat.getChatType() != Chat.ChatType.GROUP) {
            throw new CustomExceptions.BadRequestException("Can only promote admins in group chats");
        }

        // Verificar que el usuario sea admin
        ChatParticipant userParticipant = chatParticipantRepository.findByChatIdAndUserId(chatId, userId)
                .orElseThrow(() -> new CustomExceptions.ForbiddenException("Access denied to this chat"));

        if (userParticipant.getRole() != ChatParticipant.ParticipantRole.ADMIN) {
            throw new CustomExceptions.ForbiddenException("Only admins can promote other participants");
        }

        // Promover al participante
        ChatParticipant participant = chatParticipantRepository.findByChatIdAndUserId(chatId, participantId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Participant not found in this chat"));

        participant.setRole(ChatParticipant.ParticipantRole.ADMIN);
        chatParticipantRepository.save(participant);
        
        log.info("Participant {} promoted to admin in chat {}", participantId, chatId);

        List<ChatParticipant> participants = chatParticipantRepository.findByChatIdAndIsActive(chatId, true);
        return ChatResponse.fromChat(chat, participants);
    }

    /**
     * Obtiene el conteo de mensajes no leídos
     */
    private Long getUnreadMessageCount(Long chatId, Long userId) {
        try {
            List<com.chat.model.mongo.Message> unreadMessages = 
                    messageMongoRepository.findUnreadMessages(chatId, userId);
            return (long) unreadMessages.size();
        } catch (Exception e) {
            log.warn("Error getting unread message count: {}", e.getMessage());
            return 0L;
        }
    }

    /**
     * Elimina un chat (solo para el creador en grupos, automático en privados)
     */
    @Transactional
    public void deleteChat(Long userId, Long chatId) {
        log.info("Deleting chat {} by user {}", chatId, userId);

        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new CustomExceptions.ResourceNotFoundException("Chat not found"));

        if (chat.getChatType() == Chat.ChatType.GROUP) {
            // Solo el creador puede eliminar grupos
            if (chat.getCreatedBy() == null || !chat.getCreatedBy().getId().equals(userId)) {
                throw new CustomExceptions.ForbiddenException("Only the creator can delete this group");
            }
        } else {
            // En chats privados, verificar que sea participante
            if (!chatParticipantRepository.existsByChatIdAndUserId(chatId, userId)) {
                throw new CustomExceptions.ForbiddenException("Access denied to this chat");
            }
        }

        // Desactivar todos los participantes
        List<ChatParticipant> participants = chatParticipantRepository.findByChatIdAndIsActive(chatId, true);
        for (ChatParticipant participant : participants) {
            chatParticipantRepository.deactivateParticipant(chatId, participant.getUser().getId());
        }

        log.info("Chat {} deleted successfully", chatId);
    }
}