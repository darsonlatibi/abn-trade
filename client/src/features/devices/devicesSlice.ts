import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";
/* =========================================================
   ABN FLEET SYSTEM
   DEVICES SLICE
   ========================================================= */

/* =========================================================
   TYPES
   ========================================================= */

export interface VehicleSummary {
  id: number;
  vehicle_code: string;
  plate_number: string;
  vehicle_name: string;
}

export interface Device {
  id: number;
  device_code: string;
  esp_chip_id: string | null;
  modem_imei: string | null;
  sim_iccid: string | null;
  firmware_version: string | null;
  vehicle_id: number | null;
  status: string;

  vehicle?: VehicleSummary | null;

  created_at?: string;
  updated_at?: string;
}

export interface DevicePayload {
  device_code: string;
  esp_chip_id?: string | null;
  modem_imei?: string | null;
  sim_iccid?: string | null;
  firmware_version?: string | null;
  vehicle_id?: number | null;
  status?: string;
}

/* =========================================================
   API RESPONSE
   ========================================================= */

interface DevicesResponse {
  success: boolean;
  count: number;
  data: Device[];
  message?: string;
}

interface DeviceResponse {
  success: boolean;
  data: Device;
  message?: string;
}

interface MessageResponse {
  success: boolean;
  message: string;
}

/* =========================================================
   STATE
   ========================================================= */

interface DevicesState {
  devices: Device[];

  selectedDevice: Device | null;

  loading: boolean;
  saving: boolean;
  deleting: boolean;

  error: string | null;
  successMessage: string | null;
}

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: DevicesState = {
  devices: [],

  selectedDevice: null,

  loading: false,
  saving: false,
  deleting: false,

  error: null,
  successMessage: null,
};

/* =========================================================
   GET ALL DEVICES
   GET /api/devices
   ========================================================= */

export const fetchDevices = createAsyncThunk<
  Device[],
  void,
  { rejectValue: string }
>("devices/fetchDevices", async (_, thunkAPI) => {
  try {
    console.log("[DEVICES] Fetching /devices...");

    const response = await api.get<DevicesResponse>("/devices");

    console.log("[DEVICES] HTTP status:", response.status);
    console.log("[DEVICES] response.data:", response.data);
    console.log("[DEVICES] response.data.data:", response.data.data);

    if (!response.data.success) {
      return thunkAPI.rejectWithValue(
        response.data.message || "Gagal mengambil data device.",
      );
    }

    return response.data.data;
  } catch (error: any) {
    console.error("[DEVICES] FETCH ERROR:", error);
    console.error("[DEVICES] ERROR RESPONSE:", error?.response?.data);

    return thunkAPI.rejectWithValue(
      error?.response?.data?.message || "Gagal mengambil data device.",
    );
  }
});

/* =========================================================
   GET DEVICE BY ID
   GET /api/devices/:id
   ========================================================= */

export const fetchDeviceById = createAsyncThunk<
  Device,
  number | string,
  { rejectValue: string }
>("devices/fetchDeviceById", async (id, thunkAPI) => {
  try {
    const response = await api.get<DeviceResponse>(`/devices/${id}`);

    if (!response.data.success) {
      return thunkAPI.rejectWithValue(
        response.data.message || "Device tidak ditemukan.",
      );
    }

    return response.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.response?.data?.message || "Gagal mengambil data device.",
    );
  }
});

/* =========================================================
   CREATE DEVICE
   POST /api/devices
   ========================================================= */

export const createDevice = createAsyncThunk<
  Device,
  DevicePayload,
  { rejectValue: string }
>("devices/createDevice", async (payload, thunkAPI) => {
  try {
    const response = await api.post<DeviceResponse>("/devices", payload);

    if (!response.data.success) {
      return thunkAPI.rejectWithValue(
        response.data.message || "Gagal menambahkan device.",
      );
    }

    return response.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.response?.data?.message || "Gagal menambahkan device.",
    );
  }
});

/* =========================================================
   UPDATE DEVICE
   PUT /api/devices/:id
   ========================================================= */

export const updateDevice = createAsyncThunk<
  Device,
  {
    id: number | string;
    data: Partial<DevicePayload>;
  },
  { rejectValue: string }
>("devices/updateDevice", async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put<DeviceResponse>(`/devices/${id}`, data);

    if (!response.data.success) {
      return thunkAPI.rejectWithValue(
        response.data.message || "Gagal memperbarui device.",
      );
    }

    return response.data.data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.response?.data?.message || "Gagal memperbarui device.",
    );
  }
});

/* =========================================================
   DELETE DEVICE
   DELETE /api/devices/:id
   ========================================================= */

export const deleteDevice = createAsyncThunk<
  number | string,
  number | string,
  { rejectValue: string }
>("devices/deleteDevice", async (id, thunkAPI) => {
  try {
    const response = await api.delete<MessageResponse>(`/devices/${id}`);

    if (!response.data.success) {
      return thunkAPI.rejectWithValue(
        response.data.message || "Gagal menghapus device.",
      );
    }

    return id;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error?.response?.data?.message || "Gagal menghapus device.",
    );
  }
});

/* =========================================================
   SLICE
   ========================================================= */

const devicesSlice = createSlice({
  name: "devices",

  initialState,

  reducers: {
    /* =====================================================
       CLEAR ERROR
       ===================================================== */

    clearDeviceError(state) {
      state.error = null;
    },

    /* =====================================================
       CLEAR SUCCESS MESSAGE
       ===================================================== */

    clearDeviceSuccess(state) {
      state.successMessage = null;
    },

    /* =====================================================
       CLEAR SELECTED DEVICE
       ===================================================== */

    clearSelectedDevice(state) {
      state.selectedDevice = null;
    },

    /* =====================================================
       SET SELECTED DEVICE
       ===================================================== */

    setSelectedDevice(state, action: PayloadAction<Device | null>) {
      state.selectedDevice = action.payload;
    },

    /* =====================================================
       CLEAR DEVICES
       ===================================================== */

    clearDevices(state) {
      state.devices = [];
      state.selectedDevice = null;
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH DEVICES
       ===================================================== */

    builder

      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.devices = action.payload;
      })

      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Gagal mengambil data device.";
      });

    /* =====================================================
       FETCH DEVICE BY ID
       ===================================================== */

    builder

      .addCase(fetchDeviceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchDeviceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedDevice = action.payload;
      })

      .addCase(fetchDeviceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Gagal mengambil data device.";
      });

    /* =====================================================
       CREATE DEVICE
       ===================================================== */

    builder

      .addCase(createDevice.pending, (state) => {
        state.saving = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(createDevice.fulfilled, (state, action) => {
        state.saving = false;

        state.devices.unshift(action.payload);

        state.selectedDevice = action.payload;

        state.successMessage = "Device berhasil ditambahkan.";
      })

      .addCase(createDevice.rejected, (state, action) => {
        state.saving = false;

        state.error = action.payload || "Gagal menambahkan device.";
      });

    /* =====================================================
       UPDATE DEVICE
       ===================================================== */

    builder

      .addCase(updateDevice.pending, (state) => {
        state.saving = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(updateDevice.fulfilled, (state, action) => {
        state.saving = false;

        const index = state.devices.findIndex(
          (device) => device.id === action.payload.id,
        );

        if (index !== -1) {
          state.devices[index] = action.payload;
        }

        state.selectedDevice = action.payload;

        state.successMessage = "Device berhasil diperbarui.";
      })

      .addCase(updateDevice.rejected, (state, action) => {
        state.saving = false;

        state.error = action.payload || "Gagal memperbarui device.";
      });

    /* =====================================================
       DELETE DEVICE
       ===================================================== */

    builder

      .addCase(deleteDevice.pending, (state) => {
        state.deleting = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(deleteDevice.fulfilled, (state, action) => {
        state.deleting = false;

        state.devices = state.devices.filter(
          (device) => String(device.id) !== String(action.payload),
        );

        if (
          state.selectedDevice &&
          String(state.selectedDevice.id) === String(action.payload)
        ) {
          state.selectedDevice = null;
        }

        state.successMessage = "Device berhasil dihapus.";
      })

      .addCase(deleteDevice.rejected, (state, action) => {
        state.deleting = false;

        state.error = action.payload || "Gagal menghapus device.";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  clearDeviceError,
  clearDeviceSuccess,
  clearSelectedDevice,
  setSelectedDevice,
  clearDevices,
} = devicesSlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

export const selectDevices = (state: { devices: DevicesState }) =>
  state.devices.devices;

export const selectSelectedDevice = (state: { devices: DevicesState }) =>
  state.devices.selectedDevice;

export const selectDevicesLoading = (state: { devices: DevicesState }) =>
  state.devices.loading;

export const selectDevicesSaving = (state: { devices: DevicesState }) =>
  state.devices.saving;

export const selectDevicesDeleting = (state: { devices: DevicesState }) =>
  state.devices.deleting;

export const selectDevicesError = (state: { devices: DevicesState }) =>
  state.devices.error;

export const selectDevicesSuccess = (state: { devices: DevicesState }) =>
  state.devices.successMessage;

/* =========================================================
   EXPORT
   ========================================================= */

export default devicesSlice.reducer;
