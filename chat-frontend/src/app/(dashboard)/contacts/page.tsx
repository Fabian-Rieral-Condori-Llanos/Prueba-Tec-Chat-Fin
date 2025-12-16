"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Users, Star, Ban } from "lucide-react";
import { useContacts } from "@/src/hooks/useContacts";
import { ContactsList } from "@/src/components/contacts/ContactList/ContactsList";
import { AddContactModal } from "@/src/components/contacts/AddContactModal/AddContactModal";
import { Contact } from "@/src/types/contact.types";

export default function ContactsPage() {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "favorites" | "blocked">(
    "all"
  );

  const {
    contacts,
    favorites,
    blocked,
    isLoading,
    fetchContacts,
    fetchFavorites,
    fetchBlocked,
  } = useContacts();

  useEffect(() => {
    fetchContacts();
    fetchFavorites();
    fetchBlocked();
  }, [fetchContacts, fetchFavorites, fetchBlocked]);

  const handleStartChat = (contact: Contact) => {
    router.push(`/chats?contactId=${contact.contactUserId}`);
  };

  const getContactsToDisplay = () => {
    switch (activeTab) {
      case "favorites":
        return favorites;
      case "blocked":
        return blocked;
      default:
        return contacts;
    }
  };

  const tabs = [
    {
      id: "all" as const,
      label: "All Contacts",
      icon: Users,
      count: contacts.length,
    },
    {
      id: "favorites" as const,
      label: "Favorites",
      icon: Star,
      count: favorites.length,
    },
    {
      id: "blocked" as const,
      label: "Blocked",
      icon: Ban,
      count: blocked.length,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600 mt-1">
              Manage your contacts and connections
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <UserPlus className="h-5 w-5" />
            <span>Add Contact</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 rounded-lg border-2 transition ${
                  activeTab === tab.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        activeTab === tab.id ? "bg-blue-600" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          activeTab === tab.id ? "text-white" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">{tab.label}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {tab.count}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contacts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ContactsList
          contacts={getContactsToDisplay()}
          onChat={handleStartChat}
        />
      )}

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}