/* =========================================================
   ABN FLEET
   TRIP SLICE
   ========================================================= */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import api from "../../api/axios";
import type { RootState } from "../../stores/store";
/* =========================================================
   TYPES
   ========================================================= */

export type TripStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

/* =========================================================
   TRIP
   ========================================================= */

export interface Trip {
  id: number;

  vehicle_id: number;
  driver_id?: number | null;
  device_id?: number | null;

  trip_number?: string | null;

  started_at: string;

  start_latitude?: number | null;
  start_longitude?: number | null;
  start_address?: string | null;

  ended_at?: string | null;

  end_latitude?: number | null;
  end_longitude?: number | null;
  end_address?: string | null;

  distance_km: number;
  duration_seconds: number;

  avg_speed_kmh: number;
  max_speed_kmh: number;

  idle_seconds: number;
  stop_count: number;
  alert_count: number;

  status: TripStatus;

  metadata?: Record<string, unknown> | null;

  created_at: string;
  updated_at: string;

  vehicle?: {
    id: number;
    name: string;
  };

  driver?: {
    id: number;
    name: string;
  };

  device?: {
    id: number;
    device_uid: string;
  };
}

/* =========================================================
   PAGINATION
   ========================================================= */

export interface TripPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* =========================================================
   FILTERS
   ========================================================= */

export interface TripFilters {
  page: number;
  limit: number;

  search: string;

  vehicle_id: string;
  driver_id: string;

  status: string;

  date_from: string;
  date_to: string;
}

/* =========================================================
   CREATE
   ========================================================= */

export interface CreateTripPayload {
  vehicle_id: number;

  driver_id?: number | null;
  device_id?: number | null;

  trip_number?: string | null;

  started_at: string;

  start_latitude?: number | null;
  start_longitude?: number | null;
  start_address?: string | null;

  ended_at?: string | null;

  end_latitude?: number | null;
  end_longitude?: number | null;
  end_address?: string | null;

  distance_km?: number;
  duration_seconds?: number;

  avg_speed_kmh?: number;
  max_speed_kmh?: number;

  idle_seconds?: number;
  stop_count?: number;
  alert_count?: number;

  status?: TripStatus;

  metadata?: Record<string, unknown> | null;
}

/* =========================================================
   UPDATE
   ========================================================= */

export interface UpdateTripPayload extends Partial<CreateTripPayload> {
  id: number;
}

/* =========================================================
   UPDATE STATUS
   ========================================================= */

export interface UpdateTripStatusPayload {
  id: number;
  status: TripStatus;
}

/* =========================================================
   STATE
   ========================================================= */

interface TripState {
  trips: Trip[];

  selectedTrip: Trip | null;

  pagination: TripPagination;

  filters: TripFilters;

  loading: boolean;
  detailLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  statusLoading: boolean;
  deleteLoading: boolean;

  error: string | null;
}

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: TripState = {
  trips: [],

  selectedTrip: null,

  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  },

  filters: {
    page: 1,
    limit: 20,

    search: "",

    vehicle_id: "",
    driver_id: "",

    status: "",

    date_from: "",
    date_to: "",
  },

  loading: false,
  detailLoading: false,
  createLoading: false,
  updateLoading: false,
  statusLoading: false,
  deleteLoading: false,

  error: null,
};

/* =========================================================
   FETCH TRIPS
   GET /api/trips
   ========================================================= */

export const fetchTrips = createAsyncThunk<
  {
    data: Trip[];
    pagination: TripPagination;
  },
  Partial<TripFilters> | undefined,
  { rejectValue: string }
>("trips/fetchTrips", async (filters = {}, { rejectWithValue }) => {
  try {
    const params = {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,

      search: filters.search ?? "",

      vehicle_id: filters.vehicle_id ?? "",
      driver_id: filters.driver_id ?? "",

      status: filters.status ?? "",

      date_from: filters.date_from ?? "",
      date_to: filters.date_to ?? "",
    };

    const response = await api.get("/trips", {
      params,
    });

    return {
      data: response.data?.data ?? [],

      pagination: response.data?.pagination ?? {
        total: 0,
        page: params.page,
        limit: params.limit,
        totalPages: 0,
      },
    };
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch trips",
    );
  }
});

/* =========================================================
   FETCH TRIP BY ID
   GET /api/trips/:id
   ========================================================= */

export const fetchTripById = createAsyncThunk<
  Trip,
  number,
  { rejectValue: string }
>("trips/fetchTripById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/trips/${id}`);

    return response.data?.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch trip",
    );
  }
});

/* =========================================================
   CREATE TRIP
   POST /api/trips
   ========================================================= */

export const createTrip = createAsyncThunk<
  Trip,
  CreateTripPayload,
  { rejectValue: string }
>("trips/createTrip", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post("/trips", payload);

    return response.data?.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to create trip",
    );
  }
});

/* =========================================================
   UPDATE TRIP
   PUT /api/trips/:id
   ========================================================= */

export const updateTrip = createAsyncThunk<
  Trip,
  UpdateTripPayload,
  { rejectValue: string }
>("trips/updateTrip", async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/trips/${id}`, payload);

    return response.data?.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update trip",
    );
  }
});

/* =========================================================
   UPDATE TRIP STATUS
   PATCH /api/trips/:id/status
   ========================================================= */

export const updateTripStatus = createAsyncThunk<
  Trip,
  UpdateTripStatusPayload,
  { rejectValue: string }
>("trips/updateTripStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/trips/${id}/status`, {
      status,
    });

    return response.data?.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to update trip status",
    );
  }
});

/* =========================================================
   DELETE TRIP
   DELETE /api/trips/:id
   ========================================================= */

export const deleteTrip = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("trips/deleteTrip", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/trips/${id}`);

    return id;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to delete trip",
    );
  }
});

/* =========================================================
   SLICE
   ========================================================= */

const tripSlice = createSlice({
  name: "trips",

  initialState,

  reducers: {
    /* =====================================================
       SELECT TRIP
       ===================================================== */

    setSelectedTrip: (state, action: PayloadAction<Trip | null>) => {
      state.selectedTrip = action.payload;
    },

    /* =====================================================
       SET FILTER
       ===================================================== */

    setTripFilter: (state, action: PayloadAction<Partial<TripFilters>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    /* =====================================================
       RESET FILTER
       ===================================================== */

    resetTripFilters: (state) => {
      state.filters = {
        ...initialState.filters,
      };
    },

    /* =====================================================
       CLEAR ERROR
       ===================================================== */

    clearTripError: (state) => {
      state.error = null;
    },

    /* =====================================================
       CLEAR SELECTED
       ===================================================== */

    clearSelectedTrip: (state) => {
      state.selectedTrip = null;
    },

    /* =====================================================
       CLEAR TRIPS
       ===================================================== */

    clearTrips: (state) => {
      state.trips = [];

      state.selectedTrip = null;

      state.pagination = {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH TRIPS
       ===================================================== */

    builder
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;

        state.trips = action.payload.data;

        state.pagination = action.payload.pagination;

        state.filters.page = action.payload.pagination.page;

        state.filters.limit = action.payload.pagination.limit;
      })

      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to fetch trips";
      });

    /* =====================================================
       FETCH TRIP BY ID
       ===================================================== */

    builder
      .addCase(fetchTripById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })

      .addCase(fetchTripById.fulfilled, (state, action) => {
        state.detailLoading = false;

        state.selectedTrip = action.payload;
      })

      .addCase(fetchTripById.rejected, (state, action) => {
        state.detailLoading = false;

        state.error = action.payload || "Failed to fetch trip";
      });

    /* =====================================================
       CREATE
       ===================================================== */

    builder
      .addCase(createTrip.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })

      .addCase(createTrip.fulfilled, (state, action) => {
        state.createLoading = false;

        state.trips.unshift(action.payload);

        state.pagination.total += 1;

        state.selectedTrip = action.payload;
      })

      .addCase(createTrip.rejected, (state, action) => {
        state.createLoading = false;

        state.error = action.payload || "Failed to create trip";
      });

    /* =====================================================
       UPDATE
       ===================================================== */

    builder
      .addCase(updateTrip.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })

      .addCase(updateTrip.fulfilled, (state, action) => {
        state.updateLoading = false;

        const index = state.trips.findIndex(
          (trip) => trip.id === action.payload.id,
        );

        if (index !== -1) {
          state.trips[index] = action.payload;
        }

        if (state.selectedTrip?.id === action.payload.id) {
          state.selectedTrip = action.payload;
        }
      })

      .addCase(updateTrip.rejected, (state, action) => {
        state.updateLoading = false;

        state.error = action.payload || "Failed to update trip";
      });

    /* =====================================================
       STATUS
       ===================================================== */

    builder
      .addCase(updateTripStatus.pending, (state) => {
        state.statusLoading = true;
        state.error = null;
      })

      .addCase(updateTripStatus.fulfilled, (state, action) => {
        state.statusLoading = false;

        const index = state.trips.findIndex(
          (trip) => trip.id === action.payload.id,
        );

        if (index !== -1) {
          state.trips[index] = action.payload;
        }

        if (state.selectedTrip?.id === action.payload.id) {
          state.selectedTrip = action.payload;
        }
      })

      .addCase(updateTripStatus.rejected, (state, action) => {
        state.statusLoading = false;

        state.error = action.payload || "Failed to update trip status";
      });

    /* =====================================================
       DELETE
       ===================================================== */

    builder
      .addCase(deleteTrip.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })

      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.deleteLoading = false;

        state.trips = state.trips.filter((trip) => trip.id !== action.payload);

        state.pagination.total = Math.max(state.pagination.total - 1, 0);

        if (state.selectedTrip?.id === action.payload) {
          state.selectedTrip = null;
        }
      })

      .addCase(deleteTrip.rejected, (state, action) => {
        state.deleteLoading = false;

        state.error = action.payload || "Failed to delete trip";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setSelectedTrip,
  setTripFilter,
  resetTripFilters,
  clearTripError,
  clearSelectedTrip,
  clearTrips,
} = tripSlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */
export const selectTrips = (state: RootState): Trip[] => state.trips.trips;

export const selectSelectedTrip = (state: RootState): Trip | null =>
  state.trips.selectedTrip;

export const selectTripPagination = (state: RootState): TripPagination =>
  state.trips.pagination;

export const selectTripFilters = (state: RootState): TripFilters =>
  state.trips.filters;

export const selectTripsLoading = (state: RootState): boolean =>
  state.trips.loading;

export const selectTripDetailLoading = (state: RootState): boolean =>
  state.trips.detailLoading;

export const selectTripCreateLoading = (state: RootState): boolean =>
  state.trips.createLoading;

export const selectTripUpdateLoading = (state: RootState): boolean =>
  state.trips.updateLoading;

export const selectTripStatusLoading = (state: RootState): boolean =>
  state.trips.statusLoading;

export const selectTripDeleteLoading = (state: RootState): boolean =>
  state.trips.deleteLoading;

export const selectTripError = (state: RootState): string | null =>
  state.trips.error;
/* =========================================================
   REDUCER
   ========================================================= */

export default tripSlice.reducer;
