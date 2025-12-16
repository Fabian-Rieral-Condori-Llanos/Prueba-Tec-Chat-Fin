"use client";

import { useState } from "react";
import {
  MoreVertical,
  MessageCircle,
  Star,
  Edit,
  Trash2,
  Ban,
  Shield,
} from "lucide-react";
import { Contact } from "@/src/types/contact.types";
import { useContacts } from "@/src/hooks/useContacts";

interface ContactCardProps {
  contact: Contact;
  onChat?: (contact: Contact) => void;
}

export function ContactCard({ contact, onChat }: ContactCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(contact.nickname || "");
  const { toggleFavorite, toggleBlock, deleteContact, updateNickname } =
    useContacts();

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(contact.id, contact.isFavorite);
      setShowMenu(false);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  const handleToggleBlock = async () => {
    try {
      await toggleBlock(contact.id, contact.isBlocked);
      setShowMenu(false);
    } catch (error) {
      console.error("Failed to toggle block:", error);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${contact.contactUsername}?`)) {
      try {
        await deleteContact(contact.id);
      } catch (error) {
        console.error("Failed to delete contact:", error);
      }
    }
    setShowMenu(false);
  };

  const handleSaveNickname = async () => {
    try {
      await updateNickname(contact.id, nickname);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update nickname:", error);
    }
  };

  const getStatusColor = () => {
    switch (contact.contactStatus) {
      case "ONLINE":
        return "bg-green-500";
      case "AWAY":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {/* Avatar */}
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
              {contact.contactUsername.charAt(0).toUpperCase()}
            </div>
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor()}`}
            ></span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Nickname"
                  />
                  <button
                    onClick={handleSaveNickname}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNickname(contact.nickname || "");
                    }}
                    className="text-xs text-gray-600 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-900 truncate">
                    {contact.nickname || contact.contactUsername}
                  </h3>
                  {contact.isFavorite && (
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  )}
                  {contact.isBlocked && (
                    <Ban className="h-4 w-4 text-red-500" />
                  )}
                </>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">
              @{contact.contactUsername}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {contact.contactEmail}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onChat && onChat(contact)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Start chat"
          >
            <MessageCircle className="h-5 w-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Nickname</span>
                  </button>

                  <button
                    onClick={handleToggleFavorite}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Star className="h-4 w-4" />
                    <span>
                      {contact.isFavorite
                        ? "Remove from Favorites"
                        : "Add to Favorites"}
                    </span>
                  </button>

                  <button
                    onClick={handleToggleBlock}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>
                      {contact.isBlocked ? "Unblock Contact" : "Block Contact"}
                    </span>
                  </button>

                  <hr className="my-1" />

                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Contact</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}