"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  setLoading,
  setError,
  setContacts,
  setFavorites,
  setBlocked,
  addContact as addContactAction,
  updateContact as updateContactAction,
  removeContact as removeContactAction,
  setSearchResults,
  clearSearchResults,
} from "@/src/store/slices/contactsSlice";
import { contactsApi } from "@/src/lib/api/contacts.api";
import { AddContactRequest } from "@/src/types/contact.types";

export function useContacts() {
  const dispatch = useAppDispatch();
  const { contacts, favorites, blocked, isLoading, error, searchResults } =
    useAppSelector((state) => state.contacts);

  const fetchContacts = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await contactsApi.getAllContacts();
      dispatch(setContacts(data));
      dispatch(setError(null));
    } catch (error: any) {
      dispatch(setError(error.response?.data?.message || "Failed to fetch contacts"));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const fetchFavorites = useCallback(async () => {
    try {
      const data = await contactsApi.getFavoriteContacts();
      dispatch(setFavorites(data));
    } catch (error: any) {
      console.error("Failed to fetch favorites:", error);
    }
  }, [dispatch]);

  const fetchBlocked = useCallback(async () => {
    try {
      const data = await contactsApi.getBlockedContacts();
      dispatch(setBlocked(data));
    } catch (error: any) {
      console.error("Failed to fetch blocked contacts:", error);
    }
  }, [dispatch]);

  const addContact = useCallback(
    async (data: AddContactRequest) => {
      try {
        dispatch(setLoading(true));
        const newContact = await contactsApi.addContactByUsername(data);
        dispatch(addContactAction(newContact));
        dispatch(setError(null));
        return newContact;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Failed to add contact";
        dispatch(setError(errorMessage));
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const updateNickname = useCallback(
    async (contactId: number, nickname: string) => {
      try {
        const updatedContact = await contactsApi.updateNickname(contactId, nickname);
        dispatch(updateContactAction(updatedContact));
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const toggleFavorite = useCallback(
    async (contactId: number, isFavorite: boolean) => {
      try {
        const updatedContact = isFavorite
          ? await contactsApi.unmarkAsFavorite(contactId)
          : await contactsApi.markAsFavorite(contactId);
        dispatch(updateContactAction(updatedContact));
        await fetchFavorites();
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch, fetchFavorites]
  );

  const toggleBlock = useCallback(
    async (contactId: number, isBlocked: boolean) => {
      try {
        const updatedContact = isBlocked
          ? await contactsApi.unblockContact(contactId)
          : await contactsApi.blockContact(contactId);
        dispatch(updateContactAction(updatedContact));
        await fetchBlocked();
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch, fetchBlocked]
  );

  const deleteContact = useCallback(
    async (contactId: number) => {
      try {
        await contactsApi.deleteContact(contactId);
        dispatch(removeContactAction(contactId));
      } catch (error: any) {
        throw error;
      }
    },
    [dispatch]
  );

  const searchContact = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        dispatch(clearSearchResults());
        return;
      }

      try {
        const results = await contactsApi.searchContacts(searchTerm);
        dispatch(setSearchResults(results));
      } catch (error: any) {
        console.error("Search error:", error);
      }
    },
    [dispatch]
  );

  return {
    contacts,
    favorites,
    blocked,
    isLoading,
    error,
    searchResults,
    fetchContacts,
    fetchFavorites,
    fetchBlocked,
    addContact,
    updateNickname,
    toggleFavorite,
    toggleBlock,
    deleteContact,
    searchContact,
    clearSearchResults: () => dispatch(clearSearchResults()),
  };
}