import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import api from "../../api/axios";
import type { RootState } from "../../stores/store";

/* =========================================================
   TYPES
   ========================================================= */

export type SettingValueType =
  | "STRING"
  | "INTEGER"
  | "DECIMAL"
  | "BOOLEAN"
  | "JSON";

export interface SystemSetting {
  id: number;

  setting_group: string;
  setting_key: string;
  setting_value: string | null;

  value: string | number | boolean | Record<string, unknown> | unknown[] | null;

  value_type: SettingValueType;

  description: string | null;

  is_encrypted: boolean;
  is_active: boolean;

  created_at?: string;
  updated_at?: string;
}

/* =========================================================
   FILTER
   ========================================================= */

export interface SettingFilters {
  group: string;
  active: string;
}

/* =========================================================
   UPDATE
   ========================================================= */

export interface UpdateSettingPayload {
  group: string;
  key: string;
  value: unknown;
}

/* =========================================================
   BULK
   ========================================================= */

export interface BulkSettingItem {
  group: string;
  key: string;
  value: unknown;
}

export interface BulkSettingsPayload {
  settings: BulkSettingItem[];
}

/* =========================================================
   STATE
   ========================================================= */

interface SettingsState {
  settings: SystemSetting[];

  selectedSetting: SystemSetting | null;

  filters: SettingFilters;

  loading: boolean;
  detailLoading: boolean;
  updateLoading: boolean;
  bulkLoading: boolean;
  statusLoading: boolean;

  error: string | null;
}

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: SettingsState = {
  settings: [],

  selectedSetting: null,

  filters: {
    group: "",
    active: "",
  },

  loading: false,
  detailLoading: false,
  updateLoading: false,
  bulkLoading: false,
  statusLoading: false,

  error: null,
};

/* =========================================================
   API RESPONSE HELPERS
   ========================================================= */

const getErrorMessage = (error: any): string => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Terjadi kesalahan pada system settings."
  );
};

const normalizeSettingsResponse = (data: any): SystemSetting[] => {
  /*
   * Support beberapa bentuk response backend:
   *
   * {
   *   settings: [...]
   * }
   *
   * {
   *   data: [...]
   * }
   *
   * [...]
   */

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.settings)) {
    return data.settings;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const normalizeSettingResponse = (data: any): SystemSetting | null => {
  /*
   * Support:
   *
   * {
   *   setting: {...}
   * }
   *
   * {
   *   data: {...}
   * }
   *
   * {...}
   */

  if (data?.setting) {
    return data.setting;
  }

  if (data?.data && !Array.isArray(data.data)) {
    return data.data;
  }

  if (data?.id) {
    return data;
  }

  return null;
};

/* =========================================================
   GET SETTINGS
   ========================================================= */

export const fetchSettings = createAsyncThunk<
  SystemSetting[],
  Partial<SettingFilters> | undefined,
  { state: RootState; rejectValue: string }
>("settings/fetchSettings", async (filters = {}, { rejectWithValue }) => {
  try {
    const params: Record<string, string> = {};

    if (filters.group) {
      params.group = filters.group;
    }

    if (filters.active !== undefined && filters.active !== "") {
      params.active = filters.active;
    }

    const response = await api.get("/settings", {
      params,
    });

    return normalizeSettingsResponse(response.data);
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
   GET SETTINGS BY GROUP
   ========================================================= */

export const fetchSettingsByGroup = createAsyncThunk<
  SystemSetting[],
  string,
  { state: RootState; rejectValue: string }
>("settings/fetchSettingsByGroup", async (group, { rejectWithValue }) => {
  try {
    const response = await api.get(
      `/settings/group/${encodeURIComponent(group)}`,
    );

    return normalizeSettingsResponse(response.data);
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
   GET SINGLE SETTING
   ========================================================= */

export const fetchSetting = createAsyncThunk<
  SystemSetting | null,
  { group: string; key: string },
  { state: RootState; rejectValue: string }
>("settings/fetchSetting", async ({ group, key }, { rejectWithValue }) => {
  try {
    const response = await api.get(
      `/settings/${encodeURIComponent(group)}/${encodeURIComponent(key)}`,
    );

    return normalizeSettingResponse(response.data);
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
   UPDATE SINGLE SETTING
   ========================================================= */

export const updateSetting = createAsyncThunk<
  SystemSetting | null,
  UpdateSettingPayload,
  { state: RootState; rejectValue: string }
>(
  "settings/updateSetting",
  async ({ group, key, value }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/settings/${encodeURIComponent(group)}/${encodeURIComponent(key)}`,
        {
          value,
        },
      );

      return normalizeSettingResponse(response.data);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   BULK UPDATE
   ========================================================= */

export const updateSettingsBulk = createAsyncThunk<
  SystemSetting[],
  BulkSettingsPayload,
  { state: RootState; rejectValue: string }
>("settings/updateSettingsBulk", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.put("/settings/bulk", payload);

    return normalizeSettingsResponse(response.data);
  } catch (error: any) {
    return rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
   TOGGLE STATUS
   ========================================================= */

export const toggleSettingStatus = createAsyncThunk<
  SystemSetting | null,
  { group: string; key: string },
  { state: RootState; rejectValue: string }
>(
  "settings/toggleSettingStatus",
  async ({ group, key }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/settings/${encodeURIComponent(group)}/${encodeURIComponent(key)}/status`,
      );

      return normalizeSettingResponse(response.data);
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* =========================================================
   SLICE
   ========================================================= */

const settingsSlice = createSlice({
  name: "settings",

  initialState,

  reducers: {
    /* =====================================================
       SELECT
       ===================================================== */

    setSelectedSetting: (
      state,
      action: PayloadAction<SystemSetting | null>,
    ) => {
      state.selectedSetting = action.payload;
    },

    clearSelectedSetting: (state) => {
      state.selectedSetting = null;
    },

    /* =====================================================
       FILTER
       ===================================================== */

    setSettingFilter: (
      state,
      action: PayloadAction<Partial<SettingFilters>>,
    ) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    resetSettingFilters: (state) => {
      state.filters = {
        group: "",
        active: "",
      };
    },

    /* =====================================================
       CLEAR ERROR
       ===================================================== */

    clearSettingsError: (state) => {
      state.error = null;
    },

    /* =====================================================
       CLEAR SETTINGS
       ===================================================== */

    clearSettings: (state) => {
      state.settings = [];
      state.selectedSetting = null;
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       FETCH SETTINGS
       ===================================================== */

    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })

      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Gagal mengambil system settings.";
      });

    /* =====================================================
       FETCH GROUP
       ===================================================== */

    builder
      .addCase(fetchSettingsByGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchSettingsByGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })

      .addCase(fetchSettingsByGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Gagal mengambil settings group.";
      });

    /* =====================================================
       FETCH SINGLE
       ===================================================== */

    builder
      .addCase(fetchSetting.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })

      .addCase(fetchSetting.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedSetting = action.payload;
      })

      .addCase(fetchSetting.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || "Gagal mengambil setting.";
      });

    /* =====================================================
       UPDATE SINGLE
       ===================================================== */

    builder
      .addCase(updateSetting.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })

      .addCase(updateSetting.fulfilled, (state, action) => {
        state.updateLoading = false;

        const updated = action.payload;

        if (!updated) return;

        state.selectedSetting = updated;

        const index = state.settings.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.settings[index] = updated;
        } else {
          state.settings.push(updated);
        }
      })

      .addCase(updateSetting.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload || "Gagal mengubah setting.";
      });

    /* =====================================================
       BULK UPDATE
       ===================================================== */

    builder
      .addCase(updateSettingsBulk.pending, (state) => {
        state.bulkLoading = true;
        state.error = null;
      })

      .addCase(updateSettingsBulk.fulfilled, (state, action) => {
        state.bulkLoading = false;

        /*
         * Backend bisa mengembalikan array settings
         * yang sudah diperbarui.
         */

        if (action.payload.length > 0) {
          for (const updated of action.payload) {
            const index = state.settings.findIndex(
              (item) => item.id === updated.id,
            );

            if (index !== -1) {
              state.settings[index] = updated;
            } else {
              state.settings.push(updated);
            }
          }
        }
      })

      .addCase(updateSettingsBulk.rejected, (state, action) => {
        state.bulkLoading = false;
        state.error = action.payload || "Gagal melakukan bulk update settings.";
      });

    /* =====================================================
       TOGGLE STATUS
       ===================================================== */

    builder
      .addCase(toggleSettingStatus.pending, (state) => {
        state.statusLoading = true;
        state.error = null;
      })

      .addCase(toggleSettingStatus.fulfilled, (state, action) => {
        state.statusLoading = false;

        const updated = action.payload;

        if (!updated) return;

        state.selectedSetting = updated;

        const index = state.settings.findIndex(
          (item) => item.id === updated.id,
        );

        if (index !== -1) {
          state.settings[index] = updated;
        } else {
          state.settings.push(updated);
        }
      })

      .addCase(toggleSettingStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.error = action.payload || "Gagal mengubah status setting.";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setSelectedSetting,
  clearSelectedSetting,
  setSettingFilter,
  resetSettingFilters,
  clearSettingsError,
  clearSettings,
} = settingsSlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

export const selectSettings = (state: RootState) => state.settings.settings;

export const selectSelectedSetting = (state: RootState) =>
  state.settings.selectedSetting;

export const selectSettingFilters = (state: RootState) =>
  state.settings.filters;

export const selectSettingsLoading = (state: RootState) =>
  state.settings.loading;

export const selectSettingDetailLoading = (state: RootState) =>
  state.settings.detailLoading;

export const selectSettingUpdateLoading = (state: RootState) =>
  state.settings.updateLoading;

export const selectSettingsBulkLoading = (state: RootState) =>
  state.settings.bulkLoading;

export const selectSettingStatusLoading = (state: RootState) =>
  state.settings.statusLoading;

export const selectSettingsError = (state: RootState) => state.settings.error;

/* =========================================================
   EXPORT
   ========================================================= */

export default settingsSlice.reducer;
