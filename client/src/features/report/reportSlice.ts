/* =========================================================
   ABN FLEET
   REPORT SLICE
   ========================================================= */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";
/* =========================================================
   TYPES
   ========================================================= */

export type ReportType =
  | "FLEET_SUMMARY"
  | "VEHICLE_ACTIVITY"
  | "TRIP_REPORT"
  | "DISTANCE_REPORT"
  | "SPEED_REPORT"
  | "ALERT_REPORT";

export type ReportStatus = "GENERATING" | "COMPLETED" | "FAILED";

/* =========================================================
   VEHICLE
   ========================================================= */

export interface ReportVehicle {
  id: number;
  vehicle_code: string;
  plate_number: string | null;
}

/* =========================================================
   REPORT DATA
   ========================================================= */

export interface ReportData {
  vehicles?: unknown[];
  generated?: boolean;

  [key: string]: unknown;
}

/* =========================================================
   REPORT
   ========================================================= */

export interface Report {
  id: number;

  name: string;

  type: ReportType;

  vehicle_id: number | null;

  date_from: string;

  date_to: string;

  total_vehicles: number;

  active_vehicles: number;

  total_trips: number;

  total_distance: number;

  average_speed: number;

  maximum_speed: number;

  total_alerts: number;

  critical_alerts: number;

  warning_alerts: number;

  driving_seconds: number;

  data: ReportData | null;

  generated_by: number | null;

  generated_at: string | null;

  status: ReportStatus;

  error_message: string | null;

  createdAt: string;

  updatedAt: string;

  vehicle?: ReportVehicle | null;
}

/* =========================================================
   PAGINATION
   ========================================================= */

export interface ReportPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* =========================================================
   FILTERS
   ========================================================= */

export interface ReportFilters {
  page: number;

  limit: number;

  search: string;

  type: string;

  status: string;

  vehicle_id: string;

  date_from: string;

  date_to: string;
}

/* =========================================================
   CREATE PAYLOAD
   ========================================================= */

export interface CreateReportPayload {
  name: string;

  type: ReportType;

  vehicle_id?: number | null;

  date_from: string;

  date_to: string;
}

/* =========================================================
   UPDATE PAYLOAD
   ========================================================= */

export interface UpdateReportPayload {
  id: number;

  name?: string;

  type?: ReportType;

  vehicle_id?: number | null;

  date_from?: string;

  date_to?: string;

  status?: ReportStatus;

  error_message?: string | null;

  data?: ReportData | null;
}

/* =========================================================
   API RESPONSE
   ========================================================= */

interface ReportsResponse {
  success: boolean;

  data: Report[];

  pagination: ReportPagination;

  message?: string;
}

interface ReportResponse {
  success: boolean;

  data: Report;

  message?: string;
}

/* =========================================================
   STATE
   ========================================================= */

interface ReportState {
  reports: Report[];

  selectedReport: Report | null;

  pagination: ReportPagination;

  filters: ReportFilters;

  loading: boolean;

  detailLoading: boolean;

  actionLoading: boolean;

  error: string | null;

  detailError: string | null;

  actionError: string | null;
}

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: ReportState = {
  reports: [],

  selectedReport: null,

  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  filters: {
    page: 1,
    limit: 20,
    search: "",
    type: "",
    status: "",
    vehicle_id: "",
    date_from: "",
    date_to: "",
  },

  loading: false,

  detailLoading: false,

  actionLoading: false,

  error: null,

  detailError: null,

  actionError: null,
};

/* =========================================================
   FETCH REPORTS
   GET /api/reports
   ========================================================= */

export const fetchReports = createAsyncThunk<
  ReportsResponse,
  Partial<ReportFilters> | undefined,
  { rejectValue: string }
>("report/fetchReports", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get<ReportsResponse>("/reports", {
      params: {
        page: params?.page ?? 1,

        limit: params?.limit ?? 20,

        search: params?.search || undefined,

        type: params?.type || undefined,

        status: params?.status || undefined,

        vehicle_id: params?.vehicle_id || undefined,

        date_from: params?.date_from || undefined,

        date_to: params?.date_to || undefined,
      },
    });

    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch reports",
    );
  }
});

/* =========================================================
   FETCH REPORT BY ID
   GET /api/reports/:id
   ========================================================= */

export const fetchReportById = createAsyncThunk<
  ReportResponse,
  number,
  { rejectValue: string }
>("report/fetchReportById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get<ReportResponse>(`/reports/${id}`);

    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch report",
    );
  }
});

/* =========================================================
   CREATE REPORT
   POST /api/reports
   ========================================================= */

export const createReport = createAsyncThunk<
  ReportResponse,
  CreateReportPayload,
  { rejectValue: string }
>("report/createReport", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<ReportResponse>("/reports", payload);

    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to create report",
    );
  }
});

/* =========================================================
   UPDATE REPORT
   PUT /api/reports/:id
   ========================================================= */

export const updateReport = createAsyncThunk<
  ReportResponse,
  UpdateReportPayload,
  { rejectValue: string }
>("report/updateReport", async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const response = await api.put<ReportResponse>(`/reports/${id}`, payload);

    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to update report",
    );
  }
});

/* =========================================================
   DELETE REPORT
   DELETE /api/reports/:id
   ========================================================= */

export const deleteReport = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("report/deleteReport", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/reports/${id}`);

    return id;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to delete report",
    );
  }
});

/* =========================================================
   GENERATE REPORT
   POST /api/reports/:id/generate
   ========================================================= */

export const generateReport = createAsyncThunk<
  ReportResponse,
  number,
  { rejectValue: string }
>("report/generateReport", async (id, { rejectWithValue }) => {
  try {
    const response = await api.post<ReportResponse>(`/reports/${id}/generate`);

    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to generate report",
    );
  }
});

/* =========================================================
   SLICE
   ========================================================= */

const reportSlice = createSlice({
  name: "report",

  initialState,

  reducers: {
    /* =====================================================
       SET FILTER
       ===================================================== */

    setReportFilter: (
      state,
      action: PayloadAction<{
        key: keyof ReportFilters;
        value: string | number;
      }>,
    ) => {
      const { key, value } = action.payload;

      state.filters[key] = value as never;

      /*
       * Every filter change starts from page 1.
       */

      if (key !== "page") {
        state.filters.page = 1;
      }
    },

    /* =====================================================
       SET PAGE
       ===================================================== */

    setReportPage: (state, action: PayloadAction<number>) => {
      state.filters.page = Math.max(action.payload, 1);
    },

    /* =====================================================
       SET SELECTED REPORT
       ===================================================== */

    setSelectedReport: (state, action: PayloadAction<Report | null>) => {
      state.selectedReport = action.payload;
    },

    /* =====================================================
       CLEAR ERRORS
       ===================================================== */

    clearReportErrors: (state) => {
      state.error = null;

      state.detailError = null;

      state.actionError = null;
    },

    /* =====================================================
       RESET FILTER
       ===================================================== */

    resetReportFilters: (state) => {
      state.filters = {
        ...initialState.filters,
      };
    },

    /* =====================================================
       RESET REPORT STATE
       ===================================================== */

    resetReportState: () => {
      return initialState;
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH REPORTS
       ===================================================== */

    builder

      .addCase(fetchReports.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;

        state.reports = action.payload.data ?? [];

        state.pagination = action.payload.pagination ?? initialState.pagination;
      })

      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to fetch reports";
      });

    /* =====================================================
       FETCH REPORT BY ID
       ===================================================== */

    builder

      .addCase(fetchReportById.pending, (state) => {
        state.detailLoading = true;

        state.detailError = null;
      })

      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.detailLoading = false;

        state.selectedReport = action.payload.data;
      })

      .addCase(fetchReportById.rejected, (state, action) => {
        state.detailLoading = false;

        state.detailError = action.payload || "Failed to fetch report";
      });

    /* =====================================================
       CREATE REPORT
       ===================================================== */

    builder

      .addCase(createReport.pending, (state) => {
        state.actionLoading = true;

        state.actionError = null;
      })

      .addCase(createReport.fulfilled, (state, action) => {
        state.actionLoading = false;

        state.reports.unshift(action.payload.data);

        state.pagination.total += 1;

        state.selectedReport = action.payload.data;
      })

      .addCase(createReport.rejected, (state, action) => {
        state.actionLoading = false;

        state.actionError = action.payload || "Failed to create report";
      });

    /* =====================================================
       UPDATE REPORT
       ===================================================== */

    builder

      .addCase(updateReport.pending, (state) => {
        state.actionLoading = true;

        state.actionError = null;
      })

      .addCase(updateReport.fulfilled, (state, action) => {
        state.actionLoading = false;

        const updated = action.payload.data;

        const index = state.reports.findIndex((item) => item.id === updated.id);

        if (index !== -1) {
          state.reports[index] = updated;
        }

        if (state.selectedReport?.id === updated.id) {
          state.selectedReport = updated;
        }
      })

      .addCase(updateReport.rejected, (state, action) => {
        state.actionLoading = false;

        state.actionError = action.payload || "Failed to update report";
      });

    /* =====================================================
       DELETE REPORT
       ===================================================== */

    builder

      .addCase(deleteReport.pending, (state) => {
        state.actionLoading = true;

        state.actionError = null;
      })

      .addCase(deleteReport.fulfilled, (state, action) => {
        state.actionLoading = false;

        const deletedId = action.payload;

        state.reports = state.reports.filter((item) => item.id !== deletedId);

        state.pagination.total = Math.max(state.pagination.total - 1, 0);

        if (state.selectedReport?.id === deletedId) {
          state.selectedReport = null;
        }
      })

      .addCase(deleteReport.rejected, (state, action) => {
        state.actionLoading = false;

        state.actionError = action.payload || "Failed to delete report";
      });

    /* =====================================================
       GENERATE REPORT
       ===================================================== */

    builder

      .addCase(generateReport.pending, (state) => {
        state.actionLoading = true;

        state.actionError = null;
      })

      .addCase(generateReport.fulfilled, (state, action) => {
        state.actionLoading = false;

        const generated = action.payload.data;

        const index = state.reports.findIndex(
          (item) => item.id === generated.id,
        );

        if (index !== -1) {
          state.reports[index] = generated;
        }

        if (state.selectedReport?.id === generated.id) {
          state.selectedReport = generated;
        }
      })

      .addCase(generateReport.rejected, (state, action) => {
        state.actionLoading = false;

        state.actionError = action.payload || "Failed to generate report";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setReportFilter,
  setReportPage,
  setSelectedReport,
  clearReportErrors,
  resetReportFilters,
  resetReportState,
} = reportSlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

export const selectReports = (state: { report: ReportState }) =>
  state.report.reports;

export const selectSelectedReport = (state: { report: ReportState }) =>
  state.report.selectedReport;

export const selectReportPagination = (state: { report: ReportState }) =>
  state.report.pagination;

export const selectReportFilters = (state: { report: ReportState }) =>
  state.report.filters;

export const selectReportLoading = (state: { report: ReportState }) =>
  state.report.loading;

export const selectReportDetailLoading = (state: { report: ReportState }) =>
  state.report.detailLoading;

export const selectReportActionLoading = (state: { report: ReportState }) =>
  state.report.actionLoading;

export const selectReportError = (state: { report: ReportState }) =>
  state.report.error;

export const selectReportDetailError = (state: { report: ReportState }) =>
  state.report.detailError;

export const selectReportActionError = (state: { report: ReportState }) =>
  state.report.actionError;

/* =========================================================
   EXPORT REDUCER
   ========================================================= */

export default reportSlice.reducer;
