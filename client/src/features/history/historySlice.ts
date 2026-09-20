/* =========================================================
   ABN FLEET
   HISTORY SLICE
   ========================================================= */

import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import api from "../../api/axios";
import type { RootState } from "../../stores/store";

/* =========================================================
   TYPES
   ========================================================= */

export type ActivityHistoryType =
  | "GPS"
  | "TRIP"
  | "ALERT"
  | "STATUS"
  | "DRIVER"
  | "DEVICE"
  | "SYSTEM";

/* =========================================================
   VEHICLE
   ========================================================= */

export interface HistoryVehicle {
  id: number;
  vehicle_code: string;
  plate_number: string | null;
}

/* =========================================================
   DRIVER
   ========================================================= */

export interface HistoryDriver {
  id: number;
  name: string;
}

/* =========================================================
   DEVICE
   ========================================================= */

export interface HistoryDevice {
  id: number;
  device_code: string;
}

/* =========================================================
   USER
   ========================================================= */

export interface HistoryUser {
  id: number;
  name: string;
  email: string;
}

/* =========================================================
   ACTIVITY HISTORY
   ========================================================= */

export interface ActivityHistory {
  id: number;

  vehicle_id: number | null;
  driver_id: number | null;
  device_id: number | null;
  user_id: number | null;

  type: ActivityHistoryType;

  title: string;

  message: string | null;

  latitude: string | number | null;
  longitude: string | number | null;

  metadata: Record<string, unknown> | null;

  created_at: string;

  vehicle?: HistoryVehicle | null;
  driver?: HistoryDriver | null;
  device?: HistoryDevice | null;
  user?: HistoryUser | null;
}

/* =========================================================
   FILTERS
   ========================================================= */

export interface HistoryFilters {
  search: string;
  type: string;
  vehicle_id: string;
  driver_id: string;
  device_id: string;
  user_id: string;

  date_from: string;
  date_to: string;

  limit: number;
  offset: number;
}

/* =========================================================
   PAGINATION
   ========================================================= */

export interface HistoryPagination {
  total: number;
  limit: number;
  offset: number;
  page: number;
  totalPages: number;
}

/* =========================================================
   SUMMARY
   ========================================================= */

export interface HistorySummary {
  total: number;

  type: {
    GPS: number;
    TRIP: number;
    ALERT: number;
    STATUS: number;
    DRIVER: number;
    DEVICE: number;
    SYSTEM: number;
  };
}

/* =========================================================
   INITIAL FILTER
   ========================================================= */

const initialFilters: HistoryFilters = {
  search: "",
  type: "",
  vehicle_id: "",
  driver_id: "",
  device_id: "",
  user_id: "",

  date_from: "",
  date_to: "",

  limit: 20,
  offset: 0,
};

/* =========================================================
   INITIAL STATE
   ========================================================= */

interface HistoryState {
  histories: ActivityHistory[];

  selectedHistory: ActivityHistory | null;

  summary: HistorySummary | null;

  pagination: HistoryPagination;

  filters: HistoryFilters;

  loading: boolean;

  summaryLoading: boolean;

  detailLoading: boolean;

  actionLoading: boolean;

  error: string | null;

  summaryError: string | null;

  detailError: string | null;

  actionError: string | null;
}

const initialState: HistoryState = {
  histories: [],

  selectedHistory: null,

  summary: null,

  pagination: {
    total: 0,
    limit: 20,
    offset: 0,
    page: 1,
    totalPages: 0,
  },

  filters: initialFilters,

  loading: false,

  summaryLoading: false,

  detailLoading: false,

  actionLoading: false,

  error: null,

  summaryError: null,

  detailError: null,

  actionError: null,
};

/* =========================================================
   API ERROR HELPER
   ========================================================= */

const getErrorMessage = (error: any, fallback: string) => {
  return error?.response?.data?.message || error?.message || fallback;
};

/* =========================================================
   QUERY BUILDER
   ========================================================= */

const buildHistoryParams = (filters: HistoryFilters) => {
  const params: Record<string, string | number> = {};

  if (filters.search) {
    params.search = filters.search;
  }

  if (filters.type) {
    params.type = filters.type;
  }

  if (filters.vehicle_id) {
    params.vehicle_id = filters.vehicle_id;
  }

  if (filters.driver_id) {
    params.driver_id = filters.driver_id;
  }

  if (filters.device_id) {
    params.device_id = filters.device_id;
  }

  if (filters.user_id) {
    params.user_id = filters.user_id;
  }

  if (filters.date_from) {
    params.date_from = filters.date_from;
  }

  if (filters.date_to) {
    params.date_to = filters.date_to;
  }

  params.limit = filters.limit;
  params.offset = filters.offset;

  return params;
};

/* =========================================================
   GET ALL
   GET /api/history
   ========================================================= */

export const fetchHistories = createAsyncThunk<
  {
    data: ActivityHistory[];
    pagination: HistoryPagination;
  },
  HistoryFilters,
  {
    rejectValue: string;
  }
>("history/fetchHistories", async (filters, { rejectWithValue }) => {
  try {
    const response = await api.get("/history", {
      params: buildHistoryParams(filters),
    });

    return {
      data: response.data.data ?? [],

      pagination: response.data.pagination ?? {
        total: 0,
        limit: filters.limit,
        offset: filters.offset,
        page: 1,
        totalPages: 0,
      },
    };
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to fetch activity histories."),
    );
  }
});

/* =========================================================
   GET SUMMARY
   GET /api/history/summary
   ========================================================= */

export const fetchHistorySummary = createAsyncThunk<
  HistorySummary,
  Partial<HistoryFilters> | undefined,
  {
    rejectValue: string;
  }
>("history/fetchHistorySummary", async (filters, { rejectWithValue }) => {
  try {
    const params: Record<string, string> = {};

    if (filters?.search) {
      params.search = filters.search;
    }

    if (filters?.type) {
      params.type = filters.type;
    }

    if (filters?.vehicle_id) {
      params.vehicle_id = filters.vehicle_id;
    }

    if (filters?.driver_id) {
      params.driver_id = filters.driver_id;
    }

    if (filters?.device_id) {
      params.device_id = filters.device_id;
    }

    if (filters?.user_id) {
      params.user_id = filters.user_id;
    }

    if (filters?.date_from) {
      params.date_from = filters.date_from;
    }

    if (filters?.date_to) {
      params.date_to = filters.date_to;
    }

    const response = await api.get("/history/summary", {
      params,
    });

    return (
      response.data.data ?? {
        total: 0,

        type: {
          GPS: 0,
          TRIP: 0,
          ALERT: 0,
          STATUS: 0,
          DRIVER: 0,
          DEVICE: 0,
          SYSTEM: 0,
        },
      }
    );
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to fetch activity history summary."),
    );
  }
});

/* =========================================================
   GET BY ID
   GET /api/history/:id
   ========================================================= */

export const fetchHistoryById = createAsyncThunk<
  ActivityHistory,
  number,
  {
    rejectValue: string;
  }
>("history/fetchHistoryById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/history/${id}`);

    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to fetch activity history."),
    );
  }
});

/* =========================================================
   CREATE
   POST /api/history
   ========================================================= */

export const createHistory = createAsyncThunk<
  ActivityHistory,
  Partial<ActivityHistory>,
  {
    rejectValue: string;
  }
>("history/createHistory", async (data, { rejectWithValue }) => {
  try {
    const response = await api.post("/history", data);

    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to create activity history."),
    );
  }
});

/* =========================================================
   UPDATE
   PUT /api/history/:id
   ========================================================= */

export const updateHistory = createAsyncThunk<
  ActivityHistory,
  {
    id: number;
    data: Partial<ActivityHistory>;
  },
  {
    rejectValue: string;
  }
>("history/updateHistory", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/history/${id}`, data);

    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to update activity history."),
    );
  }
});

/* =========================================================
   DELETE BY ID
   DELETE /api/history/:id
   ========================================================= */

export const deleteHistory = createAsyncThunk<
  number,
  number,
  {
    rejectValue: string;
  }
>("history/deleteHistory", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/history/${id}`);

    return id;
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to delete activity history."),
    );
  }
});

/* =========================================================
   DELETE ALL / FILTERED
   DELETE /api/history
   ========================================================= */

export const deleteAllHistories = createAsyncThunk<
  number,
  Partial<HistoryFilters> | undefined,
  {
    rejectValue: string;
  }
>("history/deleteAllHistories", async (filters, { rejectWithValue }) => {
  try {
    const params: Record<string, string> = {};

    if (filters?.search) {
      params.search = filters.search;
    }

    if (filters?.type) {
      params.type = filters.type;
    }

    if (filters?.vehicle_id) {
      params.vehicle_id = filters.vehicle_id;
    }

    if (filters?.driver_id) {
      params.driver_id = filters.driver_id;
    }

    if (filters?.device_id) {
      params.device_id = filters.device_id;
    }

    if (filters?.user_id) {
      params.user_id = filters.user_id;
    }

    if (filters?.date_from) {
      params.date_from = filters.date_from;
    }

    if (filters?.date_to) {
      params.date_to = filters.date_to;
    }

    const response = await api.delete("/history", {
      params,
    });

    return response.data.deleted ?? 0;
  } catch (error: any) {
    return rejectWithValue(
      getErrorMessage(error, "Failed to delete activity histories."),
    );
  }
});

/* =========================================================
   SLICE
   ========================================================= */

const historySlice = createSlice({
  name: "history",

  initialState,

  reducers: {
    /* =====================================================
       SET FILTER
       ===================================================== */

    setHistoryFilter: (
      state,
      action: PayloadAction<{
        key: keyof HistoryFilters;
        value: string | number;
      }>,
    ) => {
      const { key, value } = action.payload;

      (state.filters as HistoryFilters)[key] = value as never;
    },

    /* =====================================================
       SET FILTERS
       ===================================================== */

    setHistoryFilters: (
      state,
      action: PayloadAction<Partial<HistoryFilters>>,
    ) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    /* =====================================================
       RESET FILTERS
       ===================================================== */

    resetHistoryFilters: (state) => {
      state.filters = {
        ...initialFilters,
      };
    },

    /* =====================================================
       SET PAGE
       ===================================================== */

    setHistoryPage: (state, action: PayloadAction<number>) => {
      const page = Math.max(1, action.payload);

      state.filters.offset = (page - 1) * state.filters.limit;
    },

    /* =====================================================
       SET LIMIT
       ===================================================== */

    setHistoryLimit: (state, action: PayloadAction<number>) => {
      const limit = Math.min(Math.max(1, action.payload), 100);

      state.filters.limit = limit;
      state.filters.offset = 0;
    },

    /* =====================================================
       SET SELECTED HISTORY
       ===================================================== */

    setSelectedHistory: (
      state,
      action: PayloadAction<ActivityHistory | null>,
    ) => {
      state.selectedHistory = action.payload;
    },

    /* =====================================================
       CLEAR ERROR
       ===================================================== */

    clearHistoryError: (state) => {
      state.error = null;
      state.summaryError = null;
      state.detailError = null;
      state.actionError = null;
    },

    /* =====================================================
       CLEAR SELECTED
       ===================================================== */

    clearSelectedHistory: (state) => {
      state.selectedHistory = null;
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH HISTORIES
       ===================================================== */

    builder
      .addCase(fetchHistories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchHistories.fulfilled, (state, action) => {
        state.loading = false;
        state.histories = action.payload.data;
        state.pagination = action.payload.pagination;
      })

      .addCase(fetchHistories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch activity histories.";
      });

    /* =====================================================
       FETCH SUMMARY
       ===================================================== */

    builder
      .addCase(fetchHistorySummary.pending, (state) => {
        state.summaryLoading = true;
        state.summaryError = null;
      })

      .addCase(fetchHistorySummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload;
      })

      .addCase(fetchHistorySummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.summaryError =
          action.payload ?? "Failed to fetch activity history summary.";
      });

    /* =====================================================
       FETCH BY ID
       ===================================================== */

    builder
      .addCase(fetchHistoryById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })

      .addCase(fetchHistoryById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedHistory = action.payload;
      })

      .addCase(fetchHistoryById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.payload ?? "Failed to fetch activity history.";
      });

    /* =====================================================
       CREATE
       ===================================================== */

    builder
      .addCase(createHistory.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(createHistory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.histories.unshift(action.payload);
        state.selectedHistory = action.payload;
      })

      .addCase(createHistory.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError =
          action.payload ?? "Failed to create activity history.";
      });

    /* =====================================================
       UPDATE
       ===================================================== */

    builder
      .addCase(updateHistory.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(updateHistory.fulfilled, (state, action) => {
        state.actionLoading = false;

        const index = state.histories.findIndex(
          (item) => item.id === action.payload.id,
        );

        if (index !== -1) {
          state.histories[index] = action.payload;
        }

        if (state.selectedHistory?.id === action.payload.id) {
          state.selectedHistory = action.payload;
        }
      })

      .addCase(updateHistory.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError =
          action.payload ?? "Failed to update activity history.";
      });

    /* =====================================================
       DELETE BY ID
       ===================================================== */

    builder
      .addCase(deleteHistory.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(deleteHistory.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.histories = state.histories.filter(
          (item) => item.id !== action.payload,
        );

        if (state.selectedHistory?.id === action.payload) {
          state.selectedHistory = null;
        }

        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })

      .addCase(deleteHistory.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError =
          action.payload ?? "Failed to delete activity history.";
      });

    /* =====================================================
       DELETE ALL
       ===================================================== */

    builder
      .addCase(deleteAllHistories.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
      })

      .addCase(deleteAllHistories.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.histories = [];
        state.selectedHistory = null;

        state.pagination.total = Math.max(
          0,
          state.pagination.total - action.payload,
        );
      })

      .addCase(deleteAllHistories.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError =
          action.payload ?? "Failed to delete activity histories.";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setHistoryFilter,
  setHistoryFilters,
  resetHistoryFilters,
  setHistoryPage,
  setHistoryLimit,
  setSelectedHistory,
  clearHistoryError,
  clearSelectedHistory,
} = historySlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

export const selectHistories = (state: RootState) => state.history.histories;

export const selectSelectedHistory = (state: RootState) =>
  state.history.selectedHistory;

export const selectHistorySummary = (state: RootState) => state.history.summary;

export const selectHistoryPagination = (state: RootState) =>
  state.history.pagination;

export const selectHistoryFilters = (state: RootState) => state.history.filters;

export const selectHistoryLoading = (state: RootState) => state.history.loading;

export const selectHistorySummaryLoading = (state: RootState) =>
  state.history.summaryLoading;

export const selectHistoryDetailLoading = (state: RootState) =>
  state.history.detailLoading;

export const selectHistoryActionLoading = (state: RootState) =>
  state.history.actionLoading;

export const selectHistoryError = (state: RootState) => state.history.error;

export const selectHistorySummaryError = (state: RootState) =>
  state.history.summaryError;

export const selectHistoryDetailError = (state: RootState) =>
  state.history.detailError;

export const selectHistoryActionError = (state: RootState) =>
  state.history.actionError;

/* =========================================================
   EXPORT
   ========================================================= */

export default historySlice.reducer;
