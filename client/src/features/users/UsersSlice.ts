import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import api from "../../api/axios";

/* =========================================================
   ABN TRACKER
   USERS SLICE
   ========================================================= */

/* =========================================================
   TYPES
   ========================================================= */

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "OPERATOR" | "VIEWER";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

/* =========================================================
   CREATE USER
   Password hanya dikirim saat create.
   ========================================================= */

export interface CreateUserPayload {
  email: string;
  full_name: string;
  role: UserRole;
  status?: UserStatus;
  password: string;
}

/* =========================================================
   UPDATE USER
   Password optional.
   ========================================================= */

export interface UpdateUserPayload {
  email?: string;
  full_name?: string;
  role?: UserRole;
  status?: UserStatus;
  password?: string;
}

/* =========================================================
   UPDATE STATUS
   ========================================================= */

export interface UpdateUserStatusPayload {
  id: number;
  status: UserStatus;
}

/* =========================================================
   API RESPONSE
   ========================================================= */

interface UsersResponse {
  success?: boolean;
  message?: string;
  data?: User[];
  users?: User[];
}

interface UserResponse {
  success?: boolean;
  message?: string;
  data?: User;
  user?: User;
}

/* =========================================================
   STATE
   ========================================================= */

interface UsersState {
  users: User[];

  selectedUser: User | null;

  loading: boolean;

  creating: boolean;

  updating: boolean;

  deleting: boolean;

  statusUpdating: boolean;

  error: string | null;

  successMessage: string | null;
}

const initialState: UsersState = {
  users: [],

  selectedUser: null,

  loading: false,

  creating: false,

  updating: false,

  deleting: false,

  statusUpdating: false,

  error: null,

  successMessage: null,
};

/* =========================================================
   HELPERS
   ========================================================= */

const getErrorMessage = (error: any): string => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Terjadi kesalahan pada Users Management."
  );
};

/* =========================================================
   GET USERS
   GET /api/users
   ========================================================= */

export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>("users/fetchUsers", async (_, thunkAPI) => {
  try {
    const response = await api.get<UsersResponse>("/users");

    const data = response.data?.users ?? response.data?.data ?? [];

    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
   GET USER BY ID
   GET /api/users/:id
   ========================================================= */

export const fetchUserById = createAsyncThunk<
  User,
  number,
  { rejectValue: string }
>("users/fetchUserById", async (id, thunkAPI) => {
  try {
    const response = await api.get<UserResponse>(`/users/${id}`);

    const user = response.data?.user ?? response.data?.data;

    if (!user) {
      return thunkAPI.rejectWithValue("Data user tidak ditemukan.");
    }

    return user;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
   CREATE USER
   POST /api/users
   ========================================================= */

export const createUser = createAsyncThunk<
  User,
  CreateUserPayload,
  { rejectValue: string }
>("users/createUser", async (payload, thunkAPI) => {
  try {
    const response = await api.post<UserResponse>("/users", payload);

    const user = response.data?.user ?? response.data?.data;

    if (!user) {
      return thunkAPI.rejectWithValue("Server tidak mengembalikan data user.");
    }

    return user;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
   UPDATE USER
   PUT /api/users/:id
   ========================================================= */

export const updateUser = createAsyncThunk<
  User,
  {
    id: number;
    payload: UpdateUserPayload;
  },
  { rejectValue: string }
>("users/updateUser", async ({ id, payload }, thunkAPI) => {
  try {
    const response = await api.put<UserResponse>(`/users/${id}`, payload);

    const user = response.data?.user ?? response.data?.data;

    if (!user) {
      return thunkAPI.rejectWithValue("Server tidak mengembalikan data user.");
    }

    return user;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
   UPDATE USER STATUS
   PATCH /api/users/:id/status
   ========================================================= */

export const updateUserStatus = createAsyncThunk<
  User,
  UpdateUserStatusPayload,
  { rejectValue: string }
>("users/updateUserStatus", async ({ id, status }, thunkAPI) => {
  try {
    const response = await api.patch<UserResponse>(`/users/${id}/status`, {
      status,
    });

    const user = response.data?.user ?? response.data?.data;

    if (!user) {
      return thunkAPI.rejectWithValue("Server tidak mengembalikan data user.");
    }

    return user;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
   DELETE USER
   DELETE /api/users/:id
   ========================================================= */

export const deleteUser = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("users/deleteUser", async (id, thunkAPI) => {
  try {
    await api.delete(`/users/${id}`);

    return id;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

/* =========================================================
   SLICE
   ========================================================= */

const usersSlice = createSlice({
  name: "users",

  initialState,

  reducers: {
    /* =====================================================
       CLEAR ERROR
       ===================================================== */

    clearUsersError: (state) => {
      state.error = null;
    },

    /* =====================================================
       CLEAR SUCCESS MESSAGE
       ===================================================== */

    clearUsersSuccess: (state) => {
      state.successMessage = null;
    },

    /* =====================================================
       SELECT USER
       ===================================================== */

    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },

    /* =====================================================
       CLEAR SELECTED USER
       ===================================================== */

    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },

    /* =====================================================
       CLEAR USERS
       ===================================================== */

    clearUsers: (state) => {
      state.users = [];
      state.selectedUser = null;
      state.error = null;
      state.successMessage = null;
    },
  },

  extraReducers: (builder) => {
    /* =====================================================
       FETCH USERS
       ===================================================== */

    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })

      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Gagal mengambil daftar users.";
      });

    /* =====================================================
       FETCH USER BY ID
       ===================================================== */

    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;

        const index = state.users.findIndex(
          (user) => user.id === action.payload.id,
        );

        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })

      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Gagal mengambil data user.";
      });

    /* =====================================================
       CREATE USER
       ===================================================== */

    builder
      .addCase(createUser.pending, (state) => {
        state.creating = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(createUser.fulfilled, (state, action) => {
        state.creating = false;

        state.users.unshift(action.payload);

        state.successMessage = "User berhasil dibuat.";
      })

      .addCase(createUser.rejected, (state, action) => {
        state.creating = false;

        state.error = action.payload || "Gagal membuat user.";
      });

    /* =====================================================
       UPDATE USER
       ===================================================== */

    builder
      .addCase(updateUser.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        state.updating = false;

        const index = state.users.findIndex(
          (user) => user.id === action.payload.id,
        );

        if (index !== -1) {
          state.users[index] = action.payload;
        }

        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }

        state.successMessage = "User berhasil diperbarui.";
      })

      .addCase(updateUser.rejected, (state, action) => {
        state.updating = false;

        state.error = action.payload || "Gagal memperbarui user.";
      });

    /* =====================================================
       UPDATE USER STATUS
       ===================================================== */

    builder
      .addCase(updateUserStatus.pending, (state) => {
        state.statusUpdating = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.statusUpdating = false;

        const index = state.users.findIndex(
          (user) => user.id === action.payload.id,
        );

        if (index !== -1) {
          state.users[index] = action.payload;
        }

        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }

        state.successMessage = "Status user berhasil diperbarui.";
      })

      .addCase(updateUserStatus.rejected, (state, action) => {
        state.statusUpdating = false;

        state.error = action.payload || "Gagal memperbarui status user.";
      });

    /* =====================================================
       DELETE USER
       ===================================================== */

    builder
      .addCase(deleteUser.pending, (state) => {
        state.deleting = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleting = false;

        state.users = state.users.filter((user) => user.id !== action.payload);

        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }

        state.successMessage = "User berhasil dihapus.";
      })

      .addCase(deleteUser.rejected, (state, action) => {
        state.deleting = false;

        state.error = action.payload || "Gagal menghapus user.";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  clearUsersError,
  clearUsersSuccess,
  setSelectedUser,
  clearSelectedUser,
  clearUsers,
} = usersSlice.actions;

/* =========================================================
   SELECTORS
   ========================================================= */

export const selectUsers = (state: { users: UsersState }) => state.users.users;

export const selectSelectedUser = (state: { users: UsersState }) =>
  state.users.selectedUser;

export const selectUsersLoading = (state: { users: UsersState }) =>
  state.users.loading;

export const selectUsersCreating = (state: { users: UsersState }) =>
  state.users.creating;

export const selectUsersUpdating = (state: { users: UsersState }) =>
  state.users.updating;

export const selectUsersDeleting = (state: { users: UsersState }) =>
  state.users.deleting;

export const selectUsersStatusUpdating = (state: { users: UsersState }) =>
  state.users.statusUpdating;

export const selectUsersError = (state: { users: UsersState }) =>
  state.users.error;

export const selectUsersSuccess = (state: { users: UsersState }) =>
  state.users.successMessage;

/* =========================================================
   EXPORT
   ========================================================= */

export default usersSlice.reducer;
