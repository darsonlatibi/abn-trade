import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import api from "../../api/axios";
import type { RootState } from "../../stores/store";

const API_BASE = "/trade-idx";

export interface IDXStock {
  symbol: string;
  yahooSymbol?: string;
  name?: string;
  company?: string;

  price: number;
  previousClose?: number;
  change: number;
  changePercent: number;

  open?: number;
  high?: number;
  low?: number;

  volume?: number;
  value?: number;
  marketCap?: number;

  status?: string;
  currency?: string;
  exchange?: string;
  marketState?: string;

  timestamp?: string;
}

export interface IDXMarket {
  index: string;
  name?: string;

  value: number;
  change: number;
  changePercent: number;

  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;

  volume?: number;
  valueTraded?: number;

  advancing?: number;
  declining?: number;
  unchanged?: number;

  timestamp?: string;
}

export interface IDXMarketStatus {
  status: string;
  label?: string;
  isOpen?: boolean;
  session?: string;
  date?: string;
  time?: string;
  timezone?: string;
  source?: string;
  timestamp?: string;
}

export interface IDXStocksResponse {
  stocks: IDXStock[];
  meta?: {
    total: number;
    limit: number;
    offset: number;
    count?: number;
    hasMore?: boolean;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
    count?: number;
    hasMore?: boolean;
  };
  message?: string;
}

interface BackendIDXMarket {
  totalStocks: number;
  advancers: number;
  decliners: number;
  unchanged: number;
  alerts: number;

  ihsg: number;
  ihsgChange: number;
  ihsgChangePercent: number;

  volume: number;
  value: number;

  marketStatus: string;
  source: string;
  timestamp: string;
}

interface BackendMarketStatus {
  status: string;
  timezone?: string;
  timestamp?: string;
  source?: string;
}

interface IDXState {
  market: IDXMarket | null;
  stocks: IDXStock[];
  selectedStock: IDXStock | null;
  gainers: IDXStock[];
  losers: IDXStock[];
  marketStatus: IDXMarketStatus | null;

  total: number;
  limit: number;
  offset: number;

  loading: boolean;
  marketLoading: boolean;
  stocksLoading: boolean;
  stockLoading: boolean;
  gainersLoading: boolean;
  losersLoading: boolean;
  statusLoading: boolean;

  error: string | null;
  lastUpdated: number | null;
}

const initialState: IDXState = {
  market: null,
  stocks: [],
  selectedStock: null,
  gainers: [],
  losers: [],
  marketStatus: null,

  total: 0,
  limit: 20,
  offset: 0,

  loading: false,
  marketLoading: false,
  stocksLoading: false,
  stockLoading: false,
  gainersLoading: false,
  losersLoading: false,
  statusLoading: false,

  error: null,
  lastUpdated: null,
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            error?: string;
            message?: string;
          };
        };
      }
    ).response;

    return response?.data?.error || response?.data?.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const normalizeStock = (stock: IDXStock): IDXStock => ({
  ...stock,

  name: stock.name || stock.company || stock.symbol,

  company: stock.company || stock.name || stock.symbol,

  price: Number(stock.price ?? 0),
  previousClose:
    stock.previousClose !== undefined ? Number(stock.previousClose) : undefined,

  change: Number(stock.change ?? 0),
  changePercent: Number(stock.changePercent ?? 0),

  volume: stock.volume !== undefined ? Number(stock.volume) : undefined,

  value: stock.value !== undefined ? Number(stock.value) : undefined,
});

const normalizeMarket = (data: BackendIDXMarket): IDXMarket => ({
  index: "IHSG",
  name: "Indeks Harga Saham Gabungan",

  value: Number(data.ihsg ?? 0),
  change: Number(data.ihsgChange ?? 0),
  changePercent: Number(data.ihsgChangePercent ?? 0),

  volume: Number(data.volume ?? 0),
  valueTraded: Number(data.value ?? 0),

  advancing: Number(data.advancers ?? 0),
  declining: Number(data.decliners ?? 0),
  unchanged: Number(data.unchanged ?? 0),

  timestamp: data.timestamp,
});

const normalizeMarketStatus = (data: BackendMarketStatus): IDXMarketStatus => {
  const status = String(data.status || "CLOSED").toUpperCase();

  const isOpen = status === "OPEN";

  let label = "Market Closed";

  switch (status) {
    case "OPEN":
      label = "Market Open";
      break;

    case "PRE_OPEN":
      label = "Pre-Open";
      break;

    case "BREAK":
      label = "Market Break";
      break;

    case "CLOSED":
    default:
      label = "Market Closed";
      break;
  }

  return {
    status,
    label,
    isOpen,
    session: status,
    timezone: data.timezone || "Asia/Jakarta",
    source: data.source || "YAHOO_FINANCE",
    timestamp: data.timestamp,
  };
};

export const fetchIDXMarket = createAsyncThunk<
  IDXMarket,
  void,
  { rejectValue: string }
>("idx/fetchMarket", async (_, thunkAPI) => {
  try {
    const response = await api.get<ApiResponse<BackendIDXMarket>>(
      `${API_BASE}/market`,
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Invalid IDX market response");
    }

    return normalizeMarket(response.data.data);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch IDX market"),
    );
  }
});

export const fetchIDXStocks = createAsyncThunk<
  IDXStocksResponse,
  { limit?: number; offset?: number } | undefined,
  { rejectValue: string }
>("idx/fetchStocks", async (params = {}, thunkAPI) => {
  try {
    const response = await api.get<ApiResponse<IDXStock[]>>(
      `${API_BASE}/stocks`,
      {
        params: {
          limit: params.limit ?? 20,
          offset: params.offset ?? 0,
        },
      },
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Invalid IDX stocks response");
    }

    const stocks = (response.data.data || []).map(normalizeStock);

    const meta = response.data.meta || {};

    return {
      stocks,
      meta: {
        total: meta.total ?? stocks.length,

        limit: meta.limit ?? params.limit ?? 20,

        offset: meta.offset ?? params.offset ?? 0,

        count: meta.count ?? stocks.length,

        hasMore: meta.hasMore ?? false,
      },
    };
  } catch (error) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch IDX stocks"),
    );
  }
});

export const fetchIDXStock = createAsyncThunk<
  IDXStock,
  string,
  { rejectValue: string }
>("idx/fetchStock", async (symbol, thunkAPI) => {
  try {
    const normalizedSymbol = symbol.trim().toUpperCase();

    const response = await api.get<ApiResponse<IDXStock>>(
      `${API_BASE}/stocks/${encodeURIComponent(normalizedSymbol)}`,
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || `Failed to fetch ${normalizedSymbol}`,
      );
    }

    return normalizeStock(response.data.data);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, `Failed to fetch ${symbol}`),
    );
  }
});

export const fetchIDXGainers = createAsyncThunk<
  IDXStock[],
  number | undefined,
  { rejectValue: string }
>("idx/fetchGainers", async (limit = 10, thunkAPI) => {
  try {
    const response = await api.get<ApiResponse<IDXStock[]>>(
      `${API_BASE}/gainers`,
      {
        params: { limit },
      },
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Invalid IDX gainers response");
    }

    return (response.data.data || []).map(normalizeStock);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch IDX gainers"),
    );
  }
});

export const fetchIDXLosers = createAsyncThunk<
  IDXStock[],
  number | undefined,
  { rejectValue: string }
>("idx/fetchLosers", async (limit = 10, thunkAPI) => {
  try {
    const response = await api.get<ApiResponse<IDXStock[]>>(
      `${API_BASE}/losers`,
      {
        params: { limit },
      },
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Invalid IDX losers response");
    }

    return (response.data.data || []).map(normalizeStock);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch IDX losers"),
    );
  }
});

export const fetchIDXMarketStatus = createAsyncThunk<
  IDXMarketStatus,
  void,
  { rejectValue: string }
>("idx/fetchMarketStatus", async (_, thunkAPI) => {
  try {
    const response = await api.get<ApiResponse<BackendMarketStatus>>(
      `${API_BASE}/status`,
    );

    if (!response.data?.success) {
      throw new Error(
        response.data?.message || "Invalid IDX market status response",
      );
    }

    return normalizeMarketStatus(response.data.data);
  } catch (error) {
    return thunkAPI.rejectWithValue(
      getErrorMessage(error, "Failed to fetch IDX market status"),
    );
  }
});

const idxSlice = createSlice({
  name: "idx",
  initialState,

  reducers: {
    clearIDXError(state) {
      state.error = null;
    },

    clearSelectedStock(state) {
      state.selectedStock = null;
    },

    resetIDX() {
      return initialState;
    },

    updateIDXMarket(state, action: PayloadAction<IDXMarket>) {
      state.market = action.payload;
      state.lastUpdated = Date.now();
    },

    updateIDXStock(state, action: PayloadAction<IDXStock>) {
      const stock = normalizeStock(action.payload);

      const index = state.stocks.findIndex(
        (item) => item.symbol === stock.symbol,
      );

      if (index >= 0) {
        state.stocks[index] = {
          ...state.stocks[index],
          ...stock,
        };
      } else {
        state.stocks.push(stock);
      }

      if (state.selectedStock?.symbol === stock.symbol) {
        state.selectedStock = {
          ...state.selectedStock,
          ...stock,
        };
      }

      state.lastUpdated = Date.now();
    },

    setIDXMarketStatus(state, action: PayloadAction<IDXMarketStatus>) {
      state.marketStatus = action.payload;

      state.lastUpdated = Date.now();
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(fetchIDXMarket.pending, (state) => {
        state.marketLoading = true;
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchIDXMarket.fulfilled, (state, action) => {
        state.marketLoading = false;
        state.loading = false;

        state.market = action.payload;

        state.lastUpdated = Date.now();
      })

      .addCase(fetchIDXMarket.rejected, (state, action) => {
        state.marketLoading = false;
        state.loading = false;

        state.error = action.payload ?? "Failed to fetch IDX market";
      })

      .addCase(fetchIDXStocks.pending, (state) => {
        state.stocksLoading = true;
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchIDXStocks.fulfilled, (state, action) => {
        state.stocksLoading = false;
        state.loading = false;

        state.stocks = action.payload.stocks ?? [];

        state.total = action.payload.meta?.total ?? state.stocks.length;

        state.limit = action.payload.meta?.limit ?? state.limit;

        state.offset = action.payload.meta?.offset ?? state.offset;

        state.lastUpdated = Date.now();
      })

      .addCase(fetchIDXStocks.rejected, (state, action) => {
        state.stocksLoading = false;
        state.loading = false;

        state.error = action.payload ?? "Failed to fetch IDX stocks";
      })

      .addCase(fetchIDXStock.pending, (state) => {
        state.stockLoading = true;
        state.error = null;
      })

      .addCase(fetchIDXStock.fulfilled, (state, action) => {
        state.stockLoading = false;

        state.selectedStock = action.payload;

        const index = state.stocks.findIndex(
          (item) => item.symbol === action.payload.symbol,
        );

        if (index >= 0) {
          state.stocks[index] = {
            ...state.stocks[index],
            ...action.payload,
          };
        }

        state.lastUpdated = Date.now();
      })

      .addCase(fetchIDXStock.rejected, (state, action) => {
        state.stockLoading = false;

        state.error = action.payload ?? "Failed to fetch IDX stock";
      })

      .addCase(fetchIDXGainers.pending, (state) => {
        state.gainersLoading = true;
        state.error = null;
      })

      .addCase(fetchIDXGainers.fulfilled, (state, action) => {
        state.gainersLoading = false;

        state.gainers = action.payload ?? [];

        state.lastUpdated = Date.now();
      })

      .addCase(fetchIDXGainers.rejected, (state, action) => {
        state.gainersLoading = false;

        state.error = action.payload ?? "Failed to fetch IDX gainers";
      })

      .addCase(fetchIDXLosers.pending, (state) => {
        state.losersLoading = true;
        state.error = null;
      })

      .addCase(fetchIDXLosers.fulfilled, (state, action) => {
        state.losersLoading = false;

        state.losers = action.payload ?? [];

        state.lastUpdated = Date.now();
      })

      .addCase(fetchIDXLosers.rejected, (state, action) => {
        state.losersLoading = false;

        state.error = action.payload ?? "Failed to fetch IDX losers";
      })

      .addCase(fetchIDXMarketStatus.pending, (state) => {
        state.statusLoading = true;
        state.error = null;
      })

      .addCase(fetchIDXMarketStatus.fulfilled, (state, action) => {
        state.statusLoading = false;

        state.marketStatus = action.payload;

        state.lastUpdated = Date.now();
      })

      .addCase(fetchIDXMarketStatus.rejected, (state, action) => {
        state.statusLoading = false;

        state.error = action.payload ?? "Failed to fetch IDX market status";
      });
  },
});

export const {
  clearIDXError,
  clearSelectedStock,
  resetIDX,
  updateIDXMarket,
  updateIDXStock,
  setIDXMarketStatus,
} = idxSlice.actions;

export const selectIDXMarket = (state: RootState) => state.idx.market;

export const selectIDXStocks = (state: RootState) => state.idx.stocks;

export const selectIDXSelectedStock = (state: RootState) =>
  state.idx.selectedStock;

export const selectIDXGainers = (state: RootState) => state.idx.gainers;

export const selectIDXLosers = (state: RootState) => state.idx.losers;

export const selectIDXMarketStatus = (state: RootState) =>
  state.idx.marketStatus;

export const selectIDXLoading = (state: RootState) => state.idx.loading;

export const selectIDXMarketLoading = (state: RootState) =>
  state.idx.marketLoading;

export const selectIDXStocksLoading = (state: RootState) =>
  state.idx.stocksLoading;

export const selectIDXStockLoading = (state: RootState) =>
  state.idx.stockLoading;

export const selectIDXGainersLoading = (state: RootState) =>
  state.idx.gainersLoading;

export const selectIDXLosersLoading = (state: RootState) =>
  state.idx.losersLoading;

export const selectIDXStatusLoading = (state: RootState) =>
  state.idx.statusLoading;

export const selectIDXError = (state: RootState) => state.idx.error;

export const selectIDXLastUpdated = (state: RootState) => state.idx.lastUpdated;

export default idxSlice.reducer;
