import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { RootState } from "../../stores/store";

/* =========================================================
 * TYPES
 * ========================================================= */

export interface ForexPair {
  symbol: string;
  yahooSymbol?: string;

  name?: string;

  price: number;
  previousClose?: number;

  change: number;
  changePercent: number;

  bid?: number;
  ask?: number;
  spread?: number;

  open?: number;
  high?: number;
  low?: number;

  volume?: number;

  currency?: string;
  exchange?: string;

  marketState?: string;
  status?: string;

  timestamp?: string;
}

export interface ForexMarket {
  market: string;

  totalPairs: number;

  advancers: number;
  decliners: number;
  unchanged: number;

  pairs: ForexPair[];

  marketStatus?: string;

  source?: string;

  timestamp?: string;
}

export interface ForexMarketStatus {
  market?: string;

  status: string;
  label?: string;

  isOpen?: boolean;

  session?: string;

  timezone?: string;

  source?: string;

  timestamp?: string;
}

export interface ForexPairsMeta {
  total: number;
  limit: number;
  offset: number;
  count?: number;
  hasMore?: boolean;
}

/* =========================================================
 * BACKEND RESPONSE TYPES
 * ========================================================= */

interface BackendResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface BackendPairsResponse {
  success: boolean;
  data: ForexPair[];
  meta?: ForexPairsMeta;
  message?: string;
}

/* =========================================================
 * API CONFIG
 * ========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* =========================================================
 * ERROR HANDLER
 * ========================================================= */

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to fetch forex market data";
}

/* =========================================================
 * FETCH HELPER
 * ========================================================= */

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  let data: T | { message?: string; success?: boolean };

  try {
    data = await response.json();
  } catch {
    throw new Error(`Invalid server response (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(
      (data as { message?: string })?.message ||
        `Request failed with status ${response.status}`,
    );
  }

  if ((data as { success?: boolean })?.success === false) {
    throw new Error(
      (data as { message?: string })?.message || "Forex API request failed",
    );
  }

  return data as T;
}

/* =========================================================
 * FETCH MARKET
 * ========================================================= */

export const fetchForexMarket = createAsyncThunk<
  ForexMarket,
  void,
  { rejectValue: string }
>("forex/fetchMarket", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchJSON<BackendResponse<ForexMarket>>(
      `${API_BASE_URL}/trade-forex/market`,
    );

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
 * FETCH PAIRS
 * ========================================================= */

export const fetchForexPairs = createAsyncThunk<
  {
    pairs: ForexPair[];
    meta?: ForexPairsMeta;
  },
  | {
      limit?: number;
      offset?: number;
    }
  | undefined,
  { rejectValue: string }
>("forex/fetchPairs", async (params = {}, { rejectWithValue }) => {
  try {
    const limit = params.limit ?? 20;
    const offset = params.offset ?? 0;

    const query = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });

    const response = await fetchJSON<BackendPairsResponse>(
      `${API_BASE_URL}/trade-forex/pairs?${query.toString()}`,
    );

    return {
      pairs: response.data || [],
      meta: response.meta,
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
 * FETCH SINGLE PAIR
 * ========================================================= */

export const fetchForexPair = createAsyncThunk<
  ForexPair,
  string,
  { rejectValue: string }
>("forex/fetchPair", async (symbol, { rejectWithValue }) => {
  try {
    const normalizedSymbol = String(symbol).trim().toUpperCase();

    const response = await fetchJSON<BackendResponse<ForexPair>>(
      `${API_BASE_URL}/trade-forex/pairs/${encodeURIComponent(
        normalizedSymbol,
      )}`,
    );

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
 * FETCH GAINERS
 * ========================================================= */

export const fetchForexGainers = createAsyncThunk<
  ForexPair[],
  void,
  { rejectValue: string }
>("forex/fetchGainers", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchJSON<BackendResponse<ForexPair[]>>(
      `${API_BASE_URL}/trade-forex/gainers`,
    );

    return response.data || [];
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
 * FETCH LOSERS
 * ========================================================= */

export const fetchForexLosers = createAsyncThunk<
  ForexPair[],
  void,
  { rejectValue: string }
>("forex/fetchLosers", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchJSON<BackendResponse<ForexPair[]>>(
      `${API_BASE_URL}/trade-forex/losers`,
    );

    return response.data || [];
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
 * FETCH MARKET STATUS
 * ========================================================= */

export const fetchForexMarketStatus = createAsyncThunk<
  ForexMarketStatus,
  void,
  { rejectValue: string }
>("forex/fetchMarketStatus", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchJSON<BackendResponse<ForexMarketStatus>>(
      `${API_BASE_URL}/trade-forex/status`,
    );

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
 * CLEAR CACHE
 * ========================================================= */

export const clearForexCache = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("forex/clearCache", async (_, { rejectWithValue }) => {
  try {
    await fetchJSON(`${API_BASE_URL}/trade-forex/cache/clear`, {
      method: "POST",
    });
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
 * STATE
 * ========================================================= */

interface ForexState {
  market: ForexMarket | null;

  pairs: ForexPair[];

  gainers: ForexPair[];

  losers: ForexPair[];

  marketStatus: ForexMarketStatus | null;

  selectedPair: ForexPair | null;

  meta: ForexPairsMeta | null;

  loading: boolean;

  pairLoading: boolean;

  gainersLoading: boolean;

  losersLoading: boolean;

  statusLoading: boolean;

  error: string | null;
}

const initialState: ForexState = {
  market: null,

  pairs: [],

  gainers: [],

  losers: [],

  marketStatus: null,

  selectedPair: null,

  meta: null,

  loading: false,

  pairLoading: false,

  gainersLoading: false,

  losersLoading: false,

  statusLoading: false,

  error: null,
};

/* =========================================================
 * SLICE
 * ========================================================= */

const forexSlice = createSlice({
  name: "forex",

  initialState,

  reducers: {
    clearForexError(state) {
      state.error = null;
    },

    clearSelectedForexPair(state) {
      state.selectedPair = null;
    },
  },

  extraReducers: (builder) => {
    /* -----------------------------------------------------
     * MARKET
     * ----------------------------------------------------- */

    builder

      .addCase(fetchForexMarket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchForexMarket.fulfilled,
        (state, action: PayloadAction<ForexMarket>) => {
          state.loading = false;
          state.market = action.payload;

          /*
           * Market endpoint juga membawa
           * daftar pairs.
           */

          if (Array.isArray(action.payload.pairs)) {
            state.pairs = action.payload.pairs;
          }
        },
      )

      .addCase(fetchForexMarket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch forex market";
      });

    /* -----------------------------------------------------
     * PAIRS
     * ----------------------------------------------------- */

    builder

      .addCase(fetchForexPairs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchForexPairs.fulfilled, (state, action) => {
        state.loading = false;

        state.pairs = action.payload.pairs;

        state.meta = action.payload.meta || null;
      })

      .addCase(fetchForexPairs.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to fetch forex pairs";
      });

    /* -----------------------------------------------------
     * SINGLE PAIR
     * ----------------------------------------------------- */

    builder

      .addCase(fetchForexPair.pending, (state) => {
        state.pairLoading = true;
        state.error = null;
      })

      .addCase(
        fetchForexPair.fulfilled,
        (state, action: PayloadAction<ForexPair>) => {
          state.pairLoading = false;

          state.selectedPair = action.payload;
        },
      )

      .addCase(fetchForexPair.rejected, (state, action) => {
        state.pairLoading = false;

        state.error = action.payload || "Failed to fetch forex pair";
      });

    /* -----------------------------------------------------
     * GAINERS
     * ----------------------------------------------------- */

    builder

      .addCase(fetchForexGainers.pending, (state) => {
        state.gainersLoading = true;
      })

      .addCase(
        fetchForexGainers.fulfilled,
        (state, action: PayloadAction<ForexPair[]>) => {
          state.gainersLoading = false;

          state.gainers = action.payload;
        },
      )

      .addCase(fetchForexGainers.rejected, (state, action) => {
        state.gainersLoading = false;

        state.error = action.payload || "Failed to fetch forex gainers";
      });

    /* -----------------------------------------------------
     * LOSERS
     * ----------------------------------------------------- */

    builder

      .addCase(fetchForexLosers.pending, (state) => {
        state.losersLoading = true;
      })

      .addCase(
        fetchForexLosers.fulfilled,
        (state, action: PayloadAction<ForexPair[]>) => {
          state.losersLoading = false;

          state.losers = action.payload;
        },
      )

      .addCase(fetchForexLosers.rejected, (state, action) => {
        state.losersLoading = false;

        state.error = action.payload || "Failed to fetch forex losers";
      });

    /* -----------------------------------------------------
     * MARKET STATUS
     * ----------------------------------------------------- */

    builder

      .addCase(fetchForexMarketStatus.pending, (state) => {
        state.statusLoading = true;
      })

      .addCase(
        fetchForexMarketStatus.fulfilled,
        (state, action: PayloadAction<ForexMarketStatus>) => {
          state.statusLoading = false;

          state.marketStatus = action.payload;
        },
      )

      .addCase(fetchForexMarketStatus.rejected, (state, action) => {
        state.statusLoading = false;

        state.error = action.payload || "Failed to fetch forex market status";
      });

    /* -----------------------------------------------------
     * CACHE
     * ----------------------------------------------------- */

    builder

      .addCase(clearForexCache.fulfilled, (state) => {
        /*
         * Jangan hapus market data.
         * Cache server saja yang dibersihkan.
         */
        state.error = null;
      })

      .addCase(clearForexCache.rejected, (state, action) => {
        state.error = action.payload || "Failed to clear forex cache";
      });
  },
});

/* =========================================================
 * ACTIONS
 * ========================================================= */

export const { clearForexError, clearSelectedForexPair } = forexSlice.actions;

/* =========================================================
 * SELECTORS
 * ========================================================= */

export const selectForexMarket = (state: RootState) => state.forex.market;

export const selectForexPairs = (state: RootState) => state.forex.pairs;

export const selectForexGainers = (state: RootState) => state.forex.gainers;

export const selectForexLosers = (state: RootState) => state.forex.losers;

export const selectForexMarketStatus = (state: RootState) =>
  state.forex.marketStatus;

export const selectSelectedForexPair = (state: RootState) =>
  state.forex.selectedPair;

export const selectForexMeta = (state: RootState) => state.forex.meta;

export const selectForexLoading = (state: RootState) => state.forex.loading;

export const selectForexPairLoading = (state: RootState) =>
  state.forex.pairLoading;

export const selectForexGainersLoading = (state: RootState) =>
  state.forex.gainersLoading;

export const selectForexLosersLoading = (state: RootState) =>
  state.forex.losersLoading;

export const selectForexStatusLoading = (state: RootState) =>
  state.forex.statusLoading;

export const selectForexError = (state: RootState) => state.forex.error;

/* =========================================================
 * REDUCER
 * ========================================================= */

export default forexSlice.reducer;
