import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
/* =========================================================
   TYPES
   ========================================================= */

interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
}

interface RefreshTokenState {
  loading: boolean;
  success: boolean;
  accessToken: string | null;
  error: string | null;
}

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: RefreshTokenState = {
  loading: false,
  success: false,
  accessToken: null,
  error: null,
};

/* =========================================================
   REFRESH ACCESS TOKEN
   POST /api/auth/token
   =========================================================
   
   Refresh token:
   - berada di HttpOnly cookie
   - TIDAK dibaca JavaScript
   - browser otomatis mengirim cookie

   Backend mengembalikan:
   {
     success: true,
     accessToken: "..."
   }
   ========================================================= */

export const refreshAccessToken = createAsyncThunk<
  string,
  void,
  { rejectValue: string }
>("refreshToken/refreshAccessToken", async (_, thunkAPI) => {
  try {
    const response = await api.post<RefreshTokenResponse>(
      "/auth/token",
      {},
      {
        withCredentials: true,
      },
    );

    if (!response.data?.success || !response.data?.accessToken) {
      return thunkAPI.rejectWithValue(
        "Access token baru tidak diterima dari server.",
      );
    }

    return response.data.accessToken;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.msg ||
      "Session telah berakhir.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   SLICE
   ========================================================= */

const refreshTokenSlice = createSlice({
  name: "refreshToken",

  initialState,

  reducers: {
    resetRefreshTokenState: (state) => {
      state.loading = false;
      state.success = false;
      state.accessToken = null;
      state.error = null;
    },

    clearRefreshAccessToken: (state) => {
      state.accessToken = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* =====================================================
         PENDING
         ===================================================== */

      .addCase(refreshAccessToken.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      /* =====================================================
         SUCCESS
         ===================================================== */

      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.accessToken = action.payload;
        state.error = null;
      })

      /* =====================================================
         FAILED
         ===================================================== */

      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.accessToken = null;
        state.error = action.payload || "Gagal memperbarui access token.";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const { resetRefreshTokenState, clearRefreshAccessToken } =
  refreshTokenSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default refreshTokenSlice.reducer;
