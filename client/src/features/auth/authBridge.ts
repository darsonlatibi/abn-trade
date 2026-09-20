import type { AuthUser } from "./authSlice";

/* =========================================================
   ABN FLEET SYSTEM
   AUTH BRIDGE
   ========================================================= */

interface AuthBridge {
  /* =======================================================
     ACCESS TOKEN
     ======================================================= */

  getAccessToken: () => string | null;

  setAccessToken: (token: string) => void;

  /* =======================================================
     CLEAR AUTH
     ======================================================= */

  clearAuth: () => void;

  /* =======================================================
     AUTH STATUS
     ======================================================= */

  getAuthenticated: () => boolean;

  getInitialized: () => boolean;

  /* =======================================================
     USER
     ======================================================= */

  getUser: () => AuthUser | null;
}

/* =========================================================
   BRIDGE INSTANCE
   ========================================================= */

let bridge: AuthBridge | null = null;

/* =========================================================
   REGISTER AUTH BRIDGE
   ========================================================= */

export const registerAuthBridge = (authBridge: AuthBridge): void => {
  bridge = authBridge;
};

/* =========================================================
   GET ACCESS TOKEN
   ========================================================= */

export const getAccessToken = (): string | null => {
  return bridge?.getAccessToken() ?? null;
};

/* =========================================================
   SET ACCESS TOKEN
   ========================================================= */

export const setAccessToken = (token: string): void => {
  bridge?.setAccessToken(token);
};

/* =========================================================
   CLEAR AUTH
   ========================================================= */

export const clearAuthState = (): void => {
  bridge?.clearAuth();
};

/* =========================================================
   GET AUTHENTICATED
   ========================================================= */

export const getAuthenticated = (): boolean => {
  return bridge?.getAuthenticated() ?? false;
};

/* =========================================================
   GET INITIALIZED
   ========================================================= */

export const getInitialized = (): boolean => {
  return bridge?.getInitialized() ?? false;
};

/* =========================================================
   GET USER
   ========================================================= */

export const getAuthUser = (): AuthUser | null => {
  return bridge?.getUser() ?? null;
};
