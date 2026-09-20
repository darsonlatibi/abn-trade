import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* =========================================================
   ABN FLEET SYSTEM
   GEOFENCE SLICE
   ========================================================= */

/* =========================================================
   TYPES
   ========================================================= */

export interface Geofence {
  id: string | number;

  name: string;

  description?: string | null;

  type?: string;

  latitude?: number | null;

  longitude?: number | null;

  radius?: number | null;

  coordinates?: unknown;

  status?: string;

  created_at?: string;

  updated_at?: string;
}

/* =========================================================
   CREATE / UPDATE PAYLOAD
   ========================================================= */

export interface GeofencePayload {
  name: string;

  description?: string;

  type?: string;

  latitude?: number;

  longitude?: number;

  radius?: number;

  coordinates?: unknown;

  status?: string;
}

/* =========================================================
   CHECK GEOFENCE PAYLOAD
   ========================================================= */

export interface CheckGeofencePayload {
  latitude: number;

  longitude: number;
}

/* =========================================================
   CHECK GEOFENCE RESULT
   ========================================================= */

export interface GeofenceCheckResult {
  inside?: boolean;

  distance?: number;

  status?: string;

  geofence?: Geofence;

  message?: string;

  [key: string]: unknown;
}

/* =========================================================
   API RESPONSE
   ========================================================= */

interface GeofenceResponse {
  success?: boolean;

  message?: string;

  data?: Geofence | Geofence[] | GeofenceCheckResult;

  geofence?: Geofence;

  geofences?: Geofence[];

  result?: GeofenceCheckResult;
}

/* =========================================================
   STATE
   ========================================================= */

interface GeofenceState {
  geofences: Geofence[];

  selectedGeofence: Geofence | null;

  checkResult: GeofenceCheckResult | null;

  loading: boolean;

  creating: boolean;

  updating: boolean;

  deleting: boolean;

  checking: boolean;

  error: string | null;

  success: boolean;

  message: string | null;
}

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: GeofenceState = {
  geofences: [],

  selectedGeofence: null,

  checkResult: null,

  loading: false,

  creating: false,

  updating: false,

  deleting: false,

  checking: false,

  error: null,

  success: false,

  message: null,
};

/* =========================================================
   GET ALL GEOFENCES
   GET /api/geofence
   ========================================================= */

export const fetchGeofences = createAsyncThunk<
  Geofence[],
  void,
  { rejectValue: string }
>("geofence/fetchGeofences", async (_, thunkAPI) => {
  try {
    const response = await api.get<GeofenceResponse>("/geofence");

    const data = response.data;

    /* -----------------------------------------
       { geofences: [...] }
       ----------------------------------------- */

    if (Array.isArray(data.geofences)) {
      return data.geofences;
    }

    /* -----------------------------------------
       { data: [...] }
       ----------------------------------------- */

    if (Array.isArray(data.data)) {
      return data.data as Geofence[];
    }

    return [];
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Gagal mengambil data geofence.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   GET GEOFENCE BY ID
   GET /api/geofence/:id
   ========================================================= */

export const fetchGeofenceById = createAsyncThunk<
  Geofence,
  string | number,
  { rejectValue: string }
>("geofence/fetchGeofenceById", async (id, thunkAPI) => {
  try {
    const response = await api.get<GeofenceResponse>(`/geofence/${id}`);

    const data = response.data;

    const geofence =
      data.geofence ??
      (!Array.isArray(data.data)
        ? (data.data as Geofence | undefined)
        : undefined);

    if (!geofence) {
      return thunkAPI.rejectWithValue("Data geofence tidak ditemukan.");
    }

    return geofence;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Gagal mengambil geofence.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   CREATE GEOFENCE
   POST /api/geofence
   ========================================================= */

export const createGeofence = createAsyncThunk<
  Geofence,
  GeofencePayload,
  { rejectValue: string }
>("geofence/createGeofence", async (payload, thunkAPI) => {
  try {
    const response = await api.post<GeofenceResponse>("/geofence", payload);

    const data = response.data;

    const geofence =
      data.geofence ??
      (!Array.isArray(data.data)
        ? (data.data as Geofence | undefined)
        : undefined);

    if (!geofence) {
      return thunkAPI.rejectWithValue(
        "Geofence berhasil dibuat tetapi data tidak diterima.",
      );
    }

    return geofence;
  } catch (error: any) {
    const message = error?.response?.data?.message || "Gagal membuat geofence.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   UPDATE GEOFENCE
   PUT /api/geofence/:id
   ========================================================= */

export const updateGeofence = createAsyncThunk<
  Geofence,
  {
    id: string | number;

    data: GeofencePayload;
  },
  { rejectValue: string }
>("geofence/updateGeofence", async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put<GeofenceResponse>(`/geofence/${id}`, data);

    const responseData = response.data;

    const geofence =
      responseData.geofence ??
      (!Array.isArray(responseData.data)
        ? (responseData.data as Geofence | undefined)
        : undefined);

    if (!geofence) {
      return thunkAPI.rejectWithValue(
        "Geofence berhasil diperbarui tetapi data tidak diterima.",
      );
    }

    return geofence;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Gagal memperbarui geofence.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   DELETE GEOFENCE
   DELETE /api/geofence/:id
   ========================================================= */

export const deleteGeofence = createAsyncThunk<
  string | number,
  string | number,
  { rejectValue: string }
>("geofence/deleteGeofence", async (id, thunkAPI) => {
  try {
    await api.delete(`/geofence/${id}`);

    return id;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Gagal menghapus geofence.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   CHECK GEOFENCE
   POST /api/geofence/:id/check
   ========================================================= */

export const checkGeofence = createAsyncThunk<
  GeofenceCheckResult,
  {
    id: string | number;

    latitude: number;

    longitude: number;
  },
  { rejectValue: string }
>("geofence/checkGeofence", async ({ id, latitude, longitude }, thunkAPI) => {
  try {
    const response = await api.post<GeofenceResponse>(`/geofence/${id}/check`, {
      latitude,
      longitude,
    });

    const data = response.data;

    /* -----------------------------------------
         PRIORITY:
         result
         ----------------------------------------- */

    if (data.result) {
      return data.result;
    }

    /* -----------------------------------------
         { data: {...} }
         ----------------------------------------- */

    if (data.data && !Array.isArray(data.data)) {
      return data.data as GeofenceCheckResult;
    }

    return thunkAPI.rejectWithValue(
      "Hasil pengecekan geofence tidak diterima.",
    );
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Gagal melakukan pengecekan geofence.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   SLICE
   ========================================================= */

const geofenceSlice = createSlice({
  name: "geofence",

  initialState,

  reducers: {
    /* -----------------------------------------------------
       SELECT GEOFENCE
       ----------------------------------------------------- */

    setSelectedGeofence: (state, action: PayloadAction<Geofence | null>) => {
      state.selectedGeofence = action.payload;
    },

    /* -----------------------------------------------------
       CLEAR SELECTED
       ----------------------------------------------------- */

    clearSelectedGeofence: (state) => {
      state.selectedGeofence = null;
    },

    /* -----------------------------------------------------
       CLEAR CHECK RESULT
       ----------------------------------------------------- */

    clearGeofenceCheckResult: (state) => {
      state.checkResult = null;
    },

    /* -----------------------------------------------------
       CLEAR ERROR
       ----------------------------------------------------- */

    clearGeofenceError: (state) => {
      state.error = null;
    },

    /* -----------------------------------------------------
       CLEAR STATUS
       ----------------------------------------------------- */

    resetGeofenceStatus: (state) => {
      state.success = false;

      state.message = null;

      state.error = null;
    },
  },

  /* =======================================================
     ASYNC ACTIONS
     ======================================================= */

  extraReducers: (builder) => {
    builder

      /* =====================================================
         FETCH ALL
         ===================================================== */

      .addCase(fetchGeofences.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(fetchGeofences.fulfilled, (state, action) => {
        state.loading = false;

        state.geofences = action.payload;

        state.error = null;
      })

      .addCase(fetchGeofences.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Gagal mengambil data geofence.";
      })

      /* =====================================================
         FETCH BY ID
         ===================================================== */

      .addCase(fetchGeofenceById.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(fetchGeofenceById.fulfilled, (state, action) => {
        state.loading = false;

        state.selectedGeofence = action.payload;

        state.error = null;
      })

      .addCase(fetchGeofenceById.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Gagal mengambil geofence.";
      })

      /* =====================================================
         CREATE
         ===================================================== */

      .addCase(createGeofence.pending, (state) => {
        state.creating = true;

        state.success = false;

        state.error = null;
      })

      .addCase(createGeofence.fulfilled, (state, action) => {
        state.creating = false;

        state.success = true;

        state.message = "Geofence berhasil dibuat.";

        state.error = null;

        state.geofences.push(action.payload);
      })

      .addCase(createGeofence.rejected, (state, action) => {
        state.creating = false;

        state.success = false;

        state.error = action.payload || "Gagal membuat geofence.";
      })

      /* =====================================================
         UPDATE
         ===================================================== */

      .addCase(updateGeofence.pending, (state) => {
        state.updating = true;

        state.success = false;

        state.error = null;
      })

      .addCase(updateGeofence.fulfilled, (state, action) => {
        state.updating = false;

        state.success = true;

        state.message = "Geofence berhasil diperbarui.";

        state.error = null;

        const index = state.geofences.findIndex(
          (item) => String(item.id) === String(action.payload.id),
        );

        if (index !== -1) {
          state.geofences[index] = action.payload;
        }

        if (
          state.selectedGeofence &&
          String(state.selectedGeofence.id) === String(action.payload.id)
        ) {
          state.selectedGeofence = action.payload;
        }
      })

      .addCase(updateGeofence.rejected, (state, action) => {
        state.updating = false;

        state.success = false;

        state.error = action.payload || "Gagal memperbarui geofence.";
      })

      /* =====================================================
         DELETE
         ===================================================== */

      .addCase(deleteGeofence.pending, (state) => {
        state.deleting = true;

        state.success = false;

        state.error = null;
      })

      .addCase(deleteGeofence.fulfilled, (state, action) => {
        state.deleting = false;

        state.success = true;

        state.message = "Geofence berhasil dihapus.";

        state.error = null;

        state.geofences = state.geofences.filter(
          (item) => String(item.id) !== String(action.payload),
        );

        if (
          state.selectedGeofence &&
          String(state.selectedGeofence.id) === String(action.payload)
        ) {
          state.selectedGeofence = null;
        }

        state.checkResult = null;
      })

      .addCase(deleteGeofence.rejected, (state, action) => {
        state.deleting = false;

        state.success = false;

        state.error = action.payload || "Gagal menghapus geofence.";
      })

      /* =====================================================
         CHECK GEOFENCE
         ===================================================== */

      .addCase(checkGeofence.pending, (state) => {
        state.checking = true;

        state.error = null;
      })

      .addCase(checkGeofence.fulfilled, (state, action) => {
        state.checking = false;

        state.checkResult = action.payload;

        state.error = null;
      })

      .addCase(checkGeofence.rejected, (state, action) => {
        state.checking = false;

        state.checkResult = null;

        state.error = action.payload || "Gagal melakukan pengecekan geofence.";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setSelectedGeofence,
  clearSelectedGeofence,
  clearGeofenceCheckResult,
  clearGeofenceError,
  resetGeofenceStatus,
} = geofenceSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default geofenceSlice.reducer;
