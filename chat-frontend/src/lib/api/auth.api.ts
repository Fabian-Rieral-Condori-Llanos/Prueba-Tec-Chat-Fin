import { apiClient } from "./client";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "@/src/types/auth.types";

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  logout: async (userId: number, deviceId?: string): Promise<void> => {
    await apiClient.post("/auth/logout", null, {
      params: { userId, deviceId },
    });
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>("/users/me");
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/refresh-token", {
      refreshToken,
    });
    return response.data;
  },
};