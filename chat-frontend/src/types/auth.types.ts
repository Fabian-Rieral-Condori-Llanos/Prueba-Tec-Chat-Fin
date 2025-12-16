export interface User {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  status: "ONLINE" | "OFFLINE" | "AWAY";
  lastSeen?: string;
  createdAt: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
  deviceId?: string;
  deviceType?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  expiresIn: number;
}