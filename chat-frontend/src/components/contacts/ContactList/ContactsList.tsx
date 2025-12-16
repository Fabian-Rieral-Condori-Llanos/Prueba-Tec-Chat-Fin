"use client";

import { useState } from "react";
import { Contact } from "@/src/types/contact.types";
import { ContactCard } from "../ContactCard/ContactCard";
import { Search, Filter } from "lucide-react";

interface ContactsListProps {
  contacts: Contact[];
  onChat?: (contact: Contact) => void;
}

export function ContactsList({ contacts, onChat }: ContactsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "favorites" | "blocked">("all");

  const filteredContacts = contacts.filter((contact) => {
    // Filtrar por búsqueda
    const matchesSearch =
      contact.contactUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.nickname?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtrar por categoría
    if (filter === "favorites" && !contact.isFavorite) return false;
    if (filter === "blocked" && !contact.isBlocked) return false;

    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Contacts</option>
            <option value="favorites">Favorites</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm
              ? "No contacts found matching your search"
              : "No contacts yet. Add your first contact!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} onChat={onChat} />
          ))}
        </div>
      )}
    </div>
  );
}