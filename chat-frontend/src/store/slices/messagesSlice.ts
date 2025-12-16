import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Message, TypingIndicator } from "@/src/types/message.types";

interface MessagesState {
  messagesByChatId: Record<number, Message[]>;
  isLoading: boolean;
  error: string | null;
  typingUsers: Record<number, TypingIndicator[]>;
}

const initialState: MessagesState = {
  messagesByChatId: {},
  isLoading: false,
  error: null,
  typingUsers: {},
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setMessages: (
      state,
      action: PayloadAction<{ chatId: number; messages: Message[] }>
    ) => {
      state.messagesByChatId[action.payload.chatId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const chatId = action.payload.chatId;
      if (!state.messagesByChatId[chatId]) {
        state.messagesByChatId[chatId] = [];
      }
      // Evitar duplicados
      const exists = state.messagesByChatId[chatId].some(
        (m) => m.id === action.payload.id
      );
      if (!exists) {
        state.messagesByChatId[chatId].push(action.payload);
      }
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      const chatId = action.payload.chatId;
      if (state.messagesByChatId[chatId]) {
        const index = state.messagesByChatId[chatId].findIndex(
          (m) => m.id === action.payload.id
        );
        if (index !== -1) {
          state.messagesByChatId[chatId][index] = action.payload;
        }
      }
    },
    removeMessage: (
      state,
      action: PayloadAction<{ chatId: number; messageId: string }>
    ) => {
      const { chatId, messageId } = action.payload;
      if (state.messagesByChatId[chatId]) {
        state.messagesByChatId[chatId] = state.messagesByChatId[chatId].filter(
          (m) => m.id !== messageId
        );
      }
    },
    setTypingIndicator: (
      state,
      action: PayloadAction<{ chatId: number; indicator: TypingIndicator }>
    ) => {
      const { chatId, indicator } = action.payload;
      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = [];
      }

      if (indicator.isTyping) {
        // Agregar o actualizar
        const existing = state.typingUsers[chatId].find(
          (t) => t.userId === indicator.userId
        );
        if (!existing) {
          state.typingUsers[chatId].push(indicator);
        }
      } else {
        // Remover
        state.typingUsers[chatId] = state.typingUsers[chatId].filter(
          (t) => t.userId !== indicator.userId
        );
      }
    },
    clearTypingIndicators: (state, action: PayloadAction<number>) => {
      state.typingUsers[action.payload] = [];
    },
  },
});

export const {
  setLoading,
  setError,
  setMessages,
  addMessage,
  updateMessage,
  removeMessage,
  setTypingIndicator,
  clearTypingIndicators,
} = messagesSlice.actions;

export default messagesSlice.reducer;