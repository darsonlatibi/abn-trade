/* =========================================================
   ABN FLEET SYSTEM
   HELPDESK TICKET SLICE
   ========================================================= */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import api from "../../api/axios";

/* =========================================================
   TYPES
   ========================================================= */

export interface HelpdeskUser {
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

  sender?: HelpdeskUser;
}

export interface HelpdeskTicket {
  id: number;
  user_id: number;
  assigned_to?: number | null;

  subject: string;
  description: string;

  priority: string;
  status: string;

  created_at: string;
  updated_at: string;

  user?: HelpdeskUser;
  technician?: HelpdeskUser;

  messages?: HelpdeskMessage[];
}

/* =========================================================
   PAYLOADS
   ========================================================= */

export interface CreateTicketPayload {
  subject: string;
  description: string;
  priority?: string;
}

export interface UpdateTicketPayload {
  id: number;
  subject?: string;
  description?: string;
  priority?: string;
  status?: string;
  assigned_to?: number | null;
}

export interface CreateMessagePayload {
  ticketId: number;
  message: string;
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
  ticket?: T;
  tickets?: T;
}

/* =========================================================
   STATE
   ========================================================= */

interface HelpdeskTicketState {
  tickets: HelpdeskTicket[];
  selectedTicket: HelpdeskTicket | null;

  loading: boolean;
  ticketLoading: boolean;
  messageLoading: boolean;

  error: string | null;
  messageError: string | null;

  successMessage: string | null;
}

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState: HelpdeskTicketState = {
  tickets: [],
  selectedTicket: null,

  loading: false,
  ticketLoading: false,
  messageLoading: false,

  error: null,
  messageError: null,

  successMessage: null,
};

/* =========================================================
   CREATE TICKET
   POST /helpdeskTicket/tickets
   ========================================================= */

export const createTicket = createAsyncThunk<
  HelpdeskTicket,
  CreateTicketPayload,
  { rejectValue: string }
>("helpdeskTicket/createTicket", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post<ApiResponse<HelpdeskTicket>>(
      "/helpdeskTicket/tickets",
      payload,
    );

    const ticket = response.data.ticket ?? response.data.data;

    if (!ticket) {
      return rejectWithValue(response.data.message || "Ticket gagal dibuat.");
    }

    return ticket;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue("Gagal membuat ticket.");
  }
});

/* =========================================================
   GET TICKETS
   GET /helpdeskTicket/tickets
   ========================================================= */

export const fetchTickets = createAsyncThunk<
  HelpdeskTicket[],
  void,
  { rejectValue: string }
>("helpdeskTicket/fetchTickets", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiResponse<HelpdeskTicket[]>>(
      "/helpdeskTicket/tickets",
    );

    return response.data.tickets ?? response.data.data ?? [];
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue("Gagal mengambil daftar ticket.");
  }
});

/* =========================================================
   GET TICKET BY ID
   GET /helpdeskTicket/tickets/:id
   ========================================================= */

export const fetchTicketById = createAsyncThunk<
  HelpdeskTicket,
  number,
  { rejectValue: string }
>("helpdeskTicket/fetchTicketById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiResponse<HelpdeskTicket>>(
      `/helpdeskTicket/tickets/${id}`,
    );

    const ticket = response.data.ticket ?? response.data.data;

    if (!ticket) {
      return rejectWithValue(
        response.data.message || "Ticket tidak ditemukan.",
      );
    }

    return ticket;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue("Gagal mengambil detail ticket.");
  }
});

/* =========================================================
   UPDATE TICKET
   PATCH /helpdeskTicket/tickets/:id
   ========================================================= */

export const updateTicket = createAsyncThunk<
  HelpdeskTicket,
  UpdateTicketPayload,
  { rejectValue: string }
>(
  "helpdeskTicket/updateTicket",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const response = await api.patch<ApiResponse<HelpdeskTicket>>(
        `/helpdeskTicket/tickets/${id}`,
        payload,
      );

      const ticket = response.data.ticket ?? response.data.data;

      if (!ticket) {
        return rejectWithValue(
          response.data.message || "Ticket gagal diperbarui.",
        );
      }

      return ticket;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      return rejectWithValue("Gagal memperbarui ticket.");
    }
  },
);

/* =========================================================
   DELETE TICKET
   DELETE /helpdeskTicket/tickets/:id
   ========================================================= */

export const deleteTicket = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("helpdeskTicket/deleteTicket", async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete<ApiResponse<null>>(
      `/helpdeskTicket/tickets/${id}`,
    );

    if (!response.data.success) {
      return rejectWithValue(response.data.message || "Ticket gagal dihapus.");
    }

    return id;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue("Gagal menghapus ticket.");
  }
});

/* =========================================================
   ADD MESSAGE
   POST /helpdeskTicket/tickets/:id/messages
   ========================================================= */

export const addMessage = createAsyncThunk<
  HelpdeskMessage,
  CreateMessagePayload,
  { rejectValue: string }
>(
  "helpdeskTicket/addMessage",
  async (
    { ticketId, message, attachment_path, is_internal },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post<ApiResponse<HelpdeskMessage>>(
        `/helpdeskTicket/tickets/${ticketId}/messages`,
        {
          message,
          attachment_path,
          is_internal,
        },
      );

      const newMessage = response.data.data;

      if (!newMessage) {
        return rejectWithValue(
          response.data.message || "Message gagal dikirim.",
        );
      }

      return newMessage;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      return rejectWithValue("Gagal mengirim message.");
    }
  },
);

/* =========================================================
   SLICE
   ========================================================= */

const helpdeskTicketSlice = createSlice({
  name: "helpdeskTicket",

  initialState,

  reducers: {
    /* =====================================================
       CLEAR ERROR
       ===================================================== */

    clearHelpdeskError(state) {
      state.error = null;
      state.messageError = null;
    },

    /* =====================================================
       CLEAR SUCCESS
       ===================================================== */

    clearHelpdeskSuccess(state) {
      state.successMessage = null;
    },

    /* =====================================================
       CLEAR SELECTED TICKET
       ===================================================== */

    clearSelectedTicket(state) {
      state.selectedTicket = null;
    },

    /* =====================================================
       SET SELECTED TICKET
       ===================================================== */

    setSelectedTicket(state, action: PayloadAction<HelpdeskTicket | null>) {
      state.selectedTicket = action.payload;
    },
  },

  /* =======================================================
     EXTRA REDUCERS
     ======================================================= */

  extraReducers: (builder) => {
    /* =====================================================
       CREATE TICKET
       ===================================================== */

    builder
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;

        state.tickets.unshift(action.payload);

        state.selectedTicket = action.payload;

        state.successMessage = "Ticket berhasil dibuat.";
      })

      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Gagal membuat ticket.";
      });

    /* =====================================================
       FETCH TICKETS
       ===================================================== */

    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })

      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Gagal mengambil daftar ticket.";
      });

    /* =====================================================
       FETCH TICKET BY ID
       ===================================================== */

    builder
      .addCase(fetchTicketById.pending, (state) => {
        state.ticketLoading = true;
        state.error = null;
      })

      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.ticketLoading = false;

        state.selectedTicket = action.payload;

        const index = state.tickets.findIndex(
          (ticket) => ticket.id === action.payload.id,
        );

        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
      })

      .addCase(fetchTicketById.rejected, (state, action) => {
        state.ticketLoading = false;

        state.error = action.payload || "Gagal mengambil detail ticket.";
      });

    /* =====================================================
       UPDATE TICKET
       ===================================================== */

    builder
      .addCase(updateTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(updateTicket.fulfilled, (state, action) => {
        state.loading = false;

        const ticket = action.payload;

        const index = state.tickets.findIndex((item) => item.id === ticket.id);

        if (index !== -1) {
          state.tickets[index] = ticket;
        }

        if (state.selectedTicket?.id === ticket.id) {
          state.selectedTicket = ticket;
        }

        state.successMessage = "Ticket berhasil diperbarui.";
      })

      .addCase(updateTicket.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Gagal memperbarui ticket.";
      });

    /* =====================================================
       DELETE TICKET
       ===================================================== */

    builder
      .addCase(deleteTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.loading = false;

        const id = action.payload;

        state.tickets = state.tickets.filter((ticket) => ticket.id !== id);

        if (state.selectedTicket?.id === id) {
          state.selectedTicket = null;
        }

        state.successMessage = "Ticket berhasil dihapus.";
      })

      .addCase(deleteTicket.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || "Gagal menghapus ticket.";
      });

    /* =====================================================
       ADD MESSAGE
       ===================================================== */

    builder
      .addCase(addMessage.pending, (state) => {
        state.messageLoading = true;
        state.messageError = null;
        state.successMessage = null;
      })

      .addCase(addMessage.fulfilled, (state, action) => {
        state.messageLoading = false;

        const message = action.payload;

        /* ===============================================
             SELECTED TICKET
             =============================================== */

        if (state.selectedTicket?.id === message.ticket_id) {
          if (!state.selectedTicket.messages) {
            state.selectedTicket.messages = [];
          }

          state.selectedTicket.messages.push(message);
        }

        /* ===============================================
             TICKET LIST
             =============================================== */

        const ticket = state.tickets.find(
          (item) => item.id === message.ticket_id,
        );

        if (ticket) {
          if (!ticket.messages) {
            ticket.messages = [];
          }

          ticket.messages.push(message);
        }

        state.successMessage = "Message berhasil dikirim.";
      })

      .addCase(addMessage.rejected, (state, action) => {
        state.messageLoading = false;

        state.messageError = action.payload || "Gagal mengirim message.";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  clearHelpdeskError,
  clearHelpdeskSuccess,
  clearSelectedTicket,
  setSelectedTicket,
} = helpdeskTicketSlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

export const selectHelpdeskTickets = (state: {
  helpdeskTicket: HelpdeskTicketState;
}) => state.helpdeskTicket.tickets;

export const selectSelectedHelpdeskTicket = (state: {
  helpdeskTicket: HelpdeskTicketState;
}) => state.helpdeskTicket.selectedTicket;

export const selectHelpdeskLoading = (state: {
  helpdeskTicket: HelpdeskTicketState;
}) => state.helpdeskTicket.loading;

export const selectHelpdeskTicketLoading = (state: {
  helpdeskTicket: HelpdeskTicketState;
}) => state.helpdeskTicket.ticketLoading;

export const selectHelpdeskMessageLoading = (state: {
  helpdeskTicket: HelpdeskTicketState;
}) => state.helpdeskTicket.messageLoading;

export const selectHelpdeskError = (state: {
  helpdeskTicket: HelpdeskTicketState;
}) => state.helpdeskTicket.error;

export const selectHelpdeskMessageError = (state: {
  helpdeskTicket: HelpdeskTicketState;
}) => state.helpdeskTicket.messageError;

export const selectHelpdeskSuccessMessage = (state: {
  helpdeskTicket: HelpdeskTicketState;
}) => state.helpdeskTicket.successMessage;

/* =========================================================
   REDUCER
   ========================================================= */

export default helpdeskTicketSlice.reducer;
