import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* =========================================================
   ABN FLEET SYSTEM
   TRUCK SLICE
   ========================================================= */

/* =========================================================
   TYPES
   ========================================================= */

export interface Truck {
  id: string | number;

  /* -------------------------------------------------------
     IDENTITY
     ------------------------------------------------------- */

  truck_code?: string;
  vehicle_number?: string;
  plate_number?: string;

  /* -------------------------------------------------------
     VEHICLE
     ------------------------------------------------------- */

  brand?: string;
  model?: string;
  type?: string;
  year?: number;

  /* -------------------------------------------------------
     OPERATION
     ------------------------------------------------------- */

  status?: string;

  driver_id?: string | number | null;

  /* -------------------------------------------------------
     GPS
     ------------------------------------------------------- */

  gps_device_id?: string | number | null;
  imei?: string | null;

  /* -------------------------------------------------------
     ADDITIONAL
     ------------------------------------------------------- */

  description?: string | null;

  created_at?: string;
  updated_at?: string;

  [key: string]: any;
}

/* =========================================================
   API RESPONSE
   ========================================================= */

interface TruckListResponse {
  success: boolean;
  message?: string;

  trucks?: Truck[];

  data?: Truck[];
}

interface TruckResponse {
  success: boolean;
  message?: string;

  truck?: Truck;

  data?: Truck;
}

/* =========================================================
   STATE
   ========================================================= */

interface TruckState {
  trucks: Truck[];

  selectedTruck: Truck | null;

  loading: boolean;

  loadingDetail: boolean;

  creating: boolean;

  updating: boolean;

  deleting: boolean;

  error: string | null;

  initialized: boolean;
}

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: TruckState = {
  trucks: [],

  selectedTruck: null,

  loading: false,

  loadingDetail: false,

  creating: false,

  updating: false,

  deleting: false,

  error: null,

  initialized: false,
};

/* =========================================================
   GET TRUCKS
   GET /api/trucks
   ========================================================= */

export const getTrucks = createAsyncThunk<
  Truck[],
  void,
  {
    rejectValue: string;
  }
>("truck/getTrucks", async (_, thunkAPI) => {
  try {
    const response = await api.get<TruckListResponse>("/trucks");

    if (!response.data?.success) {
      return thunkAPI.rejectWithValue(
        response.data?.message || "Gagal mengambil data truck.",
      );
    }

    const trucks = response.data.trucks ?? response.data.data ?? [];

    return trucks;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Gagal mengambil data truck.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   GET TRUCK BY ID
   GET /api/trucks/:id
   ========================================================= */

export const getTruckById = createAsyncThunk<
  Truck,
  string | number,
  {
    rejectValue: string;
  }
>("truck/getTruckById", async (id, thunkAPI) => {
  try {
    const response = await api.get<TruckResponse>(`/trucks/${id}`);

    if (
      !response.data?.success ||
      (!response.data?.truck && !response.data?.data)
    ) {
      return thunkAPI.rejectWithValue(
        response.data?.message || "Data truck tidak ditemukan.",
      );
    }

    return response.data.truck ?? response.data.data!;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Gagal mengambil detail truck.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   CREATE TRUCK
   POST /api/trucks
   ========================================================= */

export const createTruck = createAsyncThunk<
  Truck,
  Partial<Truck>,
  {
    rejectValue: string;
  }
>("truck/createTruck", async (truckData, thunkAPI) => {
  try {
    const response = await api.post<TruckResponse>("/trucks", truckData);

    if (
      !response.data?.success ||
      (!response.data?.truck && !response.data?.data)
    ) {
      return thunkAPI.rejectWithValue(
        response.data?.message || "Gagal menambahkan truck.",
      );
    }

    return response.data.truck ?? response.data.data!;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Gagal menambahkan truck.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   UPDATE TRUCK
   PUT /api/trucks/:id
   ========================================================= */

export const updateTruck = createAsyncThunk<
  Truck,
  {
    id: string | number;
    data: Partial<Truck>;
  },
  {
    rejectValue: string;
  }
>("truck/updateTruck", async ({ id, data }, thunkAPI) => {
  try {
    const response = await api.put<TruckResponse>(`/trucks/${id}`, data);

    if (
      !response.data?.success ||
      (!response.data?.truck && !response.data?.data)
    ) {
      return thunkAPI.rejectWithValue(
        response.data?.message || "Gagal mengubah data truck.",
      );
    }

    return response.data.truck ?? response.data.data!;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Gagal mengubah data truck.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   DELETE TRUCK
   DELETE /api/trucks/:id
   ========================================================= */

export const deleteTruck = createAsyncThunk<
  string | number,
  string | number,
  {
    rejectValue: string;
  }
>("truck/deleteTruck", async (id, thunkAPI) => {
  try {
    const response = await api.delete<{
      success: boolean;
      message?: string;
    }>(`/trucks/${id}`);

    if (!response.data?.success) {
      return thunkAPI.rejectWithValue(
        response.data?.message || "Gagal menghapus truck.",
      );
    }

    return id;
  } catch (error: any) {
    const message = error?.response?.data?.message || "Gagal menghapus truck.";

    return thunkAPI.rejectWithValue(message);
  }
});

/* =========================================================
   SLICE
   ========================================================= */

const truckSlice = createSlice({
  name: "truck",

  initialState,

  reducers: {
    /* =====================================================
       SET TRUCKS
       ===================================================== */

    setTrucks: (state, action: PayloadAction<Truck[]>) => {
      state.trucks = action.payload;

      state.initialized = true;
    },

    /* =====================================================
       SELECT TRUCK
       ===================================================== */

    setSelectedTruck: (state, action: PayloadAction<Truck | null>) => {
      state.selectedTruck = action.payload;
    },

    /* =====================================================
       CLEAR SELECTED TRUCK
       ===================================================== */

    clearSelectedTruck: (state) => {
      state.selectedTruck = null;
    },

    /* =====================================================
       CLEAR ERROR
       ===================================================== */

    clearTruckError: (state) => {
      state.error = null;
    },

    /* =====================================================
       RESET STATE
       ===================================================== */

    resetTruckState: () => initialState,
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    builder

      /* ===================================================
         GET TRUCKS
         =================================================== */

      .addCase(getTrucks.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(getTrucks.fulfilled, (state, action) => {
        state.loading = false;

        state.initialized = true;

        state.trucks = action.payload;

        state.error = null;
      })

      .addCase(getTrucks.rejected, (state, action) => {
        state.loading = false;

        state.initialized = true;

        state.error = action.payload || "Gagal mengambil data truck.";
      })

      /* ===================================================
         GET TRUCK DETAIL
         =================================================== */

      .addCase(getTruckById.pending, (state) => {
        state.loadingDetail = true;

        state.error = null;
      })

      .addCase(getTruckById.fulfilled, (state, action) => {
        state.loadingDetail = false;

        state.selectedTruck = action.payload;

        state.error = null;
      })

      .addCase(getTruckById.rejected, (state, action) => {
        state.loadingDetail = false;

        state.error = action.payload || "Gagal mengambil detail truck.";
      })

      /* ===================================================
         CREATE
         =================================================== */

      .addCase(createTruck.pending, (state) => {
        state.creating = true;

        state.error = null;
      })

      .addCase(createTruck.fulfilled, (state, action) => {
        state.creating = false;

        state.trucks.push(action.payload);

        state.error = null;
      })

      .addCase(createTruck.rejected, (state, action) => {
        state.creating = false;

        state.error = action.payload || "Gagal menambahkan truck.";
      })

      /* ===================================================
         UPDATE
         =================================================== */

      .addCase(updateTruck.pending, (state) => {
        state.updating = true;

        state.error = null;
      })

      .addCase(updateTruck.fulfilled, (state, action) => {
        state.updating = false;

        const index = state.trucks.findIndex(
          (truck) => String(truck.id) === String(action.payload.id),
        );

        if (index !== -1) {
          state.trucks[index] = action.payload;
        }

        if (
          state.selectedTruck &&
          String(state.selectedTruck.id) === String(action.payload.id)
        ) {
          state.selectedTruck = action.payload;
        }

        state.error = null;
      })

      .addCase(updateTruck.rejected, (state, action) => {
        state.updating = false;

        state.error = action.payload || "Gagal mengubah data truck.";
      })

      /* ===================================================
         DELETE
         =================================================== */

      .addCase(deleteTruck.pending, (state) => {
        state.deleting = true;

        state.error = null;
      })

      .addCase(deleteTruck.fulfilled, (state, action) => {
        state.deleting = false;

        state.trucks = state.trucks.filter(
          (truck) => String(truck.id) !== String(action.payload),
        );

        if (
          state.selectedTruck &&
          String(state.selectedTruck.id) === String(action.payload)
        ) {
          state.selectedTruck = null;
        }

        state.error = null;
      })

      .addCase(deleteTruck.rejected, (state, action) => {
        state.deleting = false;

        state.error = action.payload || "Gagal menghapus truck.";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setTrucks,
  setSelectedTruck,
  clearSelectedTruck,
  clearTruckError,
  resetTruckState,
} = truckSlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

export const selectTrucks = (state: { truck: TruckState }) =>
  state.truck.trucks;

export const selectSelectedTruck = (state: { truck: TruckState }) =>
  state.truck.selectedTruck;

export const selectTruckLoading = (state: { truck: TruckState }) =>
  state.truck.loading;

export const selectTruckDetailLoading = (state: { truck: TruckState }) =>
  state.truck.loadingDetail;

export const selectTruckCreating = (state: { truck: TruckState }) =>
  state.truck.creating;

export const selectTruckUpdating = (state: { truck: TruckState }) =>
  state.truck.updating;

export const selectTruckDeleting = (state: { truck: TruckState }) =>
  state.truck.deleting;

export const selectTruckError = (state: { truck: TruckState }) =>
  state.truck.error;

export const selectTruckInitialized = (state: { truck: TruckState }) =>
  state.truck.initialized;

/* =========================================================
   REDUCER
   ========================================================= */

export default truckSlice.reducer;
