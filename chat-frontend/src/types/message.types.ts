export interface Message {
  id: string;
  chatId: number;
  senderId: number;
  senderUsername: string;
  senderProfilePicture?: string;
  content: string;
  messageType: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE";
  metadata?: FileMetadata;
  replyTo?: string;
  sentAt: string;
  editedAt?: string;
  isDeleted: boolean;
  reactions: Reaction[];
  readBy: ReadReceipt[];
  isRead: boolean;
}

export interface FileMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  thumbnailUrl?: string;
}

export interface Reaction {
  userId: number;
  username: string;
  emoji: string;
  createdAt: string;
}

export interface ReadReceipt {
  userId: number;
  username: string;
  readAt: string;
}

export interface SendMessageRequest {
  chatId: number;
  content: string;
  messageType?: string;
  replyTo?: string;
  metadata?: FileMetadata;
}

export interface TypingIndicator {
  userId: number;
  username: string;
  isTyping: boolean;
}