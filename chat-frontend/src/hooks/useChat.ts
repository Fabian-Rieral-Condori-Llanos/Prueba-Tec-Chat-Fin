"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  setLoading,
  setError,
  setChats,
  addChat as addChatAction,
  updateChat as updateChatAction,
  removeChat as removeChatAction,
  setCurrentChat,
  updateChatUnreadCount,
} from "@/src/store/slices/chatsSlice";
import { chatApi } from "@/src/lib/api/chat.api";
import { CreateChatRequest } from "@/src/types/chat.types";

export function useChats() {
  const dispatch = useAppDispatch();
  const { chats, currentChat, isLoading, error } = useAppSelector(
    (state) => state.chats
  );

  const fetchChats = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await chatApi.getAllChats();
      dispatch(setChats(data));
      dispatch(setError(null));
    } catch (error: any) {
      dispatch(setError(error.response?.data?.message || "Failed to fetch chats"));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const createChat = useCallback(
    async (data: CreateChatRequest) => {
      try {
        dispatch(setLoading(true));
        const newChat = await chatApi.createChat(data);
        dispatch(addChatAction(newChat));
        dispatch(setError(null));
        return newChat;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Failed to create chat";
        dispatch(setError(errorMessage));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const selectChat = useCallback(
    async (chatId: number) => {
      try {
        const chat = await chatApi.getChat(chatId);
        dispatch(setCurrentChat(chat));
        // Resetear contador de no leídos
        dispatch(updateChatUnreadCount({ chatId, count: 0 }));
      } catch (error: any) {
        console.error("Failed to select chat:", error);
      }
    },
    [dispatch]
  );

  const leaveChat = useCallback(
    async (chatId: number) => {
      try {
        await chatApi.leaveChat(chatId);
        dispatch(removeChatAction(chatId));
        if (currentChat?.id === chatId) {
          dispatch(setCurrentChat(null));
        }
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch, currentChat]
  );

  const deleteChat = useCallback(
    async (chatId: number) => {
      try {
        await chatApi.deleteChat(chatId);
        dispatch(removeChatAction(chatId));
        if (currentChat?.id === chatId) {
          dispatch(setCurrentChat(null));
        }
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch, currentChat]
  );

  const updateGroupInfo = useCallback(
    async (chatId: number, data: Partial<CreateChatRequest>) => {
      try {
        const updatedChat = await chatApi.updateChat(chatId, data);
        dispatch(updateChatAction(updatedChat));
        if (currentChat?.id === chatId) {
          dispatch(setCurrentChat(updatedChat));
        }
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch, currentChat]
  );

  const addParticipants = useCallback(
    async (chatId: number, participantIds: number[]) => {
      try {
        const updatedChat = await chatApi.addParticipants(chatId, participantIds);
        dispatch(updateChatAction(updatedChat));
        if (currentChat?.id === chatId) {
          dispatch(setCurrentChat(updatedChat));
        }
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch, currentChat]
  );

  const removeParticipant = useCallback(
    async (chatId: number, participantId: number) => {
      try {
        const updatedChat = await chatApi.removeParticipant(chatId, participantId);
        dispatch(updateChatAction(updatedChat));
        if (currentChat?.id === chatId) {
          dispatch(setCurrentChat(updatedChat));
        }
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch, currentChat]
  );

  return {
    chats,
    currentChat,
    isLoading,
    error,
    fetchChats,
    createChat,
    selectChat,
    leaveChat,
    deleteChat,
    updateGroupInfo,
    addParticipants,
    removeParticipant,
  };
}