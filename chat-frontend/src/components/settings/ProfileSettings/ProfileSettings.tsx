"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { userApi, UpdateProfileRequest } from "@/src/lib/api/user.api";
import { Input } from "@/src/components/common/Input/Input";
import { User, Mail, Phone, Camera, AlertCircle, CheckCircle } from "lucide-react";
import { updateUser } from "@/src/store/slices/authSlice";
import { useAppDispatch } from "@/src/store/hooks";

export function ProfileSettings() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<UpdateProfileRequest>({
    username: user?.username || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const [status, setStatus] = useState<"ONLINE" | "OFFLINE" | "AWAY">(
    user?.status || "ONLINE"
  );

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
      setStatus(user.status);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setMessage(null);

      const updatedUser = await userApi.updateProfile(formData);
      dispatch(updateUser(updatedUser));

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: "ONLINE" | "OFFLINE" | "AWAY") => {
    try {
      const updatedUser = await userApi.updateStatus(newStatus);
      dispatch(updateUser(updatedUser));
      setStatus(newStatus);
      setMessage({ type: "success", text: "Status updated successfully!" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update status" });
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-gray-600 mt-1">
          Update your personal information and profile picture
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-start ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          )}
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-800" : "text-red-800"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Profile Picture */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border-2 border-gray-200 hover:bg-gray-50 transition">
            <Camera className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{user?.username}</h3>
          <p className="text-sm text-gray-600">{user?.email}</p>
          <button className="text-sm text-blue-600 hover:text-blue-700 mt-1">
            Change profile picture
          </button>
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <div className="flex space-x-3">
          {[
            { value: "ONLINE", label: "Online", color: "green" },
            { value: "AWAY", label: "Away", color: "yellow" },
            { value: "OFFLINE", label: "Offline", color: "gray" },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() =>
                handleStatusChange(s.value as "ONLINE" | "OFFLINE" | "AWAY")
              }
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition ${
                status === s.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span
                className={`h-3 w-3 rounded-full bg-${s.color}-500`}
              ></span>
              <span className="text-sm font-medium">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <Input
          label="Username"
          type="text"
          icon={User}
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          disabled={!isEditing}
        />

        <Input
          label="Email"
          type="email"
          icon={Mail}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={!isEditing}
        />

        <Input
          label="Phone Number"
          type="tel"
          icon={Phone}
          value={formData.phoneNumber || ""}
          onChange={(e) =>
            setFormData({ ...formData, phoneNumber: e.target.value })
          }
          disabled={!isEditing}
          placeholder="+1234567890"
        />
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-4">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[48px]"
            >
              {isSaving ? (
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}