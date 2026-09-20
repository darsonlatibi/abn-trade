/* =========================================================
   ABN FLEET
   SAP INTEGRATION SLICE
   ========================================================= */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import api from "../../api/axios";
import type { RootState } from "../../stores/store";

/* =========================================================
   TYPES
   ========================================================= */

export type SAPIntegrationStatus =
  | "PENDING"
  | "CONNECTED"
  | "SYNCING"
  | "SYNCED"
  | "FAILED"
  | "DISABLED";

export type SAPSyncDirection = "SAP_TO_ABN" | "ABN_TO_SAP" | "BIDIRECTIONAL";

export type SAPSyncMethod = "REST" | "ODATA" | "SOAP" | "RFC";

export type SAPLastSyncStatus = "SUCCESS" | "FAILED" | "PENDING";

/* =========================================================
   DEVICE
   ========================================================= */

export interface SAPDevice {
  id: number;

  device_code?: string;

  esp_chip_id?: string;

  modem_imei?: string;

  sim_iccid?: string;

  firmware_version?: string;

  status?: string;

  vehicle_id?: number | null;
}

/* =========================================================
   VEHICLE
   ========================================================= */

export interface SAPVehicle {
  id: number;

  vehicle_code?: string;

  vehicle_name?: string;

  plate_number?: string;

  status?: string;
}

/* =========================================================
   SAP INTEGRATION
   ========================================================= */

export interface SAPIntegration {
  id: number;

  device_id: number;

  vehicle_id: number | null;

  sap_system: string;

  sap_client: string | null;

  sap_company_code: string | null;

  sap_plant: string | null;

  sap_equipment_id: string | null;

  sap_vehicle_id: string | null;

  sap_asset_id: string | null;

  sap_cost_center: string | null;

  external_id: string | null;

  integration_status: SAPIntegrationStatus;

  sync_direction: SAPSyncDirection;

  sync_method: SAPSyncMethod;

  last_sync_at: string | null;

  last_sync_status: SAPLastSyncStatus | null;

  last_sync_error: string | null;

  sync_attempts: number;

  sync_success_count: number;

  sync_failure_count: number;

  is_active: boolean;

  created_at: string;

  updated_at: string;

  device?: SAPDevice;

  vehicle?: SAPVehicle;
}

/* =========================================================
   CREATE PAYLOAD
   ========================================================= */

export interface CreateSAPIntegrationPayload {
  device_id: number;

  vehicle_id?: number | null;

  sap_system?: string;

  sap_client?: string | null;

  sap_company_code?: string | null;

  sap_plant?: string | null;

  sap_equipment_id?: string | null;

  sap_vehicle_id?: string | null;

  sap_asset_id?: string | null;

  sap_cost_center?: string | null;

  external_id?: string | null;

  integration_status?: SAPIntegrationStatus;

  sync_direction?: SAPSyncDirection;

  sync_method?: SAPSyncMethod;

  is_active?: boolean;
}

/* =========================================================
   UPDATE PAYLOAD
   ========================================================= */

export interface UpdateSAPIntegrationPayload {
  id: number;

  device_id?: number;

  vehicle_id?: number | null;

  sap_system?: string;

  sap_client?: string | null;

  sap_company_code?: string | null;

  sap_plant?: string | null;

  sap_equipment_id?: string | null;

  sap_vehicle_id?: string | null;

  sap_asset_id?: string | null;

  sap_cost_center?: string | null;

  external_id?: string | null;

  integration_status?: SAPIntegrationStatus;

  sync_direction?: SAPSyncDirection;

  sync_method?: SAPSyncMethod;

  is_active?: boolean;
}

/* =========================================================
   FILTERS
   ========================================================= */

export interface SAPIntegrationFilters {
  search?: string;

  status?: SAPIntegrationStatus;

  sync_direction?: SAPSyncDirection;

  sync_method?: SAPSyncMethod;

  is_active?: boolean;

  device_id?: number;

  vehicle_id?: number;
}

/* =========================================================
   UPDATE SYNC STATUS
   ========================================================= */

export interface UpdateSyncStatusPayload {
  id: number;

  integration_status: SAPIntegrationStatus;

  last_sync_status: SAPLastSyncStatus;

  last_sync_error?: string | null;
}

/* =========================================================
   API RESPONSE
   ========================================================= */

interface SAPIntegrationResponse {
  success: boolean;

  message?: string;

  data: SAPIntegration;
}

interface SAPIntegrationListResponse {
  success: boolean;

  message?: string;

  count: number;

  data: SAPIntegration[];
}

interface SAPIntegrationDeleteResponse {
  success: boolean;

  message: string;
}

/* =========================================================
   STATE
   ========================================================= */

interface SAPIntegrationState {
  integrations: SAPIntegration[];

  selectedIntegration: SAPIntegration | null;

  loading: boolean;

  detailLoading: boolean;

  saving: boolean;

  deleting: boolean;

  syncing: boolean;

  error: string | null;

  successMessage: string | null;

  count: number;
}

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: SAPIntegrationState = {
  integrations: [],

  selectedIntegration: null,

  loading: false,

  detailLoading: false,

  saving: false,

  deleting: false,

  syncing: false,

  error: null,

  successMessage: null,

  count: 0,
};

/* =========================================================
   ERROR HELPER
   ========================================================= */

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    return response?.data?.message || "Terjadi kesalahan pada SAP integration.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Terjadi kesalahan pada SAP integration.";
};

/* =========================================================
   GET ALL
   GET /api/integration
   ========================================================= */

export const fetchSAPIntegrations = createAsyncThunk<
  SAPIntegrationListResponse,
  SAPIntegrationFilters | undefined,
  {
    rejectValue: string;
  }
>(
  "sapIntegration/fetchSAPIntegrations",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();

      if (filters.search) {
        params.set("search", filters.search);
      }

      if (filters.status) {
        params.set("status", filters.status);
      }

      if (filters.sync_direction) {
        params.set("sync_direction", filters.sync_direction);
      }

      if (filters.sync_method) {
        params.set("sync_method", filters.sync_method);
      }

      if (filters.is_active !== undefined) {
        params.set("is_active", String(filters.is_active));
      }

      if (filters.device_id !== undefined) {
        params.set("device_id", String(filters.device_id));
      }

      if (filters.vehicle_id !== undefined) {
        params.set("vehicle_id", String(filters.vehicle_id));
      }

      const query = params.toString();

      const response = await api.get<SAPIntegrationListResponse>(
        query ? `/integration?${query}` : "/integration",
      );

      if (!response.data?.success) {
        return rejectWithValue(
          response.data?.message || "Gagal mengambil SAP integrations.",
        );
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   GET BY ID
   GET /api/integration/:id
   ========================================================= */

export const fetchSAPIntegrationById = createAsyncThunk<
  SAPIntegrationResponse,
  number,
  {
    rejectValue: string;
  }
>("sapIntegration/fetchSAPIntegrationById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get<SAPIntegrationResponse>(
      `/integration/${id}`,
    );

    if (!response.data?.success || !response.data?.data) {
      return rejectWithValue(
        response.data?.message || "Data SAP integration tidak ditemukan.",
      );
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
   CREATE
   POST /api/integration
   ========================================================= */

export const createSAPIntegration = createAsyncThunk<
  SAPIntegrationResponse,
  CreateSAPIntegrationPayload,
  {
    rejectValue: string;
  }
>(
  "sapIntegration/createSAPIntegration",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post<SAPIntegrationResponse>(
        "/integration",
        payload,
      );

      if (!response.data?.success || !response.data?.data) {
        return rejectWithValue(
          response.data?.message || "Gagal membuat SAP integration.",
        );
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   UPDATE
   PUT /api/integration/:id
   ========================================================= */

export const updateSAPIntegration = createAsyncThunk<
  SAPIntegrationResponse,
  UpdateSAPIntegrationPayload,
  {
    rejectValue: string;
  }
>(
  "sapIntegration/updateSAPIntegration",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const response = await api.put<SAPIntegrationResponse>(
        `/integration/${id}`,
        payload,
      );

      if (!response.data?.success || !response.data?.data) {
        return rejectWithValue(
          response.data?.message || "Gagal memperbarui SAP integration.",
        );
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   DELETE
   DELETE /api/integration/:id
   ========================================================= */

export const deleteSAPIntegration = createAsyncThunk<
  {
    id: number;
    message: string;
  },
  number,
  {
    rejectValue: string;
  }
>("sapIntegration/deleteSAPIntegration", async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete<SAPIntegrationDeleteResponse>(
      `/integration/${id}`,
    );

    if (!response.data?.success) {
      return rejectWithValue(
        response.data?.message || "Gagal menghapus SAP integration.",
      );
    }

    return {
      id,
      message: response.data.message || "SAP integration berhasil dihapus.",
    };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
   ENABLE
   PATCH /api/integration/:id/enable
   ========================================================= */

export const enableSAPIntegration = createAsyncThunk<
  SAPIntegrationResponse,
  number,
  {
    rejectValue: string;
  }
>("sapIntegration/enableSAPIntegration", async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch<SAPIntegrationResponse>(
      `/integration/${id}/enable`,
      {},
    );

    if (!response.data?.success || !response.data?.data) {
      return rejectWithValue(
        response.data?.message || "Gagal mengaktifkan SAP integration.",
      );
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
   DISABLE
   PATCH /api/integration/:id/disable
   ========================================================= */

export const disableSAPIntegration = createAsyncThunk<
  SAPIntegrationResponse,
  number,
  {
    rejectValue: string;
  }
>("sapIntegration/disableSAPIntegration", async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch<SAPIntegrationResponse>(
      `/integration/${id}/disable`,
      {},
    );

    if (!response.data?.success || !response.data?.data) {
      return rejectWithValue(
        response.data?.message || "Gagal menonaktifkan SAP integration.",
      );
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
   UPDATE SYNC STATUS
   PATCH /api/integration/:id/sync-status
   ========================================================= */

export const updateSAPSyncStatus = createAsyncThunk<
  SAPIntegrationResponse,
  UpdateSyncStatusPayload,
  {
    rejectValue: string;
  }
>(
  "sapIntegration/updateSAPSyncStatus",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const response = await api.patch<SAPIntegrationResponse>(
        `/integration/${id}/sync-status`,
        payload,
      );

      if (!response.data?.success || !response.data?.data) {
        return rejectWithValue(
          response.data?.message || "Gagal memperbarui status SAP.",
        );
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   RETRY
   POST /api/integration/:id/retry
   ========================================================= */

export const retrySAPIntegration = createAsyncThunk<
  SAPIntegrationResponse,
  number,
  {
    rejectValue: string;
  }
>("sapIntegration/retrySAPIntegration", async (id, { rejectWithValue }) => {
  try {
    const response = await api.post<SAPIntegrationResponse>(
      `/integration/${id}/retry`,
      {},
    );

    if (!response.data?.success || !response.data?.data) {
      return rejectWithValue(
        response.data?.message || "Gagal menjalankan SAP synchronization.",
      );
    }

    return response.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
   SLICE
   ========================================================= */

const sapIntegrationSlice = createSlice({
  name: "sapIntegration",

  initialState,

  reducers: {
    clearSAPIntegrationError: (state) => {
      state.error = null;
    },

    clearSAPIntegrationMessage: (state) => {
      state.successMessage = null;
    },

    clearSelectedSAPIntegration: (state) => {
      state.selectedIntegration = null;
    },

    setSelectedSAPIntegration: (
      state,
      action: PayloadAction<SAPIntegration | null>,
    ) => {
      state.selectedIntegration = action.payload;
    },

    resetSAPIntegrationState: () => initialState,
  },

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL
       ===================================================== */

    builder
      .addCase(fetchSAPIntegrations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchSAPIntegrations.fulfilled, (state, action) => {
        state.loading = false;

        state.integrations = action.payload.data;

        state.count = action.payload.count;

        state.error = null;
      })

      .addCase(fetchSAPIntegrations.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Gagal mengambil SAP integrations.";
      });

    /* =====================================================
       FETCH BY ID
       ===================================================== */

    builder
      .addCase(fetchSAPIntegrationById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })

      .addCase(fetchSAPIntegrationById.fulfilled, (state, action) => {
        state.detailLoading = false;

        state.selectedIntegration = action.payload.data;

        state.error = null;
      })

      .addCase(fetchSAPIntegrationById.rejected, (state, action) => {
        state.detailLoading = false;

        state.error =
          action.payload || "Gagal mengambil detail SAP integration.";
      });

    /* =====================================================
       CREATE
       ===================================================== */

    builder
      .addCase(createSAPIntegration.pending, (state) => {
        state.saving = true;

        state.error = null;

        state.successMessage = null;
      })

      .addCase(createSAPIntegration.fulfilled, (state, action) => {
        state.saving = false;

        state.integrations.unshift(action.payload.data);

        state.count += 1;

        state.selectedIntegration = action.payload.data;

        state.successMessage =
          action.payload.message || "SAP integration berhasil dibuat.";

        state.error = null;
      })

      .addCase(createSAPIntegration.rejected, (state, action) => {
        state.saving = false;

        state.error = action.payload || "Gagal membuat SAP integration.";
      });

    /* =====================================================
       UPDATE
       ===================================================== */

    builder
      .addCase(updateSAPIntegration.pending, (state) => {
        state.saving = true;

        state.error = null;

        state.successMessage = null;
      })

      .addCase(updateSAPIntegration.fulfilled, (state, action) => {
        state.saving = false;

        const updated = action.payload.data;

        const index = state.integrations.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.integrations[index] = updated;
        }

        state.selectedIntegration = updated;

        state.successMessage =
          action.payload.message || "SAP integration berhasil diperbarui.";

        state.error = null;
      })

      .addCase(updateSAPIntegration.rejected, (state, action) => {
        state.saving = false;

        state.error = action.payload || "Gagal memperbarui SAP integration.";
      });

    /* =====================================================
       DELETE
       ===================================================== */

    builder
      .addCase(deleteSAPIntegration.pending, (state) => {
        state.deleting = true;

        state.error = null;

        state.successMessage = null;
      })

      .addCase(deleteSAPIntegration.fulfilled, (state, action) => {
        state.deleting = false;

        state.integrations = state.integrations.filter(
          (item) => item.id !== action.payload.id,
        );

        state.count = Math.max(0, state.count - 1);

        if (state.selectedIntegration?.id === action.payload.id) {
          state.selectedIntegration = null;
        }

        state.successMessage = action.payload.message;

        state.error = null;
      })

      .addCase(deleteSAPIntegration.rejected, (state, action) => {
        state.deleting = false;

        state.error = action.payload || "Gagal menghapus SAP integration.";
      });

    /* =====================================================
       ENABLE
       ===================================================== */

    builder
      .addCase(enableSAPIntegration.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })

      .addCase(enableSAPIntegration.fulfilled, (state, action) => {
        state.syncing = false;

        const updated = action.payload.data;

        const index = state.integrations.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.integrations[index] = updated;
        }

        state.selectedIntegration = updated;

        state.successMessage =
          action.payload.message || "SAP integration berhasil diaktifkan.";

        state.error = null;
      })

      .addCase(enableSAPIntegration.rejected, (state, action) => {
        state.syncing = false;

        state.error = action.payload || "Gagal mengaktifkan SAP integration.";
      });

    /* =====================================================
       DISABLE
       ===================================================== */

    builder
      .addCase(disableSAPIntegration.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })

      .addCase(disableSAPIntegration.fulfilled, (state, action) => {
        state.syncing = false;

        const updated = action.payload.data;

        const index = state.integrations.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.integrations[index] = updated;
        }

        state.selectedIntegration = updated;

        state.successMessage =
          action.payload.message || "SAP integration berhasil dinonaktifkan.";

        state.error = null;
      })

      .addCase(disableSAPIntegration.rejected, (state, action) => {
        state.syncing = false;

        state.error = action.payload || "Gagal menonaktifkan SAP integration.";
      });

    /* =====================================================
       SYNC STATUS
       ===================================================== */

    builder
      .addCase(updateSAPSyncStatus.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })

      .addCase(updateSAPSyncStatus.fulfilled, (state, action) => {
        state.syncing = false;

        const updated = action.payload.data;

        const index = state.integrations.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.integrations[index] = updated;
        }

        state.selectedIntegration = updated;

        state.successMessage =
          action.payload.message || "Status SAP berhasil diperbarui.";

        state.error = null;
      })

      .addCase(updateSAPSyncStatus.rejected, (state, action) => {
        state.syncing = false;

        state.error = action.payload || "Gagal memperbarui status SAP.";
      });

    /* =====================================================
       RETRY
       ===================================================== */

    builder
      .addCase(retrySAPIntegration.pending, (state) => {
        state.syncing = true;

        state.error = null;

        state.successMessage = null;
      })

      .addCase(retrySAPIntegration.fulfilled, (state, action) => {
        state.syncing = false;

        const updated = action.payload.data;

        const index = state.integrations.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.integrations[index] = updated;
        }

        state.selectedIntegration = updated;

        state.successMessage =
          action.payload.message || "SAP synchronization queued.";

        state.error = null;
      })

      .addCase(retrySAPIntegration.rejected, (state, action) => {
        state.syncing = false;

        state.error =
          action.payload || "Gagal menjalankan SAP synchronization.";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  clearSAPIntegrationError,
  clearSAPIntegrationMessage,
  clearSelectedSAPIntegration,
  setSelectedSAPIntegration,
  resetSAPIntegrationState,
} = sapIntegrationSlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

export const selectSAPIntegrations = (state: RootState) =>
  state.sapIntegration.integrations;

export const selectSelectedSAPIntegration = (state: RootState) =>
  state.sapIntegration.selectedIntegration;

export const selectSAPIntegrationLoading = (state: RootState) =>
  state.sapIntegration.loading;

export const selectSAPIntegrationDetailLoading = (state: RootState) =>
  state.sapIntegration.detailLoading;

export const selectSAPIntegrationSaving = (state: RootState) =>
  state.sapIntegration.saving;

export const selectSAPIntegrationDeleting = (state: RootState) =>
  state.sapIntegration.deleting;

export const selectSAPIntegrationSyncing = (state: RootState) =>
  state.sapIntegration.syncing;

export const selectSAPIntegrationError = (state: RootState) =>
  state.sapIntegration.error;

export const selectSAPIntegrationSuccessMessage = (state: RootState) =>
  state.sapIntegration.successMessage;

export const selectSAPIntegrationCount = (state: RootState) =>
  state.sapIntegration.count;

/* =========================================================
   SELECTOR BY ID
   ========================================================= */

export const selectSAPIntegrationById = (state: RootState, id: number) =>
  state.sapIntegration.integrations.find((item) => item.id === id) || null;

/* =========================================================
   REDUCER
   ========================================================= */

export default sapIntegrationSlice.reducer;
