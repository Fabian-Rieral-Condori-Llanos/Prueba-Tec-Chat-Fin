"use client";

import { useState } from "react";
import { User, Lock, Bell, Shield, Palette } from "lucide-react";
import { ProfileSettings } from "@/src/components/settings/ProfileSettings/ProfileSettings";
import { SecuritySettings } from "@/src/components/settings/SecuritySettings/SecuritySettings";
import { NotificationSettings } from "@/src/components/settings/NotificationSettings/NotificationSettings";
import { PrivacySettings } from "@/src/components/settings/PrivacySettings/PrivacySettings";
import { AppearanceSettings } from "@/src/components/settings/AppearanceSettings/AppearanceSettings";

type SettingsTab = "profile" | "security" | "notifications" | "privacy" | "appearance";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const tabs = [
    {
      id: "profile" as const,
      label: "Profile",
      icon: User,
      component: ProfileSettings,
    },
    {
      id: "security" as const,
      label: "Security",
      icon: Lock,
      component: SecuritySettings,
    },
    {
      id: "notifications" as const,
      label: "Notifications",
      icon: Bell,
      component: NotificationSettings,
    },
    {
      id: "privacy" as const,
      label: "Privacy",
      icon: Shield,
      component: PrivacySettings,
    },
    {
      id: "appearance" as const,
      label: "Appearance",
      icon: Palette,
      component: AppearanceSettings,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 md:p-8">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </div>
    </div>
  );
}