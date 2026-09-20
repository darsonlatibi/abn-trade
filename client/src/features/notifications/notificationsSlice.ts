import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";
/* =========================================================
   ABN TRACKER
   NOTIFICATIONS SLICE
   ========================================================= */

/* =========================================================
   TYPES
   ========================================================= */

export type NotificationSeverity = "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";

export interface Notification {
  id: number;

  user_id: number;

  type: string;

  title: string;

  message: string;

  severity: NotificationSeverity;

  entity_type?: string | null;

  entity_id?: number | null;

  is_read: boolean;

  read_at?: string | null;

  created_at: string;

  updated_at: string;
}

interface NotificationPagination {
  total: number;

  limit: number;

  offset: number;

  hasMore: boolean;
}

interface NotificationsResponse {
  success: boolean;

  data: Notification[];

  pagination: NotificationPagination;
}

interface UnreadCountResponse {
  success: boolean;

  data: {
    count: number;
  };
}

interface NotificationActionResponse {
  success: boolean;

  message: string;

  data?:
    | Notification
    | {
        updated: number;
      };
}

/* =========================================================
   STATE
   ========================================================= */

interface NotificationsState {
  items: Notification[];

  unreadCount: number;

  pagination: NotificationPagination;

  loading: boolean;

  actionLoading: boolean;

  error: string | null;
}

const initialState: NotificationsState = {
  items: [],

  unreadCount: 0,

  pagination: {
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  },

  loading: false,

  actionLoading: false,

  error: null,
};

/* =========================================================
   GET NOTIFICATIONS
   ========================================================= */

export const fetchNotifications = createAsyncThunk<
  NotificationsResponse,
  | {
      limit?: number;
      offset?: number;
      unread?: boolean;
      severity?: NotificationSeverity;
      type?: string;
    }
  | undefined,
  { rejectValue: string }
>(
  "notifications/fetchNotifications",

  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get<NotificationsResponse>(
        "/api/notifications",
        {
          params,
        },
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to load notifications",
      );
    }
  },
);

/* =========================================================
   GET UNREAD COUNT
   ========================================================= */

export const fetchUnreadCount = createAsyncThunk<
  UnreadCountResponse,
  void,
  { rejectValue: string }
>(
  "notifications/fetchUnreadCount",

  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<UnreadCountResponse>(
        "/api/notifications/unread-count",
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to load unread notification count",
      );
    }
  },
);

/* =========================================================
   MARK SINGLE AS READ
   ========================================================= */

export const markNotificationAsRead = createAsyncThunk<
  NotificationActionResponse,
  number,
  { rejectValue: string }
>(
  "notifications/markNotificationAsRead",

  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.patch<NotificationActionResponse>(
        `/api/notifications/${notificationId}/read`,
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to mark notification as read",
      );
    }
  },
);

/* =========================================================
   MARK ALL AS READ
   ========================================================= */

export const markAllNotificationsAsRead = createAsyncThunk<
  NotificationActionResponse,
  void,
  { rejectValue: string }
>(
  "notifications/markAllNotificationsAsRead",

  async (_, { rejectWithValue }) => {
    try {
      const response = await api.patch<NotificationActionResponse>(
        "/api/notifications/read-all",
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to mark all notifications as read",
      );
    }
  },
);

/* =========================================================
   DELETE NOTIFICATION
   ========================================================= */

export const deleteNotification = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "notifications/deleteNotification",

  async (notificationId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);

      return notificationId;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete notification",
      );
    }
  },
);

/* =========================================================
   SLICE
   ========================================================= */

const notificationsSlice = createSlice({
  name: "notifications",

  initialState,

  reducers: {
    /* =====================================================
       ADD REALTIME NOTIFICATION
       ===================================================== */

    addNotification: (state, action: PayloadAction<Notification>) => {
      const notification = action.payload;

      const exists = state.items.some((item) => item.id === notification.id);

      if (exists) {
        return;
      }

      state.items.unshift(notification);

      if (!notification.is_read) {
        state.unreadCount += 1;
      }

      state.pagination.total += 1;
    },

    /* =====================================================
       UPDATE REALTIME NOTIFICATION
       ===================================================== */

    updateNotification: (state, action: PayloadAction<Notification>) => {
      const notification = action.payload;

      const index = state.items.findIndex(
        (item) => item.id === notification.id,
      );

      if (index === -1) {
        return;
      }

      const previous = state.items[index];

      if (previous.is_read && !notification.is_read) {
        state.unreadCount += 1;
      }

      if (!previous.is_read && notification.is_read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }

      state.items[index] = notification;
    },

    /* =====================================================
       CLEAR NOTIFICATIONS
       ===================================================== */

    clearNotifications: (state) => {
      state.items = [];

      state.unreadCount = 0;

      state.pagination = {
        total: 0,
        limit: 20,
        offset: 0,
        hasMore: false,
      };

      state.error = null;
    },

    /* =====================================================
       CLEAR ERROR
       ===================================================== */

    clearNotificationError: (state) => {
      state.error = null;
    },

    /* =====================================================
       SET UNREAD COUNT
       ===================================================== */

    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = Math.max(0, action.payload);
    },
  },

  extraReducers: (builder) => {
    /* =====================================================
       FETCH NOTIFICATIONS
       ===================================================== */

    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;

        state.error = null;
      })

      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;

        state.error = null;

        const { data, pagination } = action.payload;

        /*
         * First page:
         * replace existing data.
         *
         * Next page:
         * append data.
         */

        if (pagination.offset === 0) {
          state.items = data;
        } else {
          const existingIds = new Set(state.items.map((item) => item.id));

          const newItems = data.filter((item) => !existingIds.has(item.id));

          state.items.push(...newItems);
        }

        state.pagination = pagination;

        /*
         * Keep unread badge synchronized
         * with loaded notification data.
         */

        state.unreadCount = state.items.filter((item) => !item.is_read).length;
      })

      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Failed to load notifications";
      });

    /* =====================================================
       FETCH UNREAD COUNT
       ===================================================== */

    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.data.count;
      })

      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.error = action.payload || "Failed to load unread count";
      });

    /* =====================================================
       MARK SINGLE AS READ
       ===================================================== */

    builder
      .addCase(markNotificationAsRead.pending, (state) => {
        state.actionLoading = true;

        state.error = null;
      })

      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.actionLoading = false;

        const notification = action.payload.data;

        if (notification && "id" in notification) {
          const index = state.items.findIndex(
            (item) => item.id === notification.id,
          );

          if (index !== -1) {
            const wasUnread = !state.items[index].is_read;

            state.items[index] = notification;

            if (wasUnread) {
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
          }
        }
      })

      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.actionLoading = false;

        state.error = action.payload || "Failed to mark notification as read";
      });

    /* =====================================================
       MARK ALL AS READ
       ===================================================== */

    builder
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.actionLoading = true;

        state.error = null;
      })

      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.actionLoading = false;

        state.items.forEach((notification) => {
          notification.is_read = true;

          notification.read_at = new Date().toISOString();
        });

        state.unreadCount = 0;
      })

      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.actionLoading = false;

        state.error =
          action.payload || "Failed to mark all notifications as read";
      });

    /* =====================================================
       DELETE
       ===================================================== */

    builder
      .addCase(deleteNotification.pending, (state) => {
        state.actionLoading = true;

        state.error = null;
      })

      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.actionLoading = false;

        const notification = state.items.find(
          (item) => item.id === action.payload,
        );

        if (notification && !notification.is_read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }

        state.items = state.items.filter((item) => item.id !== action.payload);

        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })

      .addCase(deleteNotification.rejected, (state, action) => {
        state.actionLoading = false;

        state.error = action.payload || "Failed to delete notification";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  addNotification,
  updateNotification,
  clearNotifications,
  clearNotificationError,
  setUnreadCount,
} = notificationsSlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

export const selectNotifications = (state: {
  notifications: NotificationsState;
}) => state.notifications.items;

export const selectUnreadCount = (state: {
  notifications: NotificationsState;
}) => state.notifications.unreadCount;

export const selectNotificationsLoading = (state: {
  notifications: NotificationsState;
}) => state.notifications.loading;

export const selectNotificationsActionLoading = (state: {
  notifications: NotificationsState;
}) => state.notifications.actionLoading;

export const selectNotificationsError = (state: {
  notifications: NotificationsState;
}) => state.notifications.error;

export const selectHasUnreadNotifications = (state: {
  notifications: NotificationsState;
}) => state.notifications.unreadCount > 0;

/* =========================================================
   SELECTORS - FILTERED
   ========================================================= */

export const selectUnreadNotifications = (state: {
  notifications: NotificationsState;
}) => state.notifications.items.filter((notification) => !notification.is_read);

export const selectCriticalNotifications = (state: {
  notifications: NotificationsState;
}) =>
  state.notifications.items.filter(
    (notification) => notification.severity === "CRITICAL",
  );

/* =========================================================
   EXPORT
   ========================================================= */

export default notificationsSlice.reducer;
