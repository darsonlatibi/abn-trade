/* =========================================================
   ABN FLEET SYSTEM
   HELPDESK MESSAGE SLICE
   ========================================================= */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";

import api from "../../api/axios";

/* =========================================================
   API
   ========================================================= */

const HELPDESK_MESSAGE_URL = "/helpdeskMessage";

/* =========================================================
   TYPES
   ========================================================= */

export interface HelpdeskMessageUser {
  id: number;
  username?: string;
  email?: string;
  full_name?: string;
  role?: string;
}

export interface HelpdeskMessage {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  attachment_path?: string | null;
  is_internal: boolean;
  created_at: string;
  updated_at: string;

  sender?: HelpdeskMessageUser;
}

/* =========================================================
   PAYLOADS
   ========================================================= */

export interface CreateHelpdeskMessagePayload {
  ticketId: number;
  message: string;
  attachment_path?: string | null;
  is_internal?: boolean;
}

export interface UpdateHelpdeskMessagePayload {
  id: number;
  message?: string;
  attachment_path?: string | null;
  is_internal?: boolean;
}

/* =========================================================
   API RESPONSE
   ========================================================= */

interface ApiResponse<T> {
  success: boolean;
  message?: string;

  data?: T;

  messageData?: T;

  messages?: T;

  count?: number;
}

/* =========================================================
   STATE
   ========================================================= */

interface HelpdeskMessageState {
  messages: HelpdeskMessage[];

  selectedMessage: HelpdeskMessage | null;

  messageCount: number;

  loading: boolean;

  listLoading: boolean;

  detailLoading: boolean;

  countLoading: boolean;

  error: string | null;

  successMessage: string | null;
}

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: HelpdeskMessageState = {
  messages: [],

  selectedMessage: null,

  messageCount: 0,

  loading: false,

  listLoading: false,

  detailLoading: false,

  countLoading: false,

  error: null,

  successMessage: null,
};

/* =========================================================
   CREATE MESSAGE
   POST /api/helpdeskMessage/messages
   ========================================================= */

export const createHelpdeskMessage = createAsyncThunk<
  HelpdeskMessage,
  CreateHelpdeskMessagePayload,
  { rejectValue: string }
>(
  "helpdeskMessage/createMessage",
  async (
    { ticketId, message, attachment_path, is_internal },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post<ApiResponse<HelpdeskMessage>>(
        `${HELPDESK_MESSAGE_URL}/messages`,
        {
          ticket_id: ticketId,
          message,
          attachment_path,
          is_internal,
        },
      );

      const newMessage = response.data.data ?? response.data.messageData;

      if (!newMessage) {
        return rejectWithValue(
          response.data.message || "Message gagal dibuat.",
        );
      }

      return newMessage;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Gagal membuat message.",
        );
      }

      return rejectWithValue("Gagal membuat message.");
    }
  },
);

/* =========================================================
   GET MESSAGES BY TICKET
   GET /api/helpdeskMessage/tickets/:ticketId/messages
   ========================================================= */

export const fetchMessagesByTicket = createAsyncThunk<
  HelpdeskMessage[],
  number,
  { rejectValue: string }
>(
  "helpdeskMessage/fetchMessagesByTicket",
  async (ticketId, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<HelpdeskMessage[]>>(
        `${HELPDESK_MESSAGE_URL}/tickets/${ticketId}/messages`,
      );

      return response.data.messages ?? response.data.data ?? [];
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Gagal mengambil message ticket.",
        );
      }

      return rejectWithValue("Gagal mengambil message ticket.");
    }
  },
);

/* =========================================================
   GET MESSAGE COUNT
   GET /api/helpdeskMessage/tickets/:ticketId/messages/count
   ========================================================= */

export const fetchMessageCount = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "helpdeskMessage/fetchMessageCount",
  async (ticketId, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<null>>(
        `${HELPDESK_MESSAGE_URL}/tickets/${ticketId}/messages/count`,
      );

      return response.data.count ?? 0;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Gagal mengambil jumlah message.",
        );
      }

      return rejectWithValue("Gagal mengambil jumlah message.");
    }
  },
);

/* =========================================================
   GET MESSAGE BY ID
   GET /api/helpdeskMessage/messages/:id
   ========================================================= */

export const fetchHelpdeskMessageById = createAsyncThunk<
  HelpdeskMessage,
  number,
  { rejectValue: string }
>("helpdeskMessage/fetchMessageById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiResponse<HelpdeskMessage>>(
      `${HELPDESK_MESSAGE_URL}/messages/${id}`,
    );

    const message = response.data.data ?? response.data.messageData;

    if (!message) {
      return rejectWithValue(
        response.data.message || "Message tidak ditemukan.",
      );
    }

    return message;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal mengambil detail message.",
      );
    }

    return rejectWithValue("Gagal mengambil detail message.");
  }
});

/* =========================================================
   UPDATE MESSAGE
   PUT /api/helpdeskMessage/messages/:id
   ========================================================= */

export const updateHelpdeskMessage = createAsyncThunk<
  HelpdeskMessage,
  UpdateHelpdeskMessagePayload,
  { rejectValue: string }
>(
  "helpdeskMessage/updateMessage",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const response = await api.put<ApiResponse<HelpdeskMessage>>(
        `${HELPDESK_MESSAGE_URL}/messages/${id}`,
        payload,
      );

      const message = response.data.data ?? response.data.messageData;

      if (!message) {
        return rejectWithValue(
          response.data.message || "Message gagal diperbarui.",
        );
      }

      return message;
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Gagal memperbarui message.",
        );
      }

      return rejectWithValue("Gagal memperbarui message.");
    }
  },
);

/* =========================================================
   DELETE MESSAGE
   DELETE /api/helpdeskMessage/messages/:id
   ========================================================= */

export const deleteHelpdeskMessage = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("helpdeskMessage/deleteMessage", async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete<ApiResponse<null>>(
      `${HELPDESK_MESSAGE_URL}/messages/${id}`,
    );

    if (!response.data.success) {
      return rejectWithValue(response.data.message || "Message gagal dihapus.");
    }

    return id;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      return rejectWithValue(
        error.response?.data?.message || "Gagal menghapus message.",
      );
    }

    return rejectWithValue("Gagal menghapus message.");
  }
});

/* =========================================================
   SLICE
   ========================================================= */

const helpdeskMessageSlice = createSlice({
  name: "helpdeskMessage",

  initialState,

  reducers: {
    /* =====================================================
       CLEAR ERROR
       ===================================================== */

    clearHelpdeskMessageError(state) {
      state.error = null;
    },

    /* =====================================================
       CLEAR SUCCESS
       ===================================================== */

    clearHelpdeskMessageSuccess(state) {
      state.successMessage = null;
    },

    /* =====================================================
       CLEAR MESSAGES
       ===================================================== */

    clearHelpdeskMessages(state) {
      state.messages = [];
      state.messageCount = 0;
      state.selectedMessage = null;
    },

    /* =====================================================
       CLEAR SELECTED MESSAGE
       ===================================================== */

    clearSelectedHelpdeskMessage(state) {
      state.selectedMessage = null;
    },

    /* =====================================================
       SET SELECTED MESSAGE
       ===================================================== */

    setSelectedHelpdeskMessage(
      state,
      action: PayloadAction<HelpdeskMessage | null>,
    ) {
      state.selectedMessage = action.payload;
    },

    /* =====================================================
       SET MESSAGE COUNT
       ===================================================== */

    setHelpdeskMessageCount(state, action: PayloadAction<number>) {
      state.messageCount = action.payload;
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       CREATE MESSAGE
       ===================================================== */

    builder
      .addCase(createHelpdeskMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(createHelpdeskMessage.fulfilled, (state, action) => {
        state.loading = false;

        state.messages.push(action.payload);

        state.selectedMessage = action.payload;

        state.messageCount += 1;

        state.successMessage = "Message berhasil dibuat.";
      })

      .addCase(createHelpdeskMessage.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Gagal membuat message.";
      });

    /* =====================================================
       FETCH MESSAGES BY TICKET
       ===================================================== */

    builder
      .addCase(fetchMessagesByTicket.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })

      .addCase(fetchMessagesByTicket.fulfilled, (state, action) => {
        state.listLoading = false;

        state.messages = action.payload;

        state.messageCount = action.payload.length;
      })

      .addCase(fetchMessagesByTicket.rejected, (state, action) => {
        state.listLoading = false;

        state.error = action.payload || "Gagal mengambil message ticket.";
      });

    /* =====================================================
       FETCH MESSAGE COUNT
       ===================================================== */

    builder
      .addCase(fetchMessageCount.pending, (state) => {
        state.countLoading = true;
        state.error = null;
      })

      .addCase(fetchMessageCount.fulfilled, (state, action) => {
        state.countLoading = false;

        state.messageCount = action.payload;
      })

      .addCase(fetchMessageCount.rejected, (state, action) => {
        state.countLoading = false;

        state.error = action.payload || "Gagal mengambil jumlah message.";
      });

    /* =====================================================
       FETCH MESSAGE BY ID
       ===================================================== */

    builder
      .addCase(fetchHelpdeskMessageById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })

      .addCase(fetchHelpdeskMessageById.fulfilled, (state, action) => {
        state.detailLoading = false;

        state.selectedMessage = action.payload;

        const index = state.messages.findIndex(
          (item) => item.id === action.payload.id,
        );

        if (index !== -1) {
          state.messages[index] = action.payload;
        }
      })

      .addCase(fetchHelpdeskMessageById.rejected, (state, action) => {
        state.detailLoading = false;

        state.error = action.payload || "Gagal mengambil detail message.";
      });

    /* =====================================================
       UPDATE MESSAGE
       ===================================================== */

    builder
      .addCase(updateHelpdeskMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(updateHelpdeskMessage.fulfilled, (state, action) => {
        state.loading = false;

        const message = action.payload;

        const index = state.messages.findIndex(
          (item) => item.id === message.id,
        );

        if (index !== -1) {
          state.messages[index] = message;
        }

        if (state.selectedMessage?.id === message.id) {
          state.selectedMessage = message;
        }

        state.successMessage = "Message berhasil diperbarui.";
      })

      .addCase(updateHelpdeskMessage.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Gagal memperbarui message.";
      });

    /* =====================================================
       DELETE MESSAGE
       ===================================================== */

    builder
      .addCase(deleteHelpdeskMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(deleteHelpdeskMessage.fulfilled, (state, action) => {
        state.loading = false;

        const id = action.payload;

        state.messages = state.messages.filter((message) => message.id !== id);

        if (state.selectedMessage?.id === id) {
          state.selectedMessage = null;
        }

        if (state.messageCount > 0) {
          state.messageCount -= 1;
        }

        state.successMessage = "Message berhasil dihapus.";
      })

      .addCase(deleteHelpdeskMessage.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Gagal menghapus message.";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  clearHelpdeskMessageError,
  clearHelpdeskMessageSuccess,
  clearHelpdeskMessages,
  clearSelectedHelpdeskMessage,
  setSelectedHelpdeskMessage,
  setHelpdeskMessageCount,
} = helpdeskMessageSlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

export const selectHelpdeskMessages = (state: {
  helpdeskMessage: HelpdeskMessageState;
}) => state.helpdeskMessage.messages;

export const selectSelectedHelpdeskMessage = (state: {
  helpdeskMessage: HelpdeskMessageState;
}) => state.helpdeskMessage.selectedMessage;

export const selectHelpdeskMessageCount = (state: {
  helpdeskMessage: HelpdeskMessageState;
}) => state.helpdeskMessage.messageCount;

export const selectHelpdeskMessageLoadingState = (state: {
  helpdeskMessage: HelpdeskMessageState;
}) => state.helpdeskMessage.loading;

export const selectHelpdeskMessageListLoading = (state: {
  helpdeskMessage: HelpdeskMessageState;
}) => state.helpdeskMessage.listLoading;

export const selectHelpdeskMessageDetailLoading = (state: {
  helpdeskMessage: HelpdeskMessageState;
}) => state.helpdeskMessage.detailLoading;

export const selectHelpdeskMessageCountLoading = (state: {
  helpdeskMessage: HelpdeskMessageState;
}) => state.helpdeskMessage.countLoading;

export const selectHelpdeskMessageSliceError = (state: {
  helpdeskMessage: HelpdeskMessageState;
}) => state.helpdeskMessage.error;

export const selectHelpdeskMessageSuccess = (state: {
  helpdeskMessage: HelpdeskMessageState;
}) => state.helpdeskMessage.successMessage;

/* =========================================================
   REDUCER
   ========================================================= */

export default helpdeskMessageSlice.reducer;
