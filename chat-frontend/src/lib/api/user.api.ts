import { apiClient } from "./client";
import { User } from "@/src/types/auth.types";

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const userApi = {
  // Obtener perfil actual
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>("/users/me");
    return response.data;
  },

  // Obtener usuario por ID
  getUserById: async (userId: number): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  // Obtener usuario por username
  getUserByUsername: async (username: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/username/${username}`);
    return response.data;
  },

  // Buscar usuarios
  searchUsers: async (searchTerm: string): Promise<User[]> => {
    const response = await apiClient.get<User[]>("/users/search", {
      params: { q: searchTerm },
    });
    return response.data;
  },

  // Actualizar perfil
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put<User>("/users/me", data);
    return response.data;
  },

  // Cambiar contraseña
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.put("/users/me/password", data);
  },

  // Actualizar estado
  updateStatus: async (
    status: "ONLINE" | "OFFLINE" | "AWAY"
  ): Promise<User> => {
    const response = await apiClient.patch<User>("/users/me/status", null, {
      params: { status },
    });
    return response.data;
  },

  // Actualizar foto de perfil
  updateProfilePicture: async (pictureUrl: string): Promise<User> => {
    const response = await apiClient.patch<User>(
      "/users/me/profile-picture",
      null,
      {
        params: { pictureUrl },
      }
    );
    return response.data;
  },

  // Desactivar cuenta
  deactivateAccount: async (): Promise<void> => {
    await apiClient.delete("/users/me");
  },
};