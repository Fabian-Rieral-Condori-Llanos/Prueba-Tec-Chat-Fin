"use client";

import { useState } from "react";
import { Message } from "@/src/types/message.types";
import { format } from "date-fns";
import { MoreVertical, Edit, Trash2, Reply, Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onReply?: (message: Message) => void;
  onReact?: (message: Message, emoji: string) => void;
}

export function MessageBubble({
  message,
  isOwnMessage,
  onEdit,
  onDelete,
  onReply,
  onReact,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const reactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
        <div className="max-w-xs lg:max-w-md">
          <p className="text-sm text-gray-400 italic">This message was deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}>
      <div className="max-w-xs lg:max-w-md">
        {/* Sender name (only for received messages) */}
        {!isOwnMessage && (
          <p className="text-xs text-gray-500 mb-1">{message.senderUsername}</p>
        )}

        {/* Message bubble */}
        <div className="relative group">
          <div
            className={`rounded-lg px-4 py-2 ${
              isOwnMessage
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-900"
            }`}
          >
            <p className="break-words">{message.content}</p>

            {/* Edited indicator */}
            {message.editedAt && (
              <span className="text-xs opacity-70 ml-2">(edited)</span>
            )}
          </div>

          {/* Timestamp and read status */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">
              {format(new Date(message.sentAt), "HH:mm")}
            </span>
            {isOwnMessage && (
              <span className="ml-2">
                {message.readBy && message.readBy.length > 0 ? (
                  <CheckCheck className="h-4 w-4 text-blue-600" />
                ) : (
                  <Check className="h-4 w-4 text-gray-400" />
                )}
              </span>
            )}
          </div>

          {/* Actions menu */}
          <div className="absolute top-0 -right-8 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      setShowReactions(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    React
                  </button>
                  {onReply && (
                    <button
                      onClick={() => {
                        onReply(message);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Reply className="h-4 w-4" />
                      <span>Reply</span>
                    </button>
                  )}
                  {isOwnMessage && onEdit && (
                    <button
                      onClick={() => {
                        onEdit(message);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  {isOwnMessage && onDelete && (
                    <button
                      onClick={() => {
                        onDelete(message);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {message.reactions.map((reaction, idx) => (
              <span
                key={idx}
                className="text-xs bg-white border border-gray-200 rounded-full px-2 py-1"
              >
                {reaction.emoji}
              </span>
            ))}
          </div>
        )}

        {/* Reaction picker */}
        {showReactions && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowReactions(false)}
            ></div>
            <div className="absolute mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-2 z-20">
              {reactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact?.(message, emoji);
                    setShowReactions(false);
                  }}
                  className="text-xl hover:scale-125 transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}