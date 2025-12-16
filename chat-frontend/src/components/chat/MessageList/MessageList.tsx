"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/src/types/message.types";
import { MessageBubble } from "../MessageBubble/MessageBubble";
import { format } from "date-fns";

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  typingUsers?: string[];
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onReply?: (message: Message) => void;
  onReact?: (message: Message, emoji: string) => void;
}

export function MessageList({
  messages,
  currentUserId,
  typingUsers = [],
  onEdit,
  onDelete,
  onReply,
  onReact,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = format(new Date(message.sentAt), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {Object.keys(groupedMessages).length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <>
          {Object.keys(groupedMessages)
            .sort()
            .map((date) => (
              <div key={date}>
                {/* Date divider */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {format(new Date(date), "MMMM d, yyyy")}
                  </div>
                </div>

                {/* Messages for this date */}
                {groupedMessages[date].map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={message.senderId === currentUserId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReply={onReply}
                    onReact={onReact}
                  />
                ))}
              </div>
            ))}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span className="text-sm">
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers.length} people are typing...`}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}