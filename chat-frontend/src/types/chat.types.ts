import { Message } from "./message.types";

export interface Chat {
  id: number;
  chatType: "PRIVATE" | "GROUP";
  name?: string;
  description?: string;
  pictureUrl?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface Participant {
  userId: number;
  username: string;
  profilePictureUrl?: string;
  role: "ADMIN" | "MEMBER";
  isActive: boolean;
  joinedAt: string;
}

export interface CreateChatRequest {
  chatType: "PRIVATE" | "GROUP";
  participantIds: number[];
  name?: string;
  description?: string;
  pictureUrl?: string;
}