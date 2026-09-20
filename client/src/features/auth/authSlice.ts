import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import api from "../../api/axios";

/* =========================================================
   ABN TRADE
   AUTH SLICE
   ========================================================= */

/* =========================================================
   TYPES
   ========================================================= */

export interface AuthUser {
  id: string | number;
  email: string;
  username?: string;
  full_name?: string;
  role?: string;
  status?: string;
}

/* =========================================================
   LOGIN RESPONSE
   Backend:
   {
     success: true,
     message: "...",
     data: {
       user,
       accessToken,
       refreshToken,
       expiresIn
     }
   }
   ========================================================= */

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: string;
    user: AuthUser;
  };
}

/* =========================================================
   LOGIN RESULT
   Payload login harus selalu memiliki data yang valid.
   ========================================================= */

interface LoginResult {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: string;
  user: AuthUser;
}

interface LogoutResponse {
  success: boolean;
  message?: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
}

interface MeResponse {
  success: boolean;
  user: AuthUser;
}

/* =========================================================
   AUTH STATE
   ========================================================= */

export interface AuthState {
  user: AuthUser | null;

  /*
   * Access token hanya disimpan di memory Redux.
   *
   * Refresh token tetap berada di HttpOnly Cookie.
   */
  accessToken: string | null;

  authenticated: boolean;

  loading: boolean;

  initialized: boolean;

  /*
   * Dipertahankan untuk kompatibilitas UI.
   * Refresh aktual sekarang dikelola oleh axios.ts.
   */
  refreshing: boolean;

  error: string | null;
}

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: AuthState = {
  user: null,
  accessToken: null,
  authenticated: false,
  loading: false,
  initialized: false,
  refreshing: false,
  error: null,
};

/* =========================================================
   LOGIN
   POST /api/auth/login
   ========================================================= */

export const login = createAsyncThunk<
  LoginResult,
  {
    email: string;
    password: string;
  },
  {
    rejectValue: string;
  }
>("auth/login", async (credentials, thunkAPI) => {
  try {
    const response = await api.post<LoginResponse>("/auth/login", credentials, {
      withCredentials: true,
    });

    const data = response.data?.data;

    /*
     * Backend response harus:
     *
     * response.data.success === true
     * response.data.data.accessToken
     * response.data.data.user
     */

    if (!response.data?.success || !data?.accessToken || !data?.user) {
      return thunkAPI.rejectWithValue(response.data?.message || "Login gagal.");
    }

    /*
     * Setelah validasi di atas,
     * TypeScript mengetahui data tersedia.
     */

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      user: data.user,
    };
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.msg ||
      "Email atau password salah.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   LOGOUT
   POST /api/auth/logout
   ========================================================= */

export const logout = createAsyncThunk<
  LogoutResponse,
  void,
  {
    rejectValue: string;
  }
>("auth/logout", async (_, thunkAPI) => {
  try {
    const response = await api.post<LogoutResponse>(
      "/auth/logout",
      {},
      {
        withCredentials: true,
      },
    );

    if (!response.data?.success) {
      return thunkAPI.rejectWithValue(
        response.data?.message || "Logout gagal.",
      );
    }

    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.msg ||
      "Logout gagal. Silakan coba lagi.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   REGISTER
   POST /api/auth/register
   ========================================================= */

export const register = createAsyncThunk<
  RegisterResponse,
  {
    email: string;
    password: string;
    full_name: string;
  },
  {
    rejectValue: string;
  }
>("auth/register", async (credentials, thunkAPI) => {
  try {
    const response = await api.post<RegisterResponse>(
      "/auth/register",
      credentials,
      {
        withCredentials: true,
      },
    );

    if (!response.data?.success) {
      return thunkAPI.rejectWithValue(
        response.data?.message || "Registrasi gagal.",
      );
    }

    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.msg ||
      "Registrasi gagal. Silakan coba lagi.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   CURRENT USER
   GET /api/auth/me
   ========================================================= */

export const getCurrentUser = createAsyncThunk<
  AuthUser,
  void,
  {
    state: {
      auth: AuthState;
    };
    rejectValue: string;
  }
>("auth/getCurrentUser", async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState();

    const accessToken = state.auth.accessToken;

    if (!accessToken) {
      return thunkAPI.rejectWithValue("Access token tidak tersedia.");
    }

    const response = await api.get<MeResponse>("/auth/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });

    if (!response.data?.success || !response.data?.user) {
      return thunkAPI.rejectWithValue("User tidak ditemukan.");
    }

    return response.data.user;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.msg ||
      "Session tidak valid.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   SLICE
   ========================================================= */

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    /* =====================================================
       SET ACCESS TOKEN
       ===================================================== */

    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.authenticated = true;
      state.error = null;
    },

    /* =====================================================
       SET USER
       ===================================================== */

    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.authenticated = true;
      state.error = null;
    },

    /* =====================================================
       CLEAR AUTH
       ===================================================== */

    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.authenticated = false;
      state.loading = false;
      state.refreshing = false;

      /*
       * Auth sudah selesai.
       *
       * Jangan biarkan ProtectedRoute
       * menunggu AuthInitializer lagi.
       */
      state.initialized = true;

      state.error = null;
    },

    /* =====================================================
       CLEAR ERROR
       ===================================================== */

    clearAuthError: (state) => {
      state.error = null;
    },

    /* =====================================================
       SET INITIALIZED
       ===================================================== */

    setAuthInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },

    /* =====================================================
       SET REFRESHING
       ===================================================== */

    setAuthRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    builder

      /* ===================================================
         LOGIN
         =================================================== */

      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;

        state.initialized = true;
        state.authenticated = true;

        state.accessToken = action.payload.accessToken;

        state.user = action.payload.user;

        state.refreshing = false;
        state.error = null;
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false;

        state.initialized = true;
        state.authenticated = false;

        state.accessToken = null;
        state.user = null;

        state.refreshing = false;

        state.error = action.payload || "Login gagal.";
      })

      /* ===================================================
         LOGOUT
         =================================================== */

      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;

        state.authenticated = false;

        state.loading = false;
        state.refreshing = false;

        state.initialized = true;
        state.error = null;
      })

      .addCase(logout.rejected, (state, action) => {
        /*
         * Walaupun request logout gagal,
         * frontend tetap dianggap logout.
         */

        state.user = null;
        state.accessToken = null;

        state.authenticated = false;

        state.loading = false;
        state.refreshing = false;

        state.initialized = true;

        state.error = action.payload || "Logout gagal.";
      })

      /* ===================================================
         REGISTER
         =================================================== */

      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.error = null;

        /*
         * Register tidak otomatis login.
         */
      })

      .addCase(register.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Registrasi gagal.";
      })

      /* ===================================================
         CURRENT USER
         =================================================== */

      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;

        state.initialized = true;
        state.authenticated = true;

        state.user = action.payload;

        state.refreshing = false;
        state.error = null;
      })

      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;

        state.initialized = true;
        state.authenticated = false;

        state.user = null;
        state.accessToken = null;

        state.refreshing = false;

        state.error = action.payload || "Session tidak valid.";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setAccessToken,
  setUser,
  clearAuth,
  clearAuthError,
  setAuthInitialized,
  setAuthRefreshing,
} = authSlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;

export const selectAccessToken = (state: { auth: AuthState }) =>
  state.auth.accessToken;

export const selectAuthenticated = (state: { auth: AuthState }) =>
  state.auth.authenticated;

export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;

export const selectAuthRefreshing = (state: { auth: AuthState }) =>
  state.auth.refreshing;

export const selectAuthInitialized = (state: { auth: AuthState }) =>
  state.auth.initialized;

export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

/* =========================================================
   REDUCER
   ========================================================= */

export default authSlice.reducer;
