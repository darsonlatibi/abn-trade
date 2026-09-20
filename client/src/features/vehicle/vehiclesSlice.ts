import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import api from "../../api/axios";
import type { RootState } from "../../stores/store";

/* =========================================================
   ABN FLEET SYSTEM
   VEHICLES SLICE
   ========================================================= */

/* =========================================================
   TYPES
   ========================================================= */

export type VehicleStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";

export interface Vehicle {
  id: number;

  vehicle_code: string;
  plate_number: string;

  vehicle_name?: string | null;
  vehicle_type?: string | null;

  brand?: string | null;
  model?: string | null;
  year?: number | null;

  company_name?: string | null;
  department?: string | null;

  /* =====================================================
     DRIVER
     ===================================================== */

  driver_id?: number | null;

  status: VehicleStatus;

  created_at?: string;
  updated_at?: string;
}

export interface VehicleFormData {
  vehicle_code: string;
  plate_number: string;

  vehicle_name: string;
  vehicle_type: string;

  brand: string;
  model: string;
  year: string;

  company_name: string;
  department: string;

  status: VehicleStatus;
}

interface UpdateVehiclePayload {
  id: number;
  data: VehicleFormData;
}

interface VehicleState {
  vehicles: Vehicle[];

  selectedVehicle: Vehicle | null;

  loading: boolean;

  error: string | null;

  success: boolean;

  message: string;
}

/* =========================================================
   API
   ========================================================= */

/*
 * axios.ts harus menggunakan:
 *
 * baseURL: "http://localhost:5000/api"
 *
 * sehingga:
 *
 * /vehicles
 *
 * menjadi:
 *
 * /api/vehicles
 */

const API_URL = "/vehicles";

/* =========================================================
   ERROR MESSAGE
   ========================================================= */

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
          error?: string;
        };
      };
      message?: string;
    };

    return (
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      "Terjadi kesalahan pada server."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan pada server.";
};

/* =========================================================
   NORMALIZE VEHICLE PAYLOAD
   ========================================================= */

const normalizeVehiclePayload = (data: VehicleFormData) => ({
  vehicle_code: data.vehicle_code.trim(),

  plate_number: data.plate_number.trim(),

  vehicle_name: data.vehicle_name?.trim() || null,

  vehicle_type: data.vehicle_type?.trim() || "TRUCK",

  brand: data.brand?.trim() || null,

  model: data.model?.trim() || null,

  year: data.year?.trim() ? Number(data.year) : null,

  company_name: data.company_name?.trim() || null,

  department: data.department?.trim() || null,

  status: data.status || "ACTIVE",
});

/* =========================================================
   FETCH VEHICLES
   ========================================================= */

export const fetchVehicles = createAsyncThunk<
  Vehicle[],
  void,
  { rejectValue: string }
>(
  "vehicles/fetchVehicles",

  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URL);

      const result = response.data;

      if (Array.isArray(result)) {
        return result;
      }

      return Array.isArray(result?.data) ? result.data : [];
    } catch (error) {
      console.error("FETCH VEHICLES ERROR:", error);

      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   FETCH VEHICLE BY ID
   ========================================================= */

export const fetchVehicleById = createAsyncThunk<
  Vehicle,
  number,
  { rejectValue: string }
>(
  "vehicles/fetchVehicleById",

  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_URL}/${id}`);

      const result = response.data;

      return result?.data || result;
    } catch (error) {
      console.error("FETCH VEHICLE ERROR:", error);

      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   CREATE VEHICLE
   ========================================================= */

export const createVehicle = createAsyncThunk<
  {
    vehicle: Vehicle;
    message: string;
  },
  VehicleFormData,
  { rejectValue: string }
>(
  "vehicles/createVehicle",

  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URL, normalizeVehiclePayload(data));

      const result = response.data;

      const vehicle = result?.data || result?.vehicle || result;

      return {
        vehicle,

        message: result?.message || "Vehicle berhasil ditambahkan.",
      };
    } catch (error) {
      console.error("CREATE VEHICLE ERROR:", error);

      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   UPDATE VEHICLE
   ========================================================= */

export const updateVehicle = createAsyncThunk<
  {
    vehicle: Vehicle;
    message: string;
  },
  UpdateVehiclePayload,
  { rejectValue: string }
>(
  "vehicles/updateVehicle",

  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `${API_URL}/${id}`,
        normalizeVehiclePayload(data),
      );

      const result = response.data;

      const vehicle = result?.data || result?.vehicle || result;

      return {
        vehicle,

        message: result?.message || "Vehicle berhasil diperbarui.",
      };
    } catch (error) {
      console.error("UPDATE VEHICLE ERROR:", error);

      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   DELETE VEHICLE
   ========================================================= */

export const deleteVehicle = createAsyncThunk<
  {
    id: number;
    message: string;
  },
  number,
  { rejectValue: string }
>(
  "vehicles/deleteVehicle",

  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`${API_URL}/${id}`);

      const result = response.data;

      return {
        id,

        message: result?.message || "Vehicle berhasil dihapus.",
      };
    } catch (error) {
      console.error("DELETE VEHICLE ERROR:", error);

      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: VehicleState = {
  vehicles: [],

  selectedVehicle: null,

  loading: false,

  error: null,

  success: false,

  message: "",
};

/* =========================================================
   SLICE
   ========================================================= */

const vehiclesSlice = createSlice({
  name: "vehicles",

  initialState,

  reducers: {
    /* =====================================================
       SELECT VEHICLE
       ===================================================== */

    setSelectedVehicle: (state, action: PayloadAction<Vehicle | null>) => {
      state.selectedVehicle = action.payload;
    },

    /* =====================================================
       CLEAR ERROR
       ===================================================== */

    clearVehicleError: (state) => {
      state.error = null;
    },

    /* =====================================================
       CLEAR MESSAGE
       ===================================================== */

    clearVehicleMessage: (state) => {
      state.success = false;
      state.message = "";
    },

    /* =====================================================
       RESET STATE
       ===================================================== */

    resetVehicleState: () => initialState,
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH VEHICLES
       ===================================================== */

    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;

        state.vehicles = action.payload;

        state.error = null;
      })

      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Gagal mengambil data vehicles.";
      });

    /* =====================================================
       FETCH VEHICLE BY ID
       ===================================================== */

    builder
      .addCase(fetchVehicleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchVehicleById.fulfilled, (state, action) => {
        state.loading = false;

        state.selectedVehicle = action.payload;

        state.error = null;
      })

      .addCase(fetchVehicleById.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Gagal mengambil data vehicle.";
      });

    /* =====================================================
       CREATE VEHICLE
       ===================================================== */

    builder
      .addCase(createVehicle.pending, (state) => {
        state.loading = true;

        state.error = null;

        state.success = false;

        state.message = "";
      })

      .addCase(createVehicle.fulfilled, (state, action) => {
        state.loading = false;

        state.success = true;

        state.message = action.payload.message;

        state.error = null;

        state.vehicles.push(action.payload.vehicle);
      })

      .addCase(createVehicle.rejected, (state, action) => {
        state.loading = false;

        state.success = false;

        state.error = action.payload || "Gagal menambahkan vehicle.";
      });

    /* =====================================================
       UPDATE VEHICLE
       ===================================================== */

    builder
      .addCase(updateVehicle.pending, (state) => {
        state.loading = true;

        state.error = null;

        state.success = false;

        state.message = "";
      })

      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.loading = false;

        state.success = true;

        state.message = action.payload.message;

        state.error = null;

        const updatedVehicle = action.payload.vehicle;

        const index = state.vehicles.findIndex(
          (vehicle) => vehicle.id === updatedVehicle.id,
        );

        if (index !== -1) {
          state.vehicles[index] = updatedVehicle;
        }

        if (state.selectedVehicle?.id === updatedVehicle.id) {
          state.selectedVehicle = updatedVehicle;
        }
      })

      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading = false;

        state.success = false;

        state.error = action.payload || "Gagal memperbarui vehicle.";
      });

    /* =====================================================
       DELETE VEHICLE
       ===================================================== */

    builder
      .addCase(deleteVehicle.pending, (state) => {
        state.loading = true;

        state.error = null;

        state.success = false;

        state.message = "";
      })

      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.loading = false;

        state.success = true;

        state.message = action.payload.message;

        state.error = null;

        state.vehicles = state.vehicles.filter(
          (vehicle) => vehicle.id !== action.payload.id,
        );

        if (state.selectedVehicle?.id === action.payload.id) {
          state.selectedVehicle = null;
        }
      })

      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading = false;

        state.success = false;

        state.error = action.payload || "Gagal menghapus vehicle.";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setSelectedVehicle,
  clearVehicleError,
  clearVehicleMessage,
  resetVehicleState,
} = vehiclesSlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

export const selectVehicles = (state: RootState) => state.vehicles.vehicles;

export const selectSelectedVehicle = (state: RootState) =>
  state.vehicles.selectedVehicle;

export const selectVehicleLoading = (state: RootState) =>
  state.vehicles.loading;

export const selectVehicleError = (state: RootState) => state.vehicles.error;

export const selectVehicleSuccess = (state: RootState) =>
  state.vehicles.success;

export const selectVehicleMessage = (state: RootState) =>
  state.vehicles.message;

/* =========================================================
   EXPORT REDUCER
   ========================================================= */

export default vehiclesSlice.reducer;
