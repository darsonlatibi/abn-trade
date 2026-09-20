import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users as UsersIcon,
  X,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch } from "../../stores/store";

import {
  clearUsersError,
  clearUsersSuccess,
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
  updateUserStatus,
  type CreateUserPayload,
  type UpdateUserPayload,
  type User,
  type UserRole,
  type UserStatus,
  selectUsers,
  selectUsersCreating,
  selectUsersDeleting,
  selectUsersError,
  selectUsersLoading,
  selectUsersStatusUpdating,
  selectUsersSuccess,
  selectUsersUpdating,
} from "../../features/users/UsersSlice";

import "./Users.css";

/* =========================================================
   CONSTANTS
   ========================================================= */

const ROLES: UserRole[] = ["SUPER_ADMIN", "ADMIN", "OPERATOR", "VIEWER"];

const STATUSES: UserStatus[] = ["ACTIVE", "INACTIVE", "SUSPENDED"];

/* =========================================================
   FORM
   ========================================================= */

interface UserFormState {
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  password: string;
}

const emptyForm: UserFormState = {
  email: "",
  full_name: "",
  role: "VIEWER",
  status: "ACTIVE",
  password: "",
};

/* =========================================================
   HELPERS
   ========================================================= */

const formatDate = (value: string | null) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name: string) => {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U"
  );
};

const roleLabel = (role: UserRole) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "SUPER ADMIN";

    case "ADMIN":
      return "ADMIN";

    case "OPERATOR":
      return "OPERATOR";

    case "VIEWER":
      return "VIEWER";

    default:
      return role;
  }
};

/* =========================================================
   COMPONENT
   ========================================================= */

function Users() {
  const dispatch = useDispatch<AppDispatch>();

  const users = useSelector(selectUsers);
  const loading = useSelector(selectUsersLoading);
  const creating = useSelector(selectUsersCreating);
  const updating = useSelector(selectUsersUpdating);
  const deleting = useSelector(selectUsersDeleting);
  const statusUpdating = useSelector(selectUsersStatusUpdating);
  const error = useSelector(selectUsersError);
  const successMessage = useSelector(selectUsersSuccess);

  /* =======================================================
     LOCAL STATE
     ======================================================= */

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");

  const [statusFilter, setStatusFilter] = useState<"ALL" | UserStatus>("ALL");

  const [showModal, setShowModal] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const [form, setForm] = useState<UserFormState>(emptyForm);

  const [formError, setFormError] = useState<string | null>(null);

  /* =======================================================
     FETCH
     ======================================================= */

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  /* =======================================================
     AUTO CLEAR SUCCESS
     ======================================================= */

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      dispatch(clearUsersSuccess());
    }, 3500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [successMessage, dispatch]);

  /* =======================================================
     FILTER
     ======================================================= */

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !keyword ||
        user.full_name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.username.toLowerCase().includes(keyword);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  /* =======================================================
     STATISTICS
     ======================================================= */

  const totalUsers = users.length;

  const activeUsers = users.filter((user) => user.status === "ACTIVE").length;

  const adminUsers = users.filter(
    (user) => user.role === "ADMIN" || user.role === "SUPER_ADMIN",
  ).length;

  const suspendedUsers = users.filter(
    (user) => user.status === "SUSPENDED",
  ).length;

  /* =======================================================
     OPEN CREATE
     ======================================================= */

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError(null);
    dispatch(clearUsersError());
    setShowModal(true);
  };

  /* =======================================================
     OPEN EDIT
     ======================================================= */

  const openEditModal = (user: User) => {
    setEditingUser(user);

    setForm({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
      password: "",
    });

    setFormError(null);
    dispatch(clearUsersError());
    setShowModal(true);
  };

  /* =======================================================
     CLOSE MODAL
     ======================================================= */

  const closeModal = () => {
    if (creating || updating) {
      return;
    }

    setShowModal(false);
    setEditingUser(null);
    setForm(emptyForm);
    setFormError(null);
  };

  /* =======================================================
     FORM CHANGE
     ======================================================= */

  const updateForm = <K extends keyof UserFormState>(
    field: K,
    value: UserFormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* =======================================================
     SUBMIT
     ======================================================= */

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormError(null);

    if (!form.full_name.trim()) {
      setFormError("Nama lengkap wajib diisi.");
      return;
    }

    if (!form.email.trim()) {
      setFormError("Email wajib diisi.");
      return;
    }

    if (!editingUser && !form.password) {
      setFormError("Password wajib diisi untuk user baru.");
      return;
    }

    if (form.password && form.password.length < 8) {
      setFormError("Password minimal 8 karakter.");
      return;
    }

    if (editingUser) {
      const payload: UpdateUserPayload = {
        email: form.email.trim(),
        full_name: form.full_name.trim(),
        role: form.role,
        status: form.status,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      const result = await dispatch(
        updateUser({
          id: editingUser.id,
          payload,
        }),
      );

      if (updateUser.fulfilled.match(result)) {
        closeModal();
      }

      return;
    }

    const payload: CreateUserPayload = {
      email: form.email.trim(),
      full_name: form.full_name.trim(),
      role: form.role,
      status: form.status,
      password: form.password,
    };

    const result = await dispatch(createUser(payload));

    if (createUser.fulfilled.match(result)) {
      closeModal();
    }
  };

  /* =======================================================
     STATUS
     ======================================================= */

  const handleStatusChange = async (user: User, status: UserStatus) => {
    if (statusUpdating) {
      return;
    }

    await dispatch(
      updateUserStatus({
        id: user.id,
        status,
      }),
    );
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const handleDelete = async () => {
    if (!deleteTarget || deleting) {
      return;
    }

    const result = await dispatch(deleteUser(deleteTarget.id));

    if (deleteUser.fulfilled.match(result)) {
      setDeleteTarget(null);
    }
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="users-page">
      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="users-page-header">
        <div>
          <div className="users-breadcrumb">ABN FLEET / USERS</div>

          <h1>User Management</h1>

          <p>Kelola akun, role, status, dan akses pengguna ABN Fleet.</p>
        </div>

        <div className="users-header-actions">
          <button
            type="button"
            className="users-refresh-button"
            onClick={() => dispatch(fetchUsers())}
            disabled={loading}
            title="Refresh users"
          >
            <RefreshCw size={17} className={loading ? "users-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            className="users-primary-button"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Add User
          </button>
        </div>
      </div>

      {/* ===================================================
          ALERT
          =================================================== */}

      {successMessage && (
        <div className="users-alert users-alert-success">
          <CheckCircle2 size={18} />

          <span>{successMessage}</span>

          <button type="button" onClick={() => dispatch(clearUsersSuccess())}>
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="users-alert users-alert-error">
          <AlertTriangle size={18} />

          <span>{error}</span>

          <button type="button" onClick={() => dispatch(clearUsersError())}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* ===================================================
          STAT CARDS
          =================================================== */}

      <div className="users-stat-grid">
        <div className="users-stat-card">
          <div className="users-stat-icon">
            <UsersIcon size={21} />
          </div>

          <div>
            <span>Total Users</span>
            <strong>{totalUsers}</strong>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon users-stat-active">
            <UserCheck size={21} />
          </div>

          <div>
            <span>Active Users</span>
            <strong>{activeUsers}</strong>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon users-stat-admin">
            <Shield size={21} />
          </div>

          <div>
            <span>Administrators</span>
            <strong>{adminUsers}</strong>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon users-stat-suspended">
            <AlertTriangle size={21} />
          </div>

          <div>
            <span>Suspended</span>
            <strong>{suspendedUsers}</strong>
          </div>
        </div>
      </div>

      {/* ===================================================
          TABLE CARD
          =================================================== */}

      <div className="users-card">
        {/* TOOLBAR */}

        <div className="users-toolbar">
          <div className="users-search">
            <Search size={17} />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, username..."
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="users-filters">
            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as "ALL" | UserRole)
              }
            >
              <option value="ALL">All Roles</option>

              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "ALL" | UserStatus)
              }
            >
              <option value="ALL">All Status</option>

              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLE */}

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Created</th>
                <th className="users-action-column">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="users-empty-cell">
                    <div className="users-loading">
                      <RefreshCw size={22} className="users-spin" />

                      <span>Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="users-empty-cell">
                    <div className="users-empty">
                      <UsersIcon size={34} />

                      <strong>Tidak ada user</strong>

                      <span>Tidak ditemukan user sesuai filter.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    {/* USER */}

                    <td>
                      <div className="users-user-cell">
                        <div className="users-avatar">
                          {getInitials(user.full_name)}
                        </div>

                        <div className="users-user-info">
                          <strong>{user.full_name}</strong>

                          <span>@{user.username}</span>
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}

                    <td>
                      <div className="users-email-cell">
                        <Mail size={15} />

                        <span>{user.email}</span>
                      </div>
                    </td>

                    {/* ROLE */}

                    <td>
                      <span
                        className={`users-role users-role-${user.role.toLowerCase()}`}
                      >
                        {roleLabel(user.role)}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td>
                      <select
                        className={`users-status-select users-status-${user.status.toLowerCase()}`}
                        value={user.status}
                        disabled={statusUpdating}
                        onChange={(event) =>
                          handleStatusChange(
                            user,
                            event.target.value as UserStatus,
                          )
                        }
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* LAST LOGIN */}

                    <td>
                      <span className="users-date">
                        {formatDate(user.last_login_at)}
                      </span>
                    </td>

                    {/* CREATED */}

                    <td>
                      <span className="users-date">
                        {formatDate(user.created_at)}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="users-actions">
                        <button
                          type="button"
                          className="users-action-button users-action-edit"
                          onClick={() => openEditModal(user)}
                          title="Edit user"
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          type="button"
                          className="users-action-button users-action-delete"
                          onClick={() => setDeleteTarget(user)}
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}

        <div className="users-table-footer">
          <span>
            Showing <strong>{filteredUsers.length}</strong> of{" "}
            <strong>{users.length}</strong> users
          </span>
        </div>
      </div>

      {/* ===================================================
          CREATE / EDIT MODAL
          =================================================== */}

      {showModal && (
        <div
          className="users-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !creating &&
              !updating
            ) {
              closeModal();
            }
          }}
        >
          <div
            className="users-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="users-modal-title"
          >
            <div className="users-modal-header">
              <div className="users-modal-title">
                <div className="users-modal-icon">
                  {editingUser ? <Edit3 size={20} /> : <UserPlus size={20} />}
                </div>

                <div>
                  <h2 id="users-modal-title">
                    {editingUser ? "Edit User" : "Create User"}
                  </h2>

                  <span>
                    {editingUser
                      ? "Perbarui informasi pengguna."
                      : "Tambahkan pengguna baru ke ABN Fleet."}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="users-modal-close"
                onClick={closeModal}
                disabled={creating || updating}
              >
                <X size={19} />
              </button>
            </div>

            <form className="users-form" onSubmit={handleSubmit}>
              {formError && (
                <div className="users-form-error">
                  <AlertTriangle size={17} />

                  <span>{formError}</span>
                </div>
              )}

              {/* FULL NAME */}

              <div className="users-form-field">
                <label htmlFor="full_name">Full Name</label>

                <input
                  id="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={(event) =>
                    updateForm("full_name", event.target.value)
                  }
                  placeholder="Nama lengkap"
                  autoComplete="name"
                />
              </div>

              {/* EMAIL */}

              <div className="users-form-field">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateForm("email", event.target.value)}
                  placeholder="user@company.com"
                  autoComplete="email"
                />
              </div>

              {/* ROLE + STATUS */}

              <div className="users-form-grid">
                <div className="users-form-field">
                  <label htmlFor="role">Role</label>

                  <select
                    id="role"
                    value={form.role}
                    onChange={(event) =>
                      updateForm("role", event.target.value as UserRole)
                    }
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {roleLabel(role)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="users-form-field">
                  <label htmlFor="status">Status</label>

                  <select
                    id="status"
                    value={form.status}
                    onChange={(event) =>
                      updateForm("status", event.target.value as UserStatus)
                    }
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PASSWORD */}

              <div className="users-form-field">
                <label htmlFor="password">
                  Password
                  {editingUser && <span> (kosongkan jika tidak diubah)</span>}
                </label>

                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    updateForm("password", event.target.value)
                  }
                  placeholder={
                    editingUser ? "Password baru" : "Minimal 8 karakter"
                  }
                  autoComplete={editingUser ? "new-password" : "new-password"}
                />
              </div>

              {/* USERNAME INFO */}

              {editingUser && (
                <div className="users-form-info">
                  <span>Username</span>

                  <strong>@{editingUser.username}</strong>

                  <small>
                    Username dibuat otomatis dan tidak dapat diubah dari User
                    Management.
                  </small>
                </div>
              )}

              {/* FOOTER */}

              <div className="users-modal-footer">
                <button
                  type="button"
                  className="users-secondary-button"
                  onClick={closeModal}
                  disabled={creating || updating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="users-primary-button"
                  disabled={creating || updating}
                >
                  {(creating || updating) && (
                    <RefreshCw size={17} className="users-spin" />
                  )}

                  {!creating &&
                    !updating &&
                    (editingUser ? "Save Changes" : "Create User")}

                  {(creating || updating) && "Processing..."}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          DELETE CONFIRMATION
          =================================================== */}

      {deleteTarget && (
        <div
          className="users-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            className="users-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
          >
            <div className="users-delete-icon">
              <AlertTriangle size={25} />
            </div>

            <h2 id="delete-user-title">Delete User?</h2>

            <p>
              Apakah Anda yakin ingin menghapus user{" "}
              <strong>{deleteTarget.full_name}</strong>?
            </p>

            <span className="users-delete-warning">
              Tindakan ini tidak dapat dibatalkan.
            </span>

            <div className="users-delete-actions">
              <button
                type="button"
                className="users-secondary-button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="users-danger-button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <RefreshCw size={17} className="users-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
