import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";

import type { RootState } from "../../stores/store";

import api from "../../api/axios";

/* =========================================================
   ABN FLEET
   USER ACTIVITY / AUDIT LOG SLICE
   ========================================================= */

/* =========================================================
   TYPES
   ========================================================= */

export type UserActivityAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "CREATE_USER"
  | "UPDATE_USER"
  | "DELETE_USER"
  | "UPDATE_USER_STATUS"
  | "CREATE_VEHICLE"
  | "UPDATE_VEHICLE"
  | "DELETE_VEHICLE"
  | "CREATE_DRIVER"
  | "UPDATE_DRIVER"
  | "DELETE_DRIVER"
  | "CREATE_DEVICE"
  | "UPDATE_DEVICE"
  | "DELETE_DEVICE"
  | "CREATE_GEOFENCE"
  | "UPDATE_GEOFENCE"
  | "DELETE_GEOFENCE"
  | "CREATE_TICKET"
  | "UPDATE_TICKET"
  | "DELETE_TICKET"
  | "SYSTEM_SETTINGS_UPDATE"
  | "OTHER"
  | string;

/* =========================================================
   ACTIVITY USER
   ========================================================= */

export interface ActivityUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
}

/* =========================================================
   METADATA
   ========================================================= */

export interface UserActivityMetadata {
  [key: string]: unknown;
}

/* =========================================================
   USER ACTIVITY
   ========================================================= */

export interface UserActivity {
  id: number;

  user_id: number | null;

  username: string | null;

  action: UserActivityAction;

  description: string | null;

  ip_address: string | null;

  user_agent: string | null;

  request_method: string | null;

  request_path: string | null;

  metadata: UserActivityMetadata | null;

  created_at: string;

  updated_at: string;

  user?: ActivityUser | null;
}

/* =========================================================
   API RESPONSE
   ========================================================= */

export interface UserActivitiesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserActivitiesResponse {
  success: boolean;

  data: UserActivity[];

  activities: UserActivity[];

  pagination: UserActivitiesPagination;
}

export interface UserActivityResponse {
  success: boolean;

  message?: string;

  data: UserActivity;

  activity: UserActivity;
}

/* =========================================================
   DELETE RESPONSE
   ========================================================= */

export interface DeleteUserActivityResponse {
  success: boolean;

  message: string;

  data: {
    id: number;
  };
}

export interface DeleteAllUserActivitiesResponse {
  success: boolean;

  message: string;

  data: {
    deletedCount: number;
  };
}

/* =========================================================
   USER ACTIVITIES RESPONSE
   ========================================================= */

export interface UserActivitiesByUserResponse {
  success: boolean;

  data: UserActivity[];

  activities: UserActivity[];
}

/* =========================================================
   QUERY
   ========================================================= */

export interface FetchUserActivitiesParams {
  page?: number;

  limit?: number;

  search?: string;

  action?: string;

  user_id?: number | string;

  start_date?: string;

  end_date?: string;
}

/* =========================================================
   STATE
   ========================================================= */

interface UsersActivityState {
  activities: UserActivity[];

  selectedActivity: UserActivity | null;

  page: number;

  limit: number;

  total: number;

  totalPages: number;

  loading: boolean;

  loadingDetail: boolean;

  creating: boolean;

  updating: boolean;

  deleting: boolean;

  deletingAll: boolean;

  error: string | null;

  success: string | null;
}

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: UsersActivityState = {
  activities: [],

  selectedActivity: null,

  page: 1,

  limit: 50,

  total: 0,

  totalPages: 0,

  loading: false,

  loadingDetail: false,

  creating: false,

  updating: false,

  deleting: false,

  deletingAll: false,

  error: null,

  success: null,
};

/* =========================================================
   HELPERS
   ========================================================= */

const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
    message?: string;
  };

  return axiosError?.response?.data?.message || axiosError?.message || fallback;
};

/* =========================================================
   FETCH ALL ACTIVITIES
   GET /api/users/activity
   ========================================================= */

export const fetchUserActivities = createAsyncThunk<
  UserActivitiesResponse,
  FetchUserActivitiesParams | undefined,
  { rejectValue: string }
>(
  "usersActivity/fetchUserActivities",

  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get<UserActivitiesResponse>(
        "/users/activity",
        {
          params: {
            page: params.page ?? 1,

            limit: params.limit ?? 50,

            ...(params.search?.trim()
              ? {
                  search: params.search.trim(),
                }
              : {}),

            ...(params.action?.trim()
              ? {
                  action: params.action.trim(),
                }
              : {}),

            ...(params.user_id !== undefined && params.user_id !== ""
              ? {
                  user_id: params.user_id,
                }
              : {}),

            ...(params.start_date
              ? {
                  start_date: params.start_date,
                }
              : {}),

            ...(params.end_date
              ? {
                  end_date: params.end_date,
                }
              : {}),
          },
        },
      );

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Gagal mengambil User Activity."),
      );
    }
  },
);

/* =========================================================
   FETCH ACTIVITY BY ID
   GET /api/users/activity/:id
   ========================================================= */

export const fetchUserActivityById = createAsyncThunk<
  UserActivityResponse,
  number | string,
  { rejectValue: string }
>(
  "usersActivity/fetchUserActivityById",

  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get<UserActivityResponse>(
        `/users/activity/${id}`,
      );

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Gagal mengambil detail User Activity."),
      );
    }
  },
);

/* =========================================================
   CREATE ACTIVITY
   POST /api/users/activity
   ========================================================= */

export interface CreateUserActivityPayload {
  user_id?: number | null;

  username?: string | null;

  action: string;

  description?: string | null;

  ip_address?: string | null;

  user_agent?: string | null;

  request_method?: string | null;

  request_path?: string | null;

  metadata?: UserActivityMetadata | null;
}

export const createUserActivity = createAsyncThunk<
  UserActivityResponse,
  CreateUserActivityPayload,
  { rejectValue: string }
>(
  "usersActivity/createUserActivity",

  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post<UserActivityResponse>(
        "/users/activity",
        payload,
      );

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Gagal mencatat User Activity."),
      );
    }
  },
);

/* =========================================================
   UPDATE ACTIVITY
   PUT /api/users/activity/:id
   ========================================================= */

export interface UpdateUserActivityPayload {
  description?: string | null;

  metadata?: UserActivityMetadata | null;
}

export interface UpdateUserActivityRequest {
  id: number | string;

  payload: UpdateUserActivityPayload;
}

export const updateUserActivity = createAsyncThunk<
  UserActivityResponse,
  UpdateUserActivityRequest,
  { rejectValue: string }
>(
  "usersActivity/updateUserActivity",

  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put<UserActivityResponse>(
        `/users/activity/${id}`,
        payload,
      );

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Gagal memperbarui User Activity."),
      );
    }
  },
);

/* =========================================================
   DELETE ACTIVITY
   DELETE /api/users/activity/:id
   ========================================================= */

export const deleteUserActivity = createAsyncThunk<
  DeleteUserActivityResponse,
  number | string,
  { rejectValue: string }
>(
  "usersActivity/deleteUserActivity",

  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete<DeleteUserActivityResponse>(
        `/users/activity/${id}`,
      );

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Gagal menghapus User Activity."),
      );
    }
  },
);

/* =========================================================
   DELETE ALL ACTIVITIES
   DELETE /api/users/activity
   ========================================================= */

export const deleteAllUserActivities = createAsyncThunk<
  DeleteAllUserActivitiesResponse,
  void,
  { rejectValue: string }
>(
  "usersActivity/deleteAllUserActivities",

  async (_, { rejectWithValue }) => {
    try {
      const response =
        await api.delete<DeleteAllUserActivitiesResponse>("/users/activity");

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Gagal menghapus seluruh User Activity."),
      );
    }
  },
);

/* =========================================================
   FETCH ACTIVITIES BY USER
   GET /api/users/activity/:userId/activity
   ========================================================= */

export const fetchActivitiesByUser = createAsyncThunk<
  UserActivitiesByUserResponse,
  number | string,
  { rejectValue: string }
>(
  "usersActivity/fetchActivitiesByUser",

  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get<UserActivitiesByUserResponse>(
        `/users/activity/${userId}/activity`,
      );

      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, "Gagal mengambil activity user."),
      );
    }
  },
);

/* =========================================================
   SLICE
   ========================================================= */

const usersActivitySlice = createSlice({
  name: "usersActivity",

  initialState,

  reducers: {
    /* =====================================================
       CLEAR ERROR
       ===================================================== */

    clearUsersActivityError: (state) => {
      state.error = null;
    },

    /* =====================================================
       CLEAR SUCCESS
       ===================================================== */

    clearUsersActivitySuccess: (state) => {
      state.success = null;
    },

    /* =====================================================
       CLEAR SELECTED
       ===================================================== */

    clearSelectedUserActivity: (state) => {
      state.selectedActivity = null;
    },

    /* =====================================================
       RESET
       ===================================================== */

    resetUsersActivity: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    /* =====================================================
       FETCH ALL
       ===================================================== */

    builder

      .addCase(fetchUserActivities.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(fetchUserActivities.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload;

        state.activities = payload.activities ?? payload.data ?? [];

        state.page = payload.pagination?.page ?? 1;

        state.limit = payload.pagination?.limit ?? 50;

        state.total = payload.pagination?.total ?? state.activities.length;

        state.totalPages = payload.pagination?.totalPages ?? 0;
      })

      .addCase(fetchUserActivities.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Gagal mengambil User Activity.";
      });

    /* =====================================================
       FETCH DETAIL
       ===================================================== */

    builder

      .addCase(fetchUserActivityById.pending, (state) => {
        state.loadingDetail = true;

        state.error = null;
      })

      .addCase(fetchUserActivityById.fulfilled, (state, action) => {
        state.loadingDetail = false;

        state.selectedActivity = action.payload.activity ?? action.payload.data;
      })

      .addCase(fetchUserActivityById.rejected, (state, action) => {
        state.loadingDetail = false;

        state.error = action.payload || "Gagal mengambil detail User Activity.";
      });

    /* =====================================================
       CREATE
       ===================================================== */

    builder

      .addCase(createUserActivity.pending, (state) => {
        state.creating = true;

        state.error = null;

        state.success = null;
      })

      .addCase(createUserActivity.fulfilled, (state, action) => {
        state.creating = false;

        const activity = action.payload.activity ?? action.payload.data;

        if (activity) {
          state.activities.unshift(activity);

          state.total += 1;
        }

        state.success =
          action.payload.message || "User activity berhasil dicatat.";
      })

      .addCase(createUserActivity.rejected, (state, action) => {
        state.creating = false;

        state.error = action.payload || "Gagal mencatat User Activity.";
      });

    /* =====================================================
       UPDATE
       ===================================================== */

    builder

      .addCase(updateUserActivity.pending, (state) => {
        state.updating = true;

        state.error = null;

        state.success = null;
      })

      .addCase(updateUserActivity.fulfilled, (state, action) => {
        state.updating = false;

        const updated = action.payload.activity ?? action.payload.data;

        if (updated) {
          const index = state.activities.findIndex(
            (item) => item.id === updated.id,
          );

          if (index !== -1) {
            state.activities[index] = updated;
          }

          state.selectedActivity = updated;
        }

        state.success =
          action.payload.message || "User activity berhasil diperbarui.";
      })

      .addCase(updateUserActivity.rejected, (state, action) => {
        state.updating = false;

        state.error = action.payload || "Gagal memperbarui User Activity.";
      });

    /* =====================================================
       DELETE
       ===================================================== */

    builder

      .addCase(deleteUserActivity.pending, (state) => {
        state.deleting = true;

        state.error = null;

        state.success = null;
      })

      .addCase(deleteUserActivity.fulfilled, (state, action) => {
        state.deleting = false;

        const deletedId = action.payload.data.id;

        state.activities = state.activities.filter(
          (item) => item.id !== deletedId,
        );

        state.total = Math.max(state.total - 1, 0);

        if (state.selectedActivity?.id === deletedId) {
          state.selectedActivity = null;
        }

        state.success =
          action.payload.message || "User activity berhasil dihapus.";
      })

      .addCase(deleteUserActivity.rejected, (state, action) => {
        state.deleting = false;

        state.error = action.payload || "Gagal menghapus User Activity.";
      });

    /* =====================================================
       DELETE ALL
       ===================================================== */

    builder

      .addCase(deleteAllUserActivities.pending, (state) => {
        state.deletingAll = true;

        state.error = null;

        state.success = null;
      })

      .addCase(deleteAllUserActivities.fulfilled, (state, action) => {
        state.deletingAll = false;

        state.activities = [];

        state.total = 0;

        state.totalPages = 0;

        state.page = 1;

        state.selectedActivity = null;

        state.success =
          action.payload.message || "Seluruh User Activity berhasil dihapus.";
      })

      .addCase(deleteAllUserActivities.rejected, (state, action) => {
        state.deletingAll = false;

        state.error =
          action.payload || "Gagal menghapus seluruh User Activity.";
      });

    /* =====================================================
       FETCH ACTIVITIES BY USER
       ===================================================== */

    builder

      .addCase(fetchActivitiesByUser.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(fetchActivitiesByUser.fulfilled, (state, action) => {
        state.loading = false;

        state.activities =
          action.payload.activities ?? action.payload.data ?? [];

        state.total = state.activities.length;

        state.page = 1;

        state.totalPages = state.activities.length > 0 ? 1 : 0;
      })

      .addCase(fetchActivitiesByUser.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Gagal mengambil activity user.";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  clearUsersActivityError,
  clearUsersActivitySuccess,
  clearSelectedUserActivity,
  resetUsersActivity,
} = usersActivitySlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

const selectUsersActivityState = (state: RootState) => state.usersActivity;

/* =========================================================
   ACTIVITIES
   ========================================================= */

export const selectUserActivities = createSelector(
  [selectUsersActivityState],
  (state) => state.activities,
);

/* =========================================================
   SELECTED ACTIVITY
   ========================================================= */

export const selectSelectedUserActivity = createSelector(
  [selectUsersActivityState],
  (state) => state.selectedActivity,
);

/* =========================================================
   LOADING
   ========================================================= */

export const selectUsersActivityLoading = createSelector(
  [selectUsersActivityState],
  (state) => state.loading,
);

/* =========================================================
   DETAIL LOADING
   ========================================================= */

export const selectUsersActivityDetailLoading = createSelector(
  [selectUsersActivityState],
  (state) => state.loadingDetail,
);

/* =========================================================
   CREATING
   ========================================================= */

export const selectUsersActivityCreating = createSelector(
  [selectUsersActivityState],
  (state) => state.creating,
);

/* =========================================================
   UPDATING
   ========================================================= */

export const selectUsersActivityUpdating = createSelector(
  [selectUsersActivityState],
  (state) => state.updating,
);

/* =========================================================
   DELETING
   ========================================================= */

export const selectUsersActivityDeleting = createSelector(
  [selectUsersActivityState],
  (state) => state.deleting,
);

/* =========================================================
   DELETE ALL
   ========================================================= */

export const selectUsersActivityDeletingAll = createSelector(
  [selectUsersActivityState],
  (state) => state.deletingAll,
);

/* =========================================================
   ERROR
   ========================================================= */

export const selectUsersActivityError = createSelector(
  [selectUsersActivityState],
  (state) => state.error,
);

/* =========================================================
   SUCCESS
   ========================================================= */

export const selectUsersActivitySuccess = createSelector(
  [selectUsersActivityState],
  (state) => state.success,
);

/* =========================================================
   PAGE
   ========================================================= */

export const selectUsersActivityPage = createSelector(
  [selectUsersActivityState],
  (state) => state.page,
);

/* =========================================================
   LIMIT
   ========================================================= */

export const selectUsersActivityLimit = createSelector(
  [selectUsersActivityState],
  (state) => state.limit,
);

/* =========================================================
   TOTAL
   ========================================================= */

export const selectUsersActivityTotal = createSelector(
  [selectUsersActivityState],
  (state) => state.total,
);

/* =========================================================
   TOTAL PAGES
   ========================================================= */

export const selectUsersActivityTotalPages = createSelector(
  [selectUsersActivityState],
  (state) => state.totalPages,
);

/* =========================================================
   REDUCER
   ========================================================= */

export default usersActivitySlice.reducer;
