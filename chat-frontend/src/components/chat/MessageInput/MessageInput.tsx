"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, X } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  replyTo?: { id: string; content: string; username: string } | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  onTyping,
  replyTo,
  onCancelReply,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleTyping = (value: string) => {
    setMessage(value);

    // Indicador de escritura
    if (onTyping) {
      if (value.length > 0 && !isTyping) {
        setIsTyping(true);
        onTyping(true);
      }

      // Limpiar timeout anterior
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Nuevo timeout para dejar de escribir
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      setIsTyping(false);
      
      if (onTyping) {
        onTyping(false);
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Reply indicator */}
      {replyTo && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500">
              Replying to {replyTo.username}
            </p>
            <p className="text-sm text-gray-700 truncate">{replyTo.content}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end space-x-2">
          {/* Attachments button */}
          <button
            type="button"
            disabled={disabled}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Emoji button */}
          <button
            type="button"
            disabled={disabled}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <Smile className="h-5 w-5" />
          </button>

          {/* Send button */}
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}