"use client";

import { useState, useEffect } from "react";
import { X, Users, User, Search } from "lucide-react";
import { useContacts } from "@/src/hooks/useContacts";
import { useChats } from "@/src/hooks/useChat";
import { Contact } from "@/src/types/contact.types";

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated?: (chatId: number) => void;
}

export function CreateChatModal({
  isOpen,
  onClose,
  onChatCreated,
}: CreateChatModalProps) {
  const { contacts, fetchContacts } = useContacts();
  const { createChat, isLoading } = useChats();
  const [chatType, setChatType] = useState<"PRIVATE" | "GROUP">("PRIVATE");
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen, fetchContacts]);

  if (!isOpen) return null;

  const filteredContacts = contacts.filter(
    (contact) =>
      !contact.isBlocked &&
      (contact.contactUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleContact = (contact: Contact) => {
    if (chatType === "PRIVATE") {
      setSelectedContacts([contact]);
    } else {
      const isSelected = selectedContacts.some((c) => c.id === contact.id);
      if (isSelected) {
        setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id));
      } else {
        setSelectedContacts([...selectedContacts, contact]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedContacts.length === 0) {
      alert("Please select at least one contact");
      return;
    }

    if (chatType === "GROUP" && !groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    try {
      const chat = await createChat({
        chatType,
        participantIds: selectedContacts.map((c) => c.contactUserId),
        name: chatType === "GROUP" ? groupName : undefined,
      });

      onChatCreated?.(chat.id);
      onClose();
      setSelectedContacts([]);
      setGroupName("");
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">New Chat</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Chat type selector */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setChatType("PRIVATE");
                  setSelectedContacts([]);
                }}
                className={`flex-1 p-4 rounded-lg border-2 transition ${
                  chatType === "PRIVATE"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <User className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="font-semibold">Private Chat</p>
                <p className="text-xs text-gray-600">1-on-1 conversation</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setChatType("GROUP");
                  setSelectedContacts([]);
                }}
                className={`flex-1 p-4 rounded-lg border-2 transition ${
                  chatType === "GROUP"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="font-semibold">Group Chat</p>
                <p className="text-xs text-gray-600">Multiple participants</p>
              </button>
            </div>
          </div>

          {/* Group name (only for groups) */}
          {chatType === "GROUP" && (
            <div className="p-6 border-b border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Search contacts */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Selected contacts */}
          {selectedContacts.length > 0 && (
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
              <p className="text-sm text-gray-600 mb-2">
                Selected ({selectedContacts.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedContacts.map((contact) => (
                  <span
                    key={contact.id}
                    className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {contact.contactUsername}
                    <button
                      type="button"
                      onClick={() => toggleContact(contact)}
                      className="ml-2 hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact list */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredContacts.length === 0 ? (
              <p className="text-center text-gray-500">No contacts found</p>
            ) : (
              <div className="space-y-2">
                {filteredContacts.map((contact) => {
                  const isSelected = selectedContacts.some(
                    (c) => c.id === contact.id
                  );
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => toggleContact(contact)}
                      className={`w-full p-3 rounded-lg border-2 transition text-left ${
                        isSelected
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                          {contact.contactUsername.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {contact.nickname || contact.contactUsername}
                          </p>
                          <p className="text-sm text-gray-500">
                            @{contact.contactUsername}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg
                              className="h-3 w-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedContacts.length === 0}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[48px]"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Chat"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}