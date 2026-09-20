/* =========================================================
   ABN FLEET
   ALERT SLICE
   ========================================================= */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import api from "../../api/axios";

import type { RootState } from "../../stores/store";

/* =========================================================
   TYPES
   ========================================================= */

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export type AlertStatus = "NEW" | "ACKNOWLEDGED" | "RESOLVED";

/* =========================================================
   VEHICLE
   ========================================================= */

export interface AlertVehicle {
  id: number;
  vehicle_code: string;
  plate_number: string;
  vehicle_name: string;
}

/* =========================================================
   DEVICE
   ========================================================= */

export interface AlertDevice {
  id: number;
  device_code: string;
  status: string;
}

/* =========================================================
   METADATA
   ========================================================= */

export interface AlertMetadata {
  [key: string]: unknown;
}

/* =========================================================
   ALERT
   ========================================================= */

export interface Alert {
  id: number;

  vehicle_id: number;

  device_id: number | null;

  type: string;

  severity: AlertSeverity;

  title: string;

  message: string;

  latitude: number | string | null;

  longitude: number | string | null;

  metadata: AlertMetadata | null;

  status: AlertStatus;

  triggered_at: string;

  acknowledged_at: string | null;

  resolved_at: string | null;

  created_at: string;

  updated_at: string;

  vehicle?: AlertVehicle;

  device?: AlertDevice | null;
}

/* =========================================================
   SUMMARY TYPES
   ========================================================= */

export interface AlertSummary {
  total: number;

  status: {
    new: number;
    acknowledged: number;
    resolved: number;
  };

  severity: {
    critical: number;
    warning: number;
    info: number;
  };
}

/* =========================================================
   FILTER
   ========================================================= */

export interface AlertFilters {
  vehicle_id?: number | string;

  device_id?: number | string;

  type?: string;

  severity?: AlertSeverity | "";

  status?: AlertStatus | "";

  search?: string;

  limit?: number;

  offset?: number;
}

/* =========================================================
   API RESPONSE
   ========================================================= */

interface AlertsResponse {
  success: boolean;

  count: number;

  data: Alert[];
}

/* =========================================================
   STATE
   ========================================================= */

interface AlertState {
  alerts: Alert[];

  selectedAlert: Alert | null;

  summary: AlertSummary | null;

  filters: AlertFilters;

  count: number;

  loading: boolean;

  detailLoading: boolean;

  summaryLoading: boolean;

  actionLoading: boolean;

  error: string | null;

  actionError: string | null;
}

/* =========================================================
   DEFAULT FILTERS
   ========================================================= */

const defaultAlertFilters: AlertFilters = {
  vehicle_id: "",

  device_id: "",

  type: "",

  severity: "",

  status: "",

  search: "",

  limit: 50,

  offset: 0,
};

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: AlertState = {
  alerts: [],

  selectedAlert: null,

  summary: null,

  filters: {
    ...defaultAlertFilters,
  },

  count: 0,

  loading: false,

  detailLoading: false,

  summaryLoading: false,

  actionLoading: false,

  error: null,

  actionError: null,
};

/* =========================================================
   ERROR HELPER
   ========================================================= */

const getErrorMessage = (error: any, fallback: string): string => {
  return error?.response?.data?.message || error?.message || fallback;
};

/* =========================================================
   GET ALERTS
   GET /api/alerts
   ========================================================= */

export const fetchAlerts = createAsyncThunk<
  AlertsResponse,
  AlertFilters | undefined,
  { rejectValue: string }
>(
  "alerts/fetchAlerts",

  async (filters, { rejectWithValue }) => {
    try {
      const params: Record<string, unknown> = {};

      const activeFilters = filters || {};

      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params[key] = value;
        }
      });

      const response = await api.get("/alerts", {
        params,
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch alerts"));
    }
  },
);

/* =========================================================
   GET ALERT BY ID
   GET /api/alerts/:id
   ========================================================= */

export const fetchAlertById = createAsyncThunk<
  Alert,
  number | string,
  { rejectValue: string }
>(
  "alerts/fetchAlertById",

  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/alerts/${id}`);

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error, "Failed to fetch alert"));
    }
  },
);

/* =========================================================
   CREATE ALERT
   POST /api/alerts
   ========================================================= */

export interface CreateAlertPayload {
  vehicle_id: number | string;

  device_id?: number | string | null;

  type: string;

  severity?: AlertSeverity;

  title: string;

  message: string;

  latitude?: number | string | null;

  longitude?: number | string | null;

  metadata?: AlertMetadata | null;

  triggered_at?: string;
}

export const createAlert = createAsyncThunk<
  Alert,
  CreateAlertPayload,
  { rejectValue: string }
>(
  "alerts/createAlert",

  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/alerts", payload);

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error, "Failed to create alert"));
    }
  },
);

/* =========================================================
   ACKNOWLEDGE ALERT
   PATCH /api/alerts/:id/acknowledge
   ========================================================= */

export const acknowledgeAlert = createAsyncThunk<
  Alert,
  number | string,
  { rejectValue: string }
>(
  "alerts/acknowledgeAlert",

  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/alerts/${id}/acknowledge`);

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to acknowledge alert"),
      );
    }
  },
);

/* =========================================================
   RESOLVE ALERT
   PATCH /api/alerts/:id/resolve
   ========================================================= */

export const resolveAlert = createAsyncThunk<
  Alert,
  number | string,
  { rejectValue: string }
>(
  "alerts/resolveAlert",

  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/alerts/${id}/resolve`);

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error, "Failed to resolve alert"));
    }
  },
);

/* =========================================================
   DELETE ALERT
   DELETE /api/alerts/:id
   ========================================================= */

export const deleteAlert = createAsyncThunk<
  number | string,
  number | string,
  { rejectValue: string }
>(
  "alerts/deleteAlert",

  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/alerts/${id}`);

      return id;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete alert"));
    }
  },
);

/* =========================================================
   GET SUMMARY
   GET /api/alerts/summary
   ========================================================= */

export const fetchAlertSummary = createAsyncThunk<
  AlertSummary,
  void,
  { rejectValue: string }
>(
  "alerts/fetchAlertSummary",

  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/alerts/summary");

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to fetch alert summary"),
      );
    }
  },
);

/* =========================================================
   SLICE
   ========================================================= */

const alertSlice = createSlice({
  name: "alerts",

  initialState,

  reducers: {
    /* =====================================================
   SET FILTER
   ===================================================== */

    setAlertFilter: (
      state,
      action: PayloadAction<{
        key: keyof AlertFilters;
        value: AlertFilters[keyof AlertFilters];
      }>,
    ) => {
      const { key, value } = action.payload;

      state.filters = {
        ...state.filters,
        [key]: value,
      };
    },

    /* =====================================================
       SET ALL FILTERS
       ===================================================== */

    setAlertFilters: (state, action: PayloadAction<Partial<AlertFilters>>) => {
      state.filters = {
        ...state.filters,

        ...action.payload,
      };
    },

    /* =====================================================
       RESET FILTERS
       ===================================================== */

    resetAlertFilters: (state) => {
      state.filters = {
        ...defaultAlertFilters,
      };
    },

    /* =====================================================
       SELECT ALERT
       ===================================================== */

    setSelectedAlert: (state, action: PayloadAction<Alert | null>) => {
      state.selectedAlert = action.payload;
    },

    /* =====================================================
       CLEAR ERROR
       ===================================================== */

    clearAlertError: (state) => {
      state.error = null;

      state.actionError = null;
    },

    /* =====================================================
       CLEAR ALERTS
       ===================================================== */

    clearAlerts: (state) => {
      state.alerts = [];

      state.count = 0;
    },

    /* =====================================================
       CLEAR SELECTED ALERT
       ===================================================== */

    clearSelectedAlert: (state) => {
      state.selectedAlert = null;
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALERTS
       ===================================================== */

    builder

      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;

        state.alerts = action.payload.data;

        state.count = action.payload.count;
      })

      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to fetch alerts";
      });

    /* =====================================================
       FETCH ALERT BY ID
       ===================================================== */

    builder

      .addCase(fetchAlertById.pending, (state) => {
        state.detailLoading = true;

        state.error = null;
        state.actionError = null;
      })

      .addCase(fetchAlertById.fulfilled, (state, action) => {
        state.detailLoading = false;

        state.selectedAlert = action.payload;
      })

      .addCase(fetchAlertById.rejected, (state, action) => {
        state.detailLoading = false;

        state.error = action.payload || "Failed to fetch alert";
      });

    /* =====================================================
       CREATE ALERT
       ===================================================== */

    builder

      .addCase(createAlert.pending, (state) => {
        state.actionLoading = true;

        state.actionError = null;
      })

      .addCase(createAlert.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.alerts.unshift(action.payload);

        state.count += 1;

        state.selectedAlert = action.payload;
      })

      .addCase(createAlert.rejected, (state, action) => {
        state.actionLoading = false;

        state.actionError = action.payload || "Failed to create alert";
      });

    /* =====================================================
       ACKNOWLEDGE
       ===================================================== */

    builder

      .addCase(acknowledgeAlert.pending, (state) => {
        state.actionLoading = true;

        state.actionError = null;
      })

      .addCase(acknowledgeAlert.fulfilled, (state, action) => {
        state.actionLoading = false;

        const updated = action.payload;

        const index = state.alerts.findIndex(
          (alert) => alert.id === updated.id,
        );

        if (index !== -1) {
          state.alerts[index] = updated;
        }

        if (state.selectedAlert?.id === updated.id) {
          state.selectedAlert = updated;
        }
      })

      .addCase(acknowledgeAlert.rejected, (state, action) => {
        state.actionLoading = false;

        state.actionError = action.payload || "Failed to acknowledge alert";
      });

    /* =====================================================
       RESOLVE
       ===================================================== */

    builder

      .addCase(resolveAlert.pending, (state) => {
        state.actionLoading = true;

        state.actionError = null;
      })

      .addCase(resolveAlert.fulfilled, (state, action) => {
        state.actionLoading = false;

        const updated = action.payload;

        const index = state.alerts.findIndex(
          (alert) => alert.id === updated.id,
        );

        if (index !== -1) {
          state.alerts[index] = updated;
        }

        if (state.selectedAlert?.id === updated.id) {
          state.selectedAlert = updated;
        }
      })

      .addCase(resolveAlert.rejected, (state, action) => {
        state.actionLoading = false;

        state.actionError = action.payload || "Failed to resolve alert";
      });

    /* =====================================================
       DELETE
       ===================================================== */

    builder

      .addCase(deleteAlert.pending, (state) => {
        state.actionLoading = true;

        state.actionError = null;
      })

      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.actionLoading = false;

        const deletedId = Number(action.payload);

        state.alerts = state.alerts.filter((alert) => alert.id !== deletedId);

        state.count = Math.max(state.count - 1, 0);

        if (state.selectedAlert?.id === deletedId) {
          state.selectedAlert = null;
        }
      })

      .addCase(deleteAlert.rejected, (state, action) => {
        state.actionLoading = false;

        state.actionError = action.payload || "Failed to delete alert";
      });

    /* =====================================================
       SUMMARY
       ===================================================== */

    builder

      .addCase(fetchAlertSummary.pending, (state) => {
        state.summaryLoading = true;

        state.error = null;
      })

      .addCase(fetchAlertSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;

        state.summary = action.payload;
      })

      .addCase(fetchAlertSummary.rejected, (state, action) => {
        state.summaryLoading = false;

        state.error = action.payload || "Failed to fetch alert summary";
      });
  },
});

/* =========================================================
   EXPORT ACTIONS
   ========================================================= */

export const {
  setAlertFilter,
  setAlertFilters,
  resetAlertFilters,
  setSelectedAlert,
  clearAlertError,
  clearAlerts,
  clearSelectedAlert,
} = alertSlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

export const selectAlerts = (state: RootState) => state.alerts.alerts;

export const selectSelectedAlert = (state: RootState) =>
  state.alerts.selectedAlert;

export const selectAlertSummary = (state: RootState) => state.alerts.summary;

export const selectAlertFilters = (state: RootState) => state.alerts.filters;

export const selectAlertCount = (state: RootState) => state.alerts.count;

export const selectAlertLoading = (state: RootState) => state.alerts.loading;

export const selectAlertDetailLoading = (state: RootState) =>
  state.alerts.detailLoading;

/* =========================================================
   IMPORTANT
   Alerts.tsx membutuhkan selector ini
   ========================================================= */

export const selectAlertSummaryLoading = (state: RootState) =>
  state.alerts.summaryLoading;

export const selectAlertActionLoading = (state: RootState) =>
  state.alerts.actionLoading;

export const selectAlertError = (state: RootState) => state.alerts.error;

export const selectAlertActionError = (state: RootState) =>
  state.alerts.actionError;

/* =========================================================
   EXPORT REDUCER
   ========================================================= */

export default alertSlice.reducer;
