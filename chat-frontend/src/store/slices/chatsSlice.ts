import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Chat } from "@/src/types/chat.types";

interface ChatsState {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatsState = {
  chats: [],
  currentChat: null,
  isLoading: false,
  error: null,
};

const chatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      state.chats.unshift(action.payload);
    },
    updateChat: (state, action: PayloadAction<Chat>) => {
      const index = state.chats.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.chats[index] = action.payload;
      }
    },
    removeChat: (state, action: PayloadAction<number>) => {
      state.chats = state.chats.filter((c) => c.id !== action.payload);
    },
    setCurrentChat: (state, action: PayloadAction<Chat | null>) => {
      state.currentChat = action.payload;
    },
    updateChatUnreadCount: (
      state,
      action: PayloadAction<{ chatId: number; count: number }>
    ) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) {
        chat.unreadCount = action.payload.count;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setChats,
  addChat,
  updateChat,
  removeChat,
  setCurrentChat,
  updateChatUnreadCount,
} = chatsSlice.actions;

export default chatsSlice.reducer;