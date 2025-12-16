"use client";

import { useEffect, useState } from "react";
import { Chat } from "@/src/types/chat.types";
import { Message } from "@/src/types/message.types";
import { MessageList } from "../MessageList/MessageList";
import { MessageInput } from "../MessageInput/MessageInput";
import { useMessages } from "@/src/hooks/useMessages";
import { useWebSocket } from "@/src/hooks/useWebSocket";
import { useAppSelector } from "@/src/store/hooks";
import { Phone, Video, MoreVertical, Users, User } from "lucide-react";

interface ChatWindowProps {
  chat: Chat;
}

export function ChatWindow({ chat }: ChatWindowProps) {
  const { user } = useAppSelector((state) => state.auth);
  const { messages, fetchMessages, editMessage, deleteMessage, addReaction } =
    useMessages(chat.id);
  const { sendMessage, sendTypingIndicator } = useWebSocket(chat.id);
  const typingUsers = useAppSelector(
    (state) => state.messages.typingUsers[chat.id] || []
  );

  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages(chat.id);
  }, [chat.id, fetchMessages]);

  const handleSendMessage = (content: string) => {
    if (!user) return;

    const messageData = {
      chatId: chat.id,
      content,
      messageType: "TEXT",
      replyTo: replyingTo?.id,
    };

    // Enviar via WebSocket para tiempo real
    sendMessage(messageData);

    // Limpiar reply
    setReplyingTo(null);
  };

  const handleEdit = async (message: Message) => {
    setEditingMessage(message);
    // Implementar UI de edición
  };

  const handleDelete = async (message: Message) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteMessage(chat.id, message.id);
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleReact = async (message: Message, emoji: string) => {
    try {
      await addReaction(message.id, emoji);
    } catch (error) {
      console.error("Failed to add reaction:", error);
    }
  };

  const getChatName = () => {
    if (chat.chatType === "GROUP") {
      return chat.name || "Group Chat";
    }
    const otherParticipant = chat.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.username || "Unknown";
  };

  const getChatAvatar = () => {
    if (chat.chatType === "GROUP") {
      return <Users className="h-6 w-6 text-white" />;
    }
    return <User className="h-6 w-6 text-white" />;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
            {getChatAvatar()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{getChatName()}</h2>
            <p className="text-sm text-gray-500">
              {chat.participants.length} participants
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Phone className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Video className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={user?.id || 0}
        typingUsers={typingUsers.map((t) => t.username)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReply={handleReply}
        onReact={handleReact}
      />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={sendTypingIndicator}
        replyTo={
          replyingTo
            ? {
                id: replyingTo.id,
                content: replyingTo.content,
                username: replyingTo.senderUsername,
              }
            : null
        }
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
}