import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import api from "../../api/axios";

/* =========================================================
   ABN FLEET SYSTEM
   GPS SLICE
   ========================================================= */

/* =========================================================
   TYPES
   ========================================================= */

export type GPSStatus = "MOVING" | "STOPPED" | "OFFLINE";

export interface GPSPosition {
  id: number;

  vehicle_id: number;
  device_id: number | null;

  latitude: number | string;
  longitude: number | string;

  altitude: number | string | null;

  speed: number | string | null;

  heading: number | string | null;

  satellites: number | null;

  accuracy: number | string | null;

  status: GPSStatus;

  recorded_at: string;

  created_at?: string;
}

interface GPSResponse {
  success: boolean;
  count: number;
  data: GPSPosition[];
  message?: string;
}

interface GPSState {
  positions: GPSPosition[];

  loading: boolean;

  error: string | null;
}

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: GPSState = {
  positions: [],

  loading: false,

  error: null,
};

/* =========================================================
   GET GPS POSITIONS
   GET /api/gps
   ========================================================= */

export const fetchGPSPositions = createAsyncThunk<
  GPSPosition[],
  | {
      vehicle_id?: number;
      device_id?: number;
      status?: GPSStatus;
      limit?: number;
      offset?: number;
    }
  | undefined,
  {
    rejectValue: string;
  }
>(
  "gps/fetchGPSPositions",

  async (params = {}, thunkAPI) => {
    try {
      const response = await api.get<GPSResponse>("/gps", {
        params: {
          vehicle_id: params.vehicle_id,
          device_id: params.device_id,
          status: params.status,
          limit: params.limit ?? 100,
          offset: params.offset ?? 0,
        },

        withCredentials: true,
      });

      if (!response.data?.success) {
        return thunkAPI.rejectWithValue(
          response.data?.message || "Failed to get GPS positions.",
        );
      }

      return response.data.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        "Failed to get GPS positions.";

      return thunkAPI.rejectWithValue(message);
    }
  },
);

/* =========================================================
   CREATE GPS POSITION
   POST /api/gps
   ========================================================= */

export const createGPSPosition = createAsyncThunk<
  GPSPosition,
  Omit<GPSPosition, "id" | "created_at">,
  {
    rejectValue: string;
  }
>(
  "gps/createGPSPosition",

  async (gpsData, thunkAPI) => {
    try {
      const response = await api.post<{
        success: boolean;
        data: GPSPosition;
        message?: string;
      }>("/gps", gpsData, {
        withCredentials: true,
      });

      if (!response.data?.success || !response.data?.data) {
        return thunkAPI.rejectWithValue(
          response.data?.message || "Failed to create GPS position.",
        );
      }

      return response.data.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        "Failed to create GPS position.";

      return thunkAPI.rejectWithValue(message);
    }
  },
);

/* =========================================================
   GET GPS POSITION BY ID
   GET /api/gps/:id
   ========================================================= */

export const fetchGPSPositionById = createAsyncThunk<
  GPSPosition,
  number,
  {
    rejectValue: string;
  }
>(
  "gps/fetchGPSPositionById",

  async (id, thunkAPI) => {
    try {
      const response = await api.get<{
        success: boolean;
        data: GPSPosition;
        message?: string;
      }>(`/gps/${id}`, {
        withCredentials: true,
      });

      if (!response.data?.success || !response.data?.data) {
        return thunkAPI.rejectWithValue(
          response.data?.message || "GPS position not found.",
        );
      }

      return response.data.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        "Failed to get GPS position.";

      return thunkAPI.rejectWithValue(message);
    }
  },
);

/* =========================================================
   GET LATEST GPS BY VEHICLE
   GET /api/gps/vehicle/:vehicleId/latest
   ========================================================= */

export const fetchLatestGPSByVehicle = createAsyncThunk<
  GPSPosition,
  number,
  {
    rejectValue: string;
  }
>(
  "gps/fetchLatestGPSByVehicle",

  async (vehicleId, thunkAPI) => {
    try {
      const response = await api.get<{
        success: boolean;
        data: GPSPosition;
        message?: string;
      }>(`/gps/vehicle/${vehicleId}/latest`, {
        withCredentials: true,
      });

      if (!response.data?.success || !response.data?.data) {
        return thunkAPI.rejectWithValue(
          response.data?.message || "Latest GPS position not found.",
        );
      }

      return response.data.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        "Failed to get latest GPS position.";

      return thunkAPI.rejectWithValue(message);
    }
  },
);

/* =========================================================
   GET GPS HISTORY BY VEHICLE
   GET /api/gps/vehicle/:vehicleId
   ========================================================= */

export const fetchGPSHistoryByVehicle = createAsyncThunk<
  GPSPosition[],
  {
    vehicleId: number;
    limit?: number;
    offset?: number;
  },
  {
    rejectValue: string;
  }
>(
  "gps/fetchGPSHistoryByVehicle",

  async ({ vehicleId, limit = 500, offset = 0 }, thunkAPI) => {
    try {
      const response = await api.get<GPSResponse>(`/gps/vehicle/${vehicleId}`, {
        params: {
          limit,
          offset,
        },

        withCredentials: true,
      });

      if (!response.data?.success) {
        return thunkAPI.rejectWithValue(
          response.data?.message || "Failed to get GPS history.",
        );
      }

      return response.data.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        "Failed to get GPS history.";

      return thunkAPI.rejectWithValue(message);
    }
  },
);

/* =========================================================
   UPDATE GPS POSITION
   PUT /api/gps/:id
   ========================================================= */

export const updateGPSPosition = createAsyncThunk<
  GPSPosition,
  {
    id: number;
    data: Partial<Omit<GPSPosition, "id">>;
  },
  {
    rejectValue: string;
  }
>(
  "gps/updateGPSPosition",

  async ({ id, data }, thunkAPI) => {
    try {
      const response = await api.put<{
        success: boolean;
        data: GPSPosition;
        message?: string;
      }>(`/gps/${id}`, data, {
        withCredentials: true,
      });

      if (!response.data?.success || !response.data?.data) {
        return thunkAPI.rejectWithValue(
          response.data?.message || "Failed to update GPS position.",
        );
      }

      return response.data.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        "Failed to update GPS position.";

      return thunkAPI.rejectWithValue(message);
    }
  },
);

/* =========================================================
   DELETE GPS POSITION
   DELETE /api/gps/:id
   ========================================================= */

export const deleteGPSPosition = createAsyncThunk<
  number,
  number,
  {
    rejectValue: string;
  }
>(
  "gps/deleteGPSPosition",

  async (id, thunkAPI) => {
    try {
      const response = await api.delete<{
        success: boolean;
        message?: string;
      }>(`/gps/${id}`, {
        withCredentials: true,
      });

      if (!response.data?.success) {
        return thunkAPI.rejectWithValue(
          response.data?.message || "Failed to delete GPS position.",
        );
      }

      return id;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        "Failed to delete GPS position.";

      return thunkAPI.rejectWithValue(message);
    }
  },
);

/* =========================================================
   SLICE
   ========================================================= */

const gpsSlice = createSlice({
  name: "gps",

  initialState,

  reducers: {
    /* =====================================================
       REALTIME GPS

       MQTT → Backend → WebSocket → Redux
       ===================================================== */

    updateRealtimeGPS: (state, action: PayloadAction<GPSPosition>) => {
      const incoming = action.payload;

      /*
       * Cari berdasarkan device_id
       */

      let index =
        incoming.device_id !== null
          ? state.positions.findIndex(
              (position) => position.device_id === incoming.device_id,
            )
          : -1;

      /*
       * Fallback vehicle_id
       */

      if (index < 0) {
        index = state.positions.findIndex(
          (position) => position.vehicle_id === incoming.vehicle_id,
        );
      }

      /*
       * Update existing
       */

      if (index >= 0) {
        state.positions[index] = {
          ...state.positions[index],
          ...incoming,
        };
      } else {
        /*
         * Add new vehicle
         */

        state.positions.unshift(incoming);
      }

      /*
       * Maximum 100 vehicles
       */

      if (state.positions.length > 100) {
        state.positions = state.positions.slice(0, 100);
      }
    },

    /* =====================================================
       CLEAR
       ===================================================== */

    clearGPSPositions: (state) => {
      state.positions = [];

      state.error = null;
    },

    /* =====================================================
       CLEAR ERROR
       ===================================================== */

    clearGPSError: (state) => {
      state.error = null;
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    builder

      /* ===================================================
         FETCH
         =================================================== */

      .addCase(fetchGPSPositions.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(fetchGPSPositions.fulfilled, (state, action) => {
        state.loading = false;

        state.error = null;

        state.positions = action.payload;
      })

      .addCase(fetchGPSPositions.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to get GPS positions.";
      })

      /* ===================================================
         CREATE
         =================================================== */

      .addCase(createGPSPosition.fulfilled, (state, action) => {
        state.positions.unshift(action.payload);
      })

      .addCase(createGPSPosition.rejected, (state, action) => {
        state.error = action.payload || "Failed to create GPS position.";
      })

      /* ===================================================
         GET BY ID
         =================================================== */

      .addCase(fetchGPSPositionById.fulfilled, (state, action) => {
        const index = state.positions.findIndex(
          (position) => position.id === action.payload.id,
        );

        if (index >= 0) {
          state.positions[index] = action.payload;
        } else {
          state.positions.unshift(action.payload);
        }
      })

      /* ===================================================
         LATEST VEHICLE
         =================================================== */

      .addCase(fetchLatestGPSByVehicle.fulfilled, (state, action) => {
        const incoming = action.payload;

        const index = state.positions.findIndex(
          (position) => position.vehicle_id === incoming.vehicle_id,
        );

        if (index >= 0) {
          state.positions[index] = incoming;
        } else {
          state.positions.unshift(incoming);
        }
      })

      /* ===================================================
         HISTORY
         =================================================== */

      .addCase(fetchGPSHistoryByVehicle.fulfilled, (state, action) => {
        state.positions = action.payload;
      })

      /* ===================================================
         UPDATE
         =================================================== */

      .addCase(updateGPSPosition.fulfilled, (state, action) => {
        const index = state.positions.findIndex(
          (position) => position.id === action.payload.id,
        );

        if (index >= 0) {
          state.positions[index] = action.payload;
        }
      })

      /* ===================================================
         DELETE
         =================================================== */

      .addCase(deleteGPSPosition.fulfilled, (state, action) => {
        state.positions = state.positions.filter(
          (position) => position.id !== action.payload,
        );
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const { updateRealtimeGPS, clearGPSPositions, clearGPSError } =
  gpsSlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

export const selectGPSPositions = (state: { gps: GPSState }) =>
  state.gps.positions;

export const selectGPSLoading = (state: { gps: GPSState }) => state.gps.loading;

export const selectGPSError = (state: { gps: GPSState }) => state.gps.error;

/* =========================================================
   REDUCER
   ========================================================= */

export default gpsSlice.reducer;
