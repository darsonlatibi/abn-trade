import axios from "axios";
import { jwtDecode } from "jwt-decode";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import {
  clearAuthState,
  getAccessToken,
  setAccessToken,
} from "../features/auth/authBridge";

/* =========================================================
   ABN SERVER
   ========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5004/api";

/* =========================================================
   TYPES
   ========================================================= */

interface JwtPayload {
  exp?: number;
}

interface RefreshResponse {
  success: boolean;
  accessToken?: string;
  message?: string;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/* =========================================================
   AXIOS INSTANCE
   ========================================================= */

const api = axios.create({
  baseURL: API_BASE_URL,

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  timeout: 15000,
});

/* =========================================================
   REFRESH API
   =========================================================
   
   Khusus endpoint /auth/token.
   
   Tidak menggunakan "api" agar tidak masuk interceptor
   yang sama.
   
   ========================================================= */

const refreshApi = axios.create({
  baseURL: API_BASE_URL,

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  timeout: 15000,
});

/* =========================================================
   REFRESH CONTROL
   ========================================================= */

let refreshPromise: Promise<string | null> | null = null;

/* =========================================================
   CHECK ACCESS TOKEN
   =========================================================
   
   Server:
   
   expiresIn: "15m"
   
   Client membaca:
   
   JWT exp
   
   ========================================================= */

const isAccessTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (!decoded.exp) {
      console.warn("ABN AUTH: JWT tidak memiliki exp.");
      return true;
    }

    const now = Math.floor(Date.now() / 1000);

    const remaining = decoded.exp - now;

    console.log("ABN AUTH TOKEN:", {
      remainingSeconds: remaining,
      remainingMinutes: Math.floor(remaining / 60),
      expired: remaining <= 0,
    });

    /*
     * Server access token = 15 menit.
     *
     * Selama belum expired:
     * TIDAK refresh.
     *
     * Jika sudah expired:
     * refresh.
     */

    return remaining <= 0;
  } catch (error) {
    console.warn("ABN AUTH: Access token tidak bisa decode.", error);

    return true;
  }
};

/* =========================================================
   REFRESH ACCESS TOKEN
   ========================================================= */

export const refreshAccessToken = async (): Promise<string | null> => {
  /*
   * Jika refresh sedang berjalan,
   * request lain menunggu Promise yang sama.
   */

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      console.log("ABN AUTH: Refresh access token...");

      /*
       * Browser otomatis mengirim:
       *
       * abn_refresh_token
       *
       * karena HttpOnly Cookie.
       */

      const response = await refreshApi.post<RefreshResponse>(
        "/auth/refresh",
        {},
      );

      if (!response.data?.success || !response.data?.accessToken) {
        console.warn("ABN AUTH: Server tidak memberikan access token.");

        return null;
      }

      const newAccessToken = response.data.accessToken;

      /*
       * Simpan token baru ke Redux.
       */

      setAccessToken(newAccessToken);

      console.log("ABN AUTH: Access token berhasil diperbarui.");

      return newAccessToken;
    } catch (error: any) {
      console.error(
        "ABN AUTH: Refresh gagal:",
        error?.response?.data || error?.message,
      );

      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

/* =========================================================
   REQUEST INTERCEPTOR
   ========================================================= */

api.interceptors.request.use(
  async (config) => {
    let accessToken = getAccessToken();

    /* =====================================================
       TIDAK ADA ACCESS TOKEN
       ===================================================== */

    if (!accessToken) {
      return config;
    }

    /* =====================================================
       CEK JWT EXP
       ===================================================== */

    if (isAccessTokenExpired(accessToken)) {
      console.log("ABN AUTH: Access token expired. Refresh...");

      const newAccessToken = await refreshAccessToken();

      /*
       * Refresh berhasil.
       */

      if (newAccessToken) {
        accessToken = newAccessToken;
      } else {
        /*
         * Refresh gagal.
         */
        console.warn("ABN AUTH: Tidak mendapatkan access token baru.");

        clearAuthState();

        return config;
      }
    }

    /* =====================================================
       PASANG ACCESS TOKEN
       ===================================================== */

    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

/* =========================================================
   RESPONSE INTERCEPTOR
   ========================================================= */

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const status = error.response?.status;

    const originalRequest = error.config as RetryableRequestConfig | undefined;

    /* =====================================================
       BUKAN 401
       ===================================================== */

    if (status !== 401) {
      return Promise.reject(error);
    }

    /* =====================================================
       REQUEST TIDAK ADA
       ===================================================== */

    if (!originalRequest) {
      return Promise.reject(error);
    }

    /* =====================================================
       JANGAN REFRESH AUTH ENDPOINT
       ===================================================== */

    const url = originalRequest.url || "";

    if (
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    /* =====================================================
       SUDAH RETRY
       ===================================================== */

    if (originalRequest._retry) {
      console.warn("ABN AUTH: Request setelah refresh masih 401.");

      clearAuthState();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    /* =====================================================
       FALLBACK REFRESH
       ===================================================== */

    console.warn("ABN AUTH: Server mengembalikan 401. Refresh...");

    const newAccessToken = await refreshAccessToken();

    /* =====================================================
       REFRESH GAGAL
       ===================================================== */

    if (!newAccessToken) {
      console.warn("ABN AUTH: Refresh token juga gagal.");

      clearAuthState();

      return Promise.reject(error);
    }

    /* =====================================================
       RETRY REQUEST
       ===================================================== */

    originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);

    console.log("ABN AUTH: Retry request dengan token baru.");

    return api.request(originalRequest);
  },
);

/* =========================================================
   EXPORT
   ========================================================= */

export default api;
