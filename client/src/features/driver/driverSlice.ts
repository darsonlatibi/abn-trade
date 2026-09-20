import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "../../api/axios";

/* =========================================================
   TYPES
   ========================================================= */

export type DriverStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface Driver {
  id: number;

  driver_code: string;
  full_name: string;

  employee_number?: string | null;
  phone_number?: string | null;

  license_number?: string | null;
  license_type?: string | null;

  status: DriverStatus;

  created_at?: string;
  updated_at?: string;
}

/* =========================================================
   FORM
   ========================================================= */

export interface DriverFormData {
  driver_code: string;
  full_name: string;

  employee_number?: string;
  phone_number?: string;

  license_number?: string;
  license_type?: string;

  status?: DriverStatus;
}

/* =========================================================
   RESPONSE
   ========================================================= */

interface DriverResponse {
  success: boolean;
  message?: string;
  data?: Driver | Driver[];
  count?: number;
}

/* =========================================================
   STATE
   ========================================================= */

interface DriverState {
  drivers: Driver[];

  selectedDriver: Driver | null;

  loading: boolean;

  error: string | null;

  success: boolean;

  message: string | null;
}

const initialState: DriverState = {
  drivers: [],

  selectedDriver: null,

  loading: false,

  error: null,

  success: false,

  message: null,
};

/* =========================================================
   GET DRIVERS
   GET /api/driver
   ========================================================= */

export const fetchDrivers = createAsyncThunk<
  Driver[],
  void,
  { rejectValue: string }
>("drivers/fetchDrivers", async (_, thunkAPI) => {
  try {
    const response = await api.get<DriverResponse>("/driver");

    console.log("=================================");
    console.log("ABN DRIVER API STATUS:", response.status);
    console.log("ABN DRIVER API DATA:", response.data);
    console.log("=================================");

    if (!response.data.success) {
      return thunkAPI.rejectWithValue(
        response.data.message || "Gagal mengambil data driver.",
      );
    }

    const data = response.data.data;

    console.log("ABN DRIVER DATA ARRAY:", data);
    console.log("ABN DRIVER IS ARRAY:", Array.isArray(data));

    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error: any) {
    console.error("ABN DRIVER FETCH ERROR:", error);

    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Gagal mengambil data driver.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   GET DRIVER BY ID
   GET /api/driver/:id
   ========================================================= */

export const fetchDriverById = createAsyncThunk<
  Driver,
  number,
  { rejectValue: string }
>("drivers/fetchDriverById", async (id, thunkAPI) => {
  try {
    const response = await api.get<DriverResponse>(`/driver/${id}`);

    if (!response.data.success || !response.data.data) {
      return thunkAPI.rejectWithValue(
        response.data.message || "Driver tidak ditemukan.",
      );
    }

    return response.data.data as Driver;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Gagal mengambil data driver.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   CREATE DRIVER
   POST /api/driver
   ========================================================= */

export const createDriver = createAsyncThunk<
  Driver,
  DriverFormData,
  { rejectValue: string }
>("drivers/createDriver", async (payload, thunkAPI) => {
  try {
    const response = await api.post<DriverResponse>("/driver", payload);

    if (!response.data.success || !response.data.data) {
      return thunkAPI.rejectWithValue(
        response.data.message || "Gagal membuat driver.",
      );
    }

    return response.data.data as Driver;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Gagal membuat driver.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   UPDATE DRIVER
   PUT /api/driver/:id
   ========================================================= */

export const updateDriver = createAsyncThunk<
  Driver,
  { id: number; data: DriverFormData },
  { rejectValue: string }
>("drivers/updateDriver", async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put<DriverResponse>(`/driver/${id}`, data);

    if (!response.data.success || !response.data.data) {
      return thunkAPI.rejectWithValue(
        response.data.message || "Gagal mengupdate driver.",
      );
    }

    return response.data.data as Driver;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Gagal mengupdate driver.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   DELETE DRIVER
   DELETE /api/driver/:id
   ========================================================= */

export const deleteDriver = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("drivers/deleteDriver", async (id, thunkAPI) => {
  try {
    const response = await api.delete<DriverResponse>(`/driver/${id}`);

    if (!response.data.success) {
      return thunkAPI.rejectWithValue(
        response.data.message || "Gagal menghapus driver.",
      );
    }

    return id;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Gagal menghapus driver.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   DRIVER SLICE
   ========================================================= */

const driverSlice = createSlice({
  name: "drivers",

  initialState,

  reducers: {
    /* =====================================================
       CLEAR ERROR
       ===================================================== */

    clearDriverError: (state) => {
      state.error = null;
    },

    /* =====================================================
       CLEAR MESSAGE
       ===================================================== */

    clearDriverMessage: (state) => {
      state.message = null;
      state.success = false;
    },

    /* =====================================================
       SELECT DRIVER
       ===================================================== */

    setSelectedDriver: (state, action) => {
      state.selectedDriver = action.payload;
    },

    /* =====================================================
       CLEAR SELECTED DRIVER
       ===================================================== */

    clearSelectedDriver: (state) => {
      state.selectedDriver = null;
    },
  },

  /* =======================================================
     ASYNC ACTIONS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH DRIVERS
       ===================================================== */

    builder

      .addCase(fetchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload;
        state.error = null;
      })

      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Gagal mengambil data driver.";
      });

    /* =====================================================
       FETCH DRIVER BY ID
       ===================================================== */

    builder

      .addCase(fetchDriverById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchDriverById.fulfilled, (state, action) => {
        state.loading = false;

        state.selectedDriver = action.payload;

        state.error = null;
      })

      .addCase(fetchDriverById.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Driver tidak ditemukan.";
      });

    /* =====================================================
       CREATE DRIVER
       ===================================================== */

    builder

      .addCase(createDriver.pending, (state) => {
        state.loading = true;

        state.error = null;
        state.success = false;
        state.message = null;
      })

      .addCase(createDriver.fulfilled, (state, action) => {
        state.loading = false;

        state.drivers.push(action.payload);

        state.selectedDriver = action.payload;

        state.success = true;

        state.message = "Driver berhasil ditambahkan.";

        state.error = null;
      })

      .addCase(createDriver.rejected, (state, action) => {
        state.loading = false;

        state.success = false;

        state.error = action.payload || "Gagal menambahkan driver.";
      });

    /* =====================================================
       UPDATE DRIVER
       ===================================================== */

    builder

      .addCase(updateDriver.pending, (state) => {
        state.loading = true;

        state.error = null;
        state.success = false;
        state.message = null;
      })

      .addCase(updateDriver.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.drivers.findIndex(
          (driver) => driver.id === action.payload.id,
        );

        if (index !== -1) {
          state.drivers[index] = action.payload;
        }

        state.selectedDriver = action.payload;

        state.success = true;

        state.message = "Data driver berhasil diperbarui.";

        state.error = null;
      })

      .addCase(updateDriver.rejected, (state, action) => {
        state.loading = false;

        state.success = false;

        state.error = action.payload || "Gagal memperbarui driver.";
      });

    /* =====================================================
       DELETE DRIVER
       ===================================================== */

    builder

      .addCase(deleteDriver.pending, (state) => {
        state.loading = true;

        state.error = null;
        state.success = false;
        state.message = null;
      })

      .addCase(deleteDriver.fulfilled, (state, action) => {
        state.loading = false;

        state.drivers = state.drivers.filter(
          (driver) => driver.id !== action.payload,
        );

        if (state.selectedDriver?.id === action.payload) {
          state.selectedDriver = null;
        }

        state.success = true;

        state.message = "Driver berhasil dihapus.";

        state.error = null;
      })

      .addCase(deleteDriver.rejected, (state, action) => {
        state.loading = false;

        state.success = false;

        state.error = action.payload || "Gagal menghapus driver.";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  clearDriverError,
  clearDriverMessage,
  setSelectedDriver,
  clearSelectedDriver,
} = driverSlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

export const selectDrivers = (state: { drivers: DriverState }) =>
  state.drivers.drivers;

export const selectSelectedDriver = (state: { drivers: DriverState }) =>
  state.drivers.selectedDriver;

export const selectDriverLoading = (state: { drivers: DriverState }) =>
  state.drivers.loading;

export const selectDriverError = (state: { drivers: DriverState }) =>
  state.drivers.error;

export const selectDriverSuccess = (state: { drivers: DriverState }) =>
  state.drivers.success;

export const selectDriverMessage = (state: { drivers: DriverState }) =>
  state.drivers.message;

/* =========================================================
   EXPORT
   ========================================================= */

export default driverSlice.reducer;
