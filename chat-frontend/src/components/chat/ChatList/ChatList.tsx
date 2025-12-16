"use client";

import { useEffect, useState } from "react";
import { useChats } from "@/src/hooks/useChat";
import { Chat } from "@/src/types/chat.types";
import { formatDistanceToNow } from "date-fns";
import { Users, User, Search } from "lucide-react";

interface ChatListProps {
  onSelectChat: (chat: Chat) => void;
  selectedChatId?: number;
}

export function ChatList({ onSelectChat, selectedChatId }: ChatListProps) {
  const { chats, isLoading, fetchChats } = useChats();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const filteredChats = chats.filter((chat) => {
    const name =
      chat.chatType === "GROUP"
        ? chat.name
        : chat.participants.find((p) => p.userId !== selectedChatId)?.username;
    return name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getChatName = (chat: Chat, currentUserId?: number) => {
    if (chat.chatType === "GROUP") {
      return chat.name || "Group Chat";
    }
    const otherParticipant = chat.participants.find(
      (p) => p.userId !== currentUserId
    );
    return otherParticipant?.username || "Unknown";
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.chatType === "GROUP") {
      return <Users className="h-6 w-6 text-white" />;
    }
    return <User className="h-6 w-6 text-white" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <p>No chats found</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition border-b border-gray-100 ${
                selectedChatId === chat.id ? "bg-blue-50" : ""
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                  {getChatAvatar(chat)}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {getChatName(chat)}
                  </h3>
                  {chat.lastMessage && (
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatDistanceToNow(new Date(chat.lastMessage.sentAt), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage?.content || "No messages yet"}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-2 flex-shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}