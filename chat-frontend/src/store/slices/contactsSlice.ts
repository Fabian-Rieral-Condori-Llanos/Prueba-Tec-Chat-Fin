import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Contact } from "@/src/types/contact.types";

interface ContactsState {
  contacts: Contact[];
  favorites: Contact[];
  blocked: Contact[];
  isLoading: boolean;
  error: string | null;
  searchResults: Contact[];
}

const initialState: ContactsState = {
  contacts: [],
  favorites: [],
  blocked: [],
  isLoading: false,
  error: null,
  searchResults: [],
};

const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setContacts: (state, action: PayloadAction<Contact[]>) => {
      state.contacts = action.payload;
    },
    setFavorites: (state, action: PayloadAction<Contact[]>) => {
      state.favorites = action.payload;
    },
    setBlocked: (state, action: PayloadAction<Contact[]>) => {
      state.blocked = action.payload;
    },
    addContact: (state, action: PayloadAction<Contact>) => {
      state.contacts.push(action.payload);
    },
    updateContact: (state, action: PayloadAction<Contact>) => {
      const index = state.contacts.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.contacts[index] = action.payload;
      }
    },
    removeContact: (state, action: PayloadAction<number>) => {
      state.contacts = state.contacts.filter((c) => c.id !== action.payload);
    },
    setSearchResults: (state, action: PayloadAction<Contact[]>) => {
      state.searchResults = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
});

export const {
  setLoading,
  setError,
  setContacts,
  setFavorites,
  setBlocked,
  addContact,
  updateContact,
  removeContact,
  setSearchResults,
  clearSearchResults,
} = contactsSlice.actions;

export default contactsSlice.reducer;