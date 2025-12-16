"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { addMessage, updateMessage, setTypingIndicator } from "@/src/store/slices/messagesSlice";
import { getWebSocketClient } from "@/src/lib/websocket/client";
import { Message, TypingIndicator } from "@/src/types/message.types";

export function useWebSocket(chatId?: number) {
  const dispatch = useAppDispatch();
  const wsClientRef = useRef(getWebSocketClient());
  const { accessToken } = useAppSelector((state) => state.auth);
  const { user } = useAppSelector((state) => state.auth);

  // Conectar WebSocket
  useEffect(() => {
    if (accessToken && !wsClientRef.current.isConnected()) {
      wsClientRef.current.connect(
        accessToken,
        () => {
          console.log("WebSocket connected successfully");
        },
        (error) => {
          console.error("WebSocket connection error:", error);
        }
      );
    }

    return () => {
      // No desconectar aquí, mantener la conexión activa
    };
  }, [accessToken]);

  // Suscribirse al chat actual
  useEffect(() => {
    if (chatId && wsClientRef.current.isConnected()) {
      // Suscribirse a nuevos mensajes
      wsClientRef.current.subscribeToChat(chatId, (message: Message) => {
        dispatch(addMessage(message));
      });

      // Suscribirse a indicadores de escritura
      wsClientRef.current.subscribeToTyping(chatId, (indicator: TypingIndicator) => {
        // No mostrar el indicador del usuario actual
        if (indicator.userId !== user?.id) {
          dispatch(setTypingIndicator({ chatId, indicator }));
        }
      });

      // Suscribirse a ediciones
      wsClientRef.current.subscribeToEdits(chatId, (message: Message) => {
        dispatch(updateMessage(message));
      });

      // Suscribirse a eliminaciones
      wsClientRef.current.subscribeToDeletes(chatId, (messageId: string) => {
        // Marcar como eliminado en lugar de remover
        dispatch(
          updateMessage({
            id: messageId,
            isDeleted: true,
          } as Message)
        );
      });

      // Suscribirse a reacciones
      wsClientRef.current.subscribeToReactions(chatId, (message: Message) => {
        dispatch(updateMessage(message));
      });

      return () => {
        wsClientRef.current.unsubscribeFromChat(chatId);
      };
    }
  }, [chatId, dispatch, user?.id]);

  const sendMessage = useCallback(
    (data: any) => {
      wsClientRef.current.sendMessage(data);
    },
    []
  );

  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (chatId) {
        wsClientRef.current.sendTypingIndicator(chatId, isTyping);
      }
    },
    [chatId]
  );

  return {
    sendMessage,
    sendTypingIndicator,
    isConnected: wsClientRef.current.isConnected(),
  };
}