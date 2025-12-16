import { apiClient } from "./client";
import { Chat, CreateChatRequest } from "@/src/types/chat.types";

export const chatApi = {
  // Crear chat
  createChat: async (data: CreateChatRequest): Promise<Chat> => {
    const response = await apiClient.post<Chat>("/chats", data);
    return response.data;
  },

  // Obtener todos los chats
  getAllChats: async (): Promise<Chat[]> => {
    const response = await apiClient.get<Chat[]>("/chats");
    return response.data;
  },

  // Obtener un chat específico
  getChat: async (chatId: number): Promise<Chat> => {
    const response = await apiClient.get<Chat>(`/chats/${chatId}`);
    return response.data;
  },

  // Obtener chats privados
  getPrivateChats: async (): Promise<Chat[]> => {
    const response = await apiClient.get<Chat[]>("/chats/private");
    return response.data;
  },

  // Obtener chats grupales
  getGroupChats: async (): Promise<Chat[]> => {
    const response = await apiClient.get<Chat[]>("/chats/group");
    return response.data;
  },

  // Actualizar información del chat grupal
  updateChat: async (chatId: number, data: Partial<CreateChatRequest>): Promise<Chat> => {
    const response = await apiClient.put<Chat>(`/chats/${chatId}`, data);
    return response.data;
  },

  // Salir del chat
  leaveChat: async (chatId: number): Promise<void> => {
    await apiClient.post(`/chats/${chatId}/leave`);
  },

  // Eliminar chat
  deleteChat: async (chatId: number): Promise<void> => {
    await apiClient.delete(`/chats/${chatId}`);
  },

  // Agregar participantes
  addParticipants: async (chatId: number, participantIds: number[]): Promise<Chat> => {
    const response = await apiClient.post<Chat>(`/chats/${chatId}/participants`, {
      participantIds,
    });
    return response.data;
  },

  // Eliminar participante
  removeParticipant: async (chatId: number, participantId: number): Promise<Chat> => {
    const response = await apiClient.delete<Chat>(
      `/chats/${chatId}/participants/${participantId}`
    );
    return response.data;
  },

  // Promover a admin
  promoteToAdmin: async (chatId: number, participantId: number): Promise<Chat> => {
    const response = await apiClient.post<Chat>(
      `/chats/${chatId}/participants/${participantId}/promote`
    );
    return response.data;
  },
};