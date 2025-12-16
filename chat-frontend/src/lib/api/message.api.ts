import { apiClient } from "./client";
import { Message, SendMessageRequest } from "@/src/types/message.types";

export const messagesApi = {
  // Enviar mensaje
  sendMessage: async (data: SendMessageRequest): Promise<Message> => {
    const response = await apiClient.post<Message>("/messages", data);
    return response.data;
  },

  // Obtener mensajes de un chat
  getChatMessages: async (
    chatId: number,
    page: number = 0,
    size: number = 50
  ): Promise<Message[]> => {
    const response = await apiClient.get<Message[]>(`/messages/chat/${chatId}`, {
      params: { page, size },
    });
    return response.data;
  },

  // Obtener un mensaje específico
  getMessage: async (messageId: string): Promise<Message> => {
    const response = await apiClient.get<Message>(`/messages/${messageId}`);
    return response.data;
  },

  // Editar mensaje
  editMessage: async (messageId: string, content: string): Promise<Message> => {
    const response = await apiClient.put<Message>(`/messages/${messageId}`, {
      content,
    });
    return response.data;
  },

  // Eliminar mensaje
  deleteMessage: async (messageId: string): Promise<void> => {
    await apiClient.delete(`/messages/${messageId}`);
  },

  // Marcar mensajes como leídos
  markAsRead: async (chatId: number, messageIds: string[]): Promise<void> => {
    await apiClient.post("/messages/read", {
      chatId,
      messageIds,
    });
  },

  // Agregar reacción
  addReaction: async (messageId: string, emoji: string): Promise<Message> => {
    const response = await apiClient.post<Message>(
      `/messages/${messageId}/reactions`,
      { emoji }
    );
    return response.data;
  },

  // Eliminar reacción
  removeReaction: async (messageId: string, emoji: string): Promise<Message> => {
    const response = await apiClient.delete<Message>(
      `/messages/${messageId}/reactions`,
      { params: { emoji } }
    );
    return response.data;
  },

  // Buscar mensajes
  searchMessages: async (chatId: number, searchTerm: string): Promise<Message[]> => {
    const response = await apiClient.get<Message[]>(
      `/messages/chat/${chatId}/search`,
      { params: { q: searchTerm } }
    );
    return response.data;
  },
};