import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { RootState } from "../../stores/store";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface CryptoCoin {
  symbol: string;
  yahooSymbol?: string;
  name?: string;

  price: number;
  previousClose?: number;

  change: number;
  changePercent: number;

  open?: number;
  high?: number;
  low?: number;

  volume?: number;
  marketCap?: number;

  currency?: string;
  exchange?: string;

  marketState?: string;
  status?: string;

  timestamp?: string;
}

export interface CryptoMarket {
  market: string;

  totalCoins: number;

  advancers: number;
  decliners: number;
  unchanged: number;

  coins: CryptoCoin[];

  marketStatus?: string;
  source?: string;
  timestamp?: string;
}

export interface CryptoMarketStatus {
  market?: string;

  status: string;

  label?: string;

  isOpen?: boolean;

  session?: string;

  timezone?: string;

  source?: string;

  timestamp?: string;
}

export interface CryptoCoinsMeta {
  total: number;

  limit: number;

  offset: number;

  count?: number;

  hasMore?: boolean;
}

interface BackendResponse<T> {
  success: boolean;

  data: T;

  message?: string;
}

interface BackendCoinsResponse {
  success: boolean;

  data: CryptoCoin[];

  meta?: CryptoCoinsMeta;

  message?: string;
}

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,

    headers: {
      "Content-Type": "application/json",

      ...(options?.headers || {}),
    },
  });

  let data:
    | T
    | {
        message?: string;
        success?: boolean;
      };

  try {
    data = await response.json();
  } catch {
    throw new Error(`Invalid server response (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(
      (
        data as {
          message?: string;
        }
      )?.message || `Request failed with status ${response.status}`,
    );
  }

  if (
    (
      data as {
        success?: boolean;
      }
    )?.success === false
  ) {
    throw new Error(
      (
        data as {
          message?: string;
        }
      )?.message || "Crypto API request failed",
    );
  }

  return data as T;
}

export const fetchCryptoMarket = createAsyncThunk<
  CryptoMarket,
  void,
  { rejectValue: string }
>("crypto/fetchMarket", async (_, thunkAPI) => {
  try {
    const response = await fetchJSON<BackendResponse<CryptoMarket>>(
      `${API_BASE_URL}/trade-crypto/market`,
    );

    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch crypto market",
    );
  }
});

export const fetchCryptoCoins = createAsyncThunk<
  {
    coins: CryptoCoin[];
    meta: CryptoCoinsMeta;
  },
  {
    limit?: number;
    offset?: number;
  } | void,
  { rejectValue: string }
>("crypto/fetchCoins", async (options, thunkAPI) => {
  try {
    const limit = options?.limit ?? 20;

    const offset = options?.offset ?? 0;

    const query = new URLSearchParams({
      limit: String(limit),

      offset: String(offset),
    });

    const response = await fetchJSON<BackendCoinsResponse>(
      `${API_BASE_URL}/trade-crypto/coins?${query.toString()}`,
    );

    return {
      coins: response.data || [],

      meta: response.meta || {
        total: response.data?.length || 0,

        limit,

        offset,

        count: response.data?.length || 0,

        hasMore: false,
      },
    };
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch crypto coins",
    );
  }
});

export const fetchCryptoCoin = createAsyncThunk<
  CryptoCoin,
  string,
  { rejectValue: string }
>("crypto/fetchCoin", async (symbol, thunkAPI) => {
  try {
    const normalized = symbol.trim().toUpperCase();

    if (!normalized) {
      throw new Error("Crypto symbol is required");
    }

    const response = await fetchJSON<BackendResponse<CryptoCoin>>(
      `${API_BASE_URL}/trade-crypto/coins/${encodeURIComponent(normalized)}`,
    );

    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch crypto coin",
    );
  }
});

export const fetchCryptoGainers = createAsyncThunk<
  CryptoCoin[],
  void,
  { rejectValue: string }
>("crypto/fetchGainers", async (_, thunkAPI) => {
  try {
    const response = await fetchJSON<BackendResponse<CryptoCoin[]>>(
      `${API_BASE_URL}/trade-crypto/gainers`,
    );

    return response.data || [];
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch crypto gainers",
    );
  }
});

export const fetchCryptoLosers = createAsyncThunk<
  CryptoCoin[],
  void,
  { rejectValue: string }
>("crypto/fetchLosers", async (_, thunkAPI) => {
  try {
    const response = await fetchJSON<BackendResponse<CryptoCoin[]>>(
      `${API_BASE_URL}/trade-crypto/losers`,
    );

    return response.data || [];
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch crypto losers",
    );
  }
});

export const fetchCryptoMarketStatus = createAsyncThunk<
  CryptoMarketStatus,
  void,
  { rejectValue: string }
>("crypto/fetchMarketStatus", async (_, thunkAPI) => {
  try {
    const response = await fetchJSON<BackendResponse<CryptoMarketStatus>>(
      `${API_BASE_URL}/trade-crypto/status`,
    );

    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error instanceof Error
        ? error.message
        : "Failed to fetch crypto market status",
    );
  }
});

export const clearCryptoCache = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("crypto/clearCache", async (_, thunkAPI) => {
  try {
    await fetchJSON<{
      success: boolean;
      message?: string;
    }>(`${API_BASE_URL}/trade-crypto/cache/clear`, {
      method: "POST",
    });
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error instanceof Error ? error.message : "Failed to clear crypto cache",
    );
  }
});

interface CryptoState {
  market: CryptoMarket | null;

  coins: CryptoCoin[];

  gainers: CryptoCoin[];

  losers: CryptoCoin[];

  marketStatus: CryptoMarketStatus | null;

  selectedCoin: CryptoCoin | null;

  meta: CryptoCoinsMeta | null;

  loading: boolean;

  coinLoading: boolean;

  gainersLoading: boolean;

  losersLoading: boolean;

  statusLoading: boolean;

  cacheLoading: boolean;

  error: string | null;
}

const initialState: CryptoState = {
  market: null,

  coins: [],

  gainers: [],

  losers: [],

  marketStatus: null,

  selectedCoin: null,

  meta: null,

  loading: false,

  coinLoading: false,

  gainersLoading: false,

  losersLoading: false,

  statusLoading: false,

  cacheLoading: false,

  error: null,
};

const cryptoSlice = createSlice({
  name: "crypto",

  initialState,

  reducers: {
    clearCryptoError(state) {
      state.error = null;
    },

    clearSelectedCryptoCoin(state) {
      state.selectedCoin = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchCryptoMarket.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(
        fetchCryptoMarket.fulfilled,
        (state, action: PayloadAction<CryptoMarket>) => {
          state.loading = false;

          state.market = action.payload;
        },
      )

      .addCase(fetchCryptoMarket.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to fetch crypto market";
      })

      .addCase(fetchCryptoCoins.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(fetchCryptoCoins.fulfilled, (state, action) => {
        state.loading = false;

        state.coins = action.payload.coins;

        state.meta = action.payload.meta;
      })

      .addCase(fetchCryptoCoins.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to fetch crypto coins";
      })

      .addCase(fetchCryptoCoin.pending, (state) => {
        state.coinLoading = true;

        state.error = null;
      })

      .addCase(fetchCryptoCoin.fulfilled, (state, action) => {
        state.coinLoading = false;

        state.selectedCoin = action.payload;
      })

      .addCase(fetchCryptoCoin.rejected, (state, action) => {
        state.coinLoading = false;

        state.error = action.payload || "Failed to fetch crypto coin";
      })

      .addCase(fetchCryptoGainers.pending, (state) => {
        state.gainersLoading = true;

        state.error = null;
      })

      .addCase(fetchCryptoGainers.fulfilled, (state, action) => {
        state.gainersLoading = false;

        state.gainers = action.payload;
      })

      .addCase(fetchCryptoGainers.rejected, (state, action) => {
        state.gainersLoading = false;

        state.error = action.payload || "Failed to fetch crypto gainers";
      })

      .addCase(fetchCryptoLosers.pending, (state) => {
        state.losersLoading = true;

        state.error = null;
      })

      .addCase(fetchCryptoLosers.fulfilled, (state, action) => {
        state.losersLoading = false;

        state.losers = action.payload;
      })

      .addCase(fetchCryptoLosers.rejected, (state, action) => {
        state.losersLoading = false;

        state.error = action.payload || "Failed to fetch crypto losers";
      })

      .addCase(fetchCryptoMarketStatus.pending, (state) => {
        state.statusLoading = true;

        state.error = null;
      })

      .addCase(fetchCryptoMarketStatus.fulfilled, (state, action) => {
        state.statusLoading = false;

        state.marketStatus = action.payload;
      })

      .addCase(fetchCryptoMarketStatus.rejected, (state, action) => {
        state.statusLoading = false;

        state.error = action.payload || "Failed to fetch crypto market status";
      })

      .addCase(clearCryptoCache.pending, (state) => {
        state.cacheLoading = true;

        state.error = null;
      })

      .addCase(clearCryptoCache.fulfilled, (state) => {
        state.cacheLoading = false;
      })

      .addCase(clearCryptoCache.rejected, (state, action) => {
        state.cacheLoading = false;

        state.error = action.payload || "Failed to clear crypto cache";
      });
  },
});

export const { clearCryptoError, clearSelectedCryptoCoin } =
  cryptoSlice.actions;

export const selectCryptoMarket = (state: RootState) => state.crypto.market;

export const selectCryptoCoins = (state: RootState) => state.crypto.coins;

export const selectCryptoGainers = (state: RootState) => state.crypto.gainers;

export const selectCryptoLosers = (state: RootState) => state.crypto.losers;

export const selectCryptoMarketStatus = (state: RootState) =>
  state.crypto.marketStatus;

export const selectSelectedCryptoCoin = (state: RootState) =>
  state.crypto.selectedCoin;

export const selectCryptoMeta = (state: RootState) => state.crypto.meta;

export const selectCryptoLoading = (state: RootState) => state.crypto.loading;

export const selectCryptoCoinLoading = (state: RootState) =>
  state.crypto.coinLoading;

export const selectCryptoGainersLoading = (state: RootState) =>
  state.crypto.gainersLoading;

export const selectCryptoLosersLoading = (state: RootState) =>
  state.crypto.losersLoading;

export const selectCryptoStatusLoading = (state: RootState) =>
  state.crypto.statusLoading;

export const selectCryptoCacheLoading = (state: RootState) =>
  state.crypto.cacheLoading;

export const selectCryptoError = (state: RootState) => state.crypto.error;

export default cryptoSlice.reducer;
