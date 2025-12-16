"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  setLoading,
  setError,
  setMessages,
  addMessage as addMessageAction,
  updateMessage as updateMessageAction,
  removeMessage as removeMessageAction,
} from "@/src/store/slices/messagesSlice";
import { messagesApi } from "@/src/lib/api/message.api";
import { SendMessageRequest } from "@/src/types/message.types";

export function useMessages(chatId?: number) {
  const dispatch = useAppDispatch();
  const { messagesByChatId, isLoading, error } = useAppSelector(
    (state) => state.messages
  );

  const messages = chatId ? messagesByChatId[chatId] || [] : [];

  const fetchMessages = useCallback(
    async (targetChatId: number, page: number = 0, size: number = 50) => {
      try {
        dispatch(setLoading(true));
        const data = await messagesApi.getChatMessages(targetChatId, page, size);
        // Invertir el orden para que el más reciente esté al final
        dispatch(
          setMessages({ chatId: targetChatId, messages: data.reverse() })
        );
        dispatch(setError(null));
      } catch (error: any) {
        dispatch(
          setError(error.response?.data?.message || "Failed to fetch messages")
        );
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const sendMessage = useCallback(
    async (data: SendMessageRequest) => {
      try {
        const message = await messagesApi.sendMessage(data);
        dispatch(addMessageAction(message));
        return message;
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      try {
        const message = await messagesApi.editMessage(messageId, content);
        dispatch(updateMessageAction(message));
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const deleteMessage = useCallback(
    async (targetChatId: number, messageId: string) => {
      try {
        await messagesApi.deleteMessage(messageId);
        dispatch(removeMessageAction({ chatId: targetChatId, messageId }));
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const markAsRead = useCallback(
    async (targetChatId: number, messageIds: string[]) => {
      try {
        await messagesApi.markAsRead(targetChatId, messageIds);
      } catch (error: any) {
        console.error("Failed to mark as read:", error);
      }
    },
    []
  );

  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        const message = await messagesApi.addReaction(messageId, emoji);
        dispatch(updateMessageAction(message));
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const removeReaction = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        const message = await messagesApi.removeReaction(messageId, emoji);
        dispatch(updateMessageAction(message));
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    addReaction,
    removeReaction,
  };
}