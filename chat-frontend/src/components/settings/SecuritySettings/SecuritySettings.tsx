"use client";

import { useState } from "react";
import { Input } from "@/src/components/common/Input/Input";
import { Lock, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { userApi, ChangePasswordRequest } from "@/src/lib/api/user.api";
import { useAuth } from "@/src/hooks/useAuth";

export function SecuritySettings() {
  const { logout } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    currentPassword: "",
    newPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    try {
      setIsSaving(true);
      setMessage(null);

      // Validaciones
      if (passwordData.newPassword.length < 6) {
        setMessage({
          type: "error",
          text: "New password must be at least 6 characters",
        });
        return;
      }

      if (passwordData.newPassword !== confirmPassword) {
        setMessage({ type: "error", text: "Passwords don't match" });
        return;
      }

      await userApi.changePassword(passwordData);

      setMessage({
        type: "success",
        text: "Password changed successfully! Please login again.",
      });
      
      // Limpiar formulario
      setPasswordData({ currentPassword: "", newPassword: "" });
      setConfirmPassword("");
      setIsChangingPassword(false);

      // Logout después de 2 segundos
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to change password",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to deactivate your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await userApi.deactivateAccount();
      logout();
    } catch (error) {
      setMessage({ type: "error", text: "Failed to deactivate account" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
        <p className="text-gray-600 mt-1">
          Manage your password and account security
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

      {/* Change Password */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Change Password
        </h3>

        {!isChangingPassword ? (
          <button
            onClick={() => setIsChangingPassword(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Change your password
          </button>
        ) : (
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              icon={Lock}
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              placeholder="Enter current password"
            />

            <Input
              label="New Password"
              type="password"
              icon={Lock}
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              placeholder="Enter new password"
            />

            <Input
              label="Confirm New Password"
              type="password"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({ currentPassword: "", newPassword: "" });
                  setConfirmPassword("");
                  setMessage(null);
                }}
                disabled={isSaving}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
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
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Two-Factor Authentication */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Two-Factor Authentication
        </h3>
        <p className="text-gray-600 mb-4">
          Add an extra layer of security to your account
        </p>
        <button className="text-blue-600 hover:text-blue-700 font-medium">
          Enable 2FA (Coming Soon)
        </button>
      </div>

      {/* Deactivate Account */}
      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <div className="flex items-start">
          <Trash2 className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Deactivate Account
            </h3>
            <p className="text-red-700 mb-4">
              Once you deactivate your account, there is no going back. Please
              be certain.
            </p>
            <button
              onClick={handleDeactivateAccount}
              className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition"
            >
              Deactivate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}