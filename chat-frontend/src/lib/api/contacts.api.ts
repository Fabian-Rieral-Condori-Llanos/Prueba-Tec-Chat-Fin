import { apiClient } from "./client";
import { Contact, AddContactRequest, ContactRequest } from "@/src/types/contact.types";

export const contactsApi = {
  // Obtener todos los contactos
  getAllContacts: async (): Promise<Contact[]> => {
    const response = await apiClient.get<Contact[]>("/contacts");
    return response.data;
  },

  // Obtener un contacto específico
  getContact: async (contactId: number): Promise<Contact> => {
    const response = await apiClient.get<Contact>(`/contacts/${contactId}`);
    return response.data;
  },

  // Agregar contacto por username/email
  addContactByUsername: async (data: AddContactRequest): Promise<Contact> => {
    const response = await apiClient.post<Contact>("/contacts/add-by-username", data);
    return response.data;
  },

  // Agregar contacto por ID
  addContact: async (data: ContactRequest): Promise<Contact> => {
    const response = await apiClient.post<Contact>("/contacts", data);
    return response.data;
  },

  // Obtener contactos bloqueados
  getBlockedContacts: async (): Promise<Contact[]> => {
    const response = await apiClient.get<Contact[]>("/contacts/blocked");
    return response.data;
  },

  // Obtener contactos favoritos
  getFavoriteContacts: async (): Promise<Contact[]> => {
    const response = await apiClient.get<Contact[]>("/contacts/favorites");
    return response.data;
  },

  // Buscar contactos
  searchContacts: async (searchTerm: string): Promise<Contact[]> => {
    const response = await apiClient.get<Contact[]>("/contacts/search", {
      params: { q: searchTerm },
    });
    return response.data;
  },

  // Actualizar nickname
  updateNickname: async (contactId: number, nickname: string): Promise<Contact> => {
    const response = await apiClient.patch<Contact>(
      `/contacts/${contactId}/nickname`,
      null,
      { params: { nickname } }
    );
    return response.data;
  },

  // Bloquear contacto
  blockContact: async (contactId: number): Promise<Contact> => {
    const response = await apiClient.post<Contact>(`/contacts/${contactId}/block`);
    return response.data;
  },

  // Desbloquear contacto
  unblockContact: async (contactId: number): Promise<Contact> => {
    const response = await apiClient.post<Contact>(`/contacts/${contactId}/unblock`);
    return response.data;
  },

  // Marcar como favorito
  markAsFavorite: async (contactId: number): Promise<Contact> => {
    const response = await apiClient.post<Contact>(`/contacts/${contactId}/favorite`);
    return response.data;
  },

  // Desmarcar como favorito
  unmarkAsFavorite: async (contactId: number): Promise<Contact> => {
    const response = await apiClient.delete<Contact>(`/contacts/${contactId}/favorite`);
    return response.data;
  },

  // Eliminar contacto
  deleteContact: async (contactId: number): Promise<void> => {
    await apiClient.delete(`/contacts/${contactId}`);
  },
};