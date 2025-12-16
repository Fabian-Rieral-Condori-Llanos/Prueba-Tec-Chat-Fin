"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
} from "@/src/store/slices/authSlice";
import { authApi } from "@/src/lib/api/auth.api";
import { LoginRequest, RegisterRequest } from "@/src/types/auth.types";

// Función auxiliar para guardar tokens en cookies
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// Función auxiliar para eliminar cookies
const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        dispatch(loginStart());
        const response = await authApi.login(credentials);

        dispatch(
          loginSuccess({
            user: {
              id: response.userId,
              username: response.username,
              email: response.email,
              profilePictureUrl: response.profilePictureUrl,
              status: "ONLINE",
              createdAt: ""
            },
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          })
        );

        // Guardar tokens en localStorage Y cookies
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);

          // Guardar en cookies para que el middleware pueda acceder
          setCookie("accessToken", response.accessToken, 7);
          setCookie("refreshToken", response.refreshToken, 7);
        }

        router.push("/chats");
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          "Login failed. Please check your credentials.";
        dispatch(loginFailure(errorMessage));
        throw error;
      }
    },
    [dispatch, router]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        dispatch(loginStart());
        const response = await authApi.register(data);

        dispatch(
          loginSuccess({
            user: {
              id: response.userId,
              username: response.username,
              email: response.email,
              profilePictureUrl: response.profilePictureUrl,
              status: "ONLINE",
              createdAt: ""
            },
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          })
        );

        // Guardar tokens en localStorage Y cookies
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);

          // Guardar en cookies para que el middleware pueda acceder
          setCookie("accessToken", response.accessToken, 7);
          setCookie("refreshToken", response.refreshToken, 7);
        }

        router.push("/chats");
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          "Registration failed. Please try again.";
        dispatch(loginFailure(errorMessage));
        throw error;
      }
    },
    [dispatch, router]
  );

  const logout = useCallback(async () => {
    try {
      if (user) {
        await authApi.logout(user.id);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logoutAction());
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Eliminar cookies
        deleteCookie("accessToken");
        deleteCookie("refreshToken");
      }
      router.push("/login");
    }
  }, [dispatch, router, user]);

  const checkAuth = useCallback(async () => {
    if (isAuthenticated && user) {
      return;
    }

    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const userData = await authApi.getCurrentUser();
          dispatch(
            loginSuccess({
              user: userData,
              accessToken: token,
              refreshToken: localStorage.getItem("refreshToken") || "",
            })
          );
        }
      }
    } catch (error) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        deleteCookie("accessToken");
        deleteCookie("refreshToken");
      }
      dispatch(logoutAction());
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
  };
}