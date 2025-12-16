"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { ChatList } from "@/src/components/chat/ChatList/ChatList";
import { ChatWindow } from "@/src/components/chat/ChatWindow/ChatWindow";
import { CreateChatModal } from "@/src/components/chat/CreateChatModal/CreateChatModal";
import { useChats } from "@/src/hooks/useChat";
import { useContacts } from "@/src/hooks/useContacts";
import { Chat } from "@/src/types/chat.types";

export default function ChatsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contactId = searchParams.get("contactId");

  const { currentChat, selectChat } = useChats();
  const { contacts, fetchContacts } = useContacts();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Si hay contactId en la URL, crear chat con ese contacto
  useEffect(() => {
    if (contactId && contacts.length > 0) {
      const contact = contacts.find(
        (c) => c.contactUserId === parseInt(contactId)
      );
      if (contact) {
        setShowCreateModal(true);
      }
    }
  }, [contactId, contacts]);

  const handleSelectChat = (chat: Chat) => {
    selectChat(chat.id);
  };

  const handleChatCreated = (chatId: number) => {
    selectChat(chatId);
    router.push("/chats");
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Chats</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <MessageSquarePlus className="h-5 w-5" />
          </button>
        </div>
        <ChatList
          onSelectChat={handleSelectChat}
          selectedChatId={currentChat?.id}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        {currentChat ? (
          <ChatWindow chat={currentChat} />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <MessageSquarePlus className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Chat Selected
              </h3>
              <p className="text-gray-600 mb-4">
                Select a chat from the list or create a new one
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Chat Modal */}
      <CreateChatModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
}