import { useCallback, useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Filter,
  Globe,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";

import type { AppDispatch } from "../../stores/store";

import {
  clearSelectedUserActivity,
  clearUsersActivityError,
  clearUsersActivitySuccess,
  deleteAllUserActivities,
  deleteUserActivity,
  fetchUserActivities,
  fetchUserActivityById,
  selectSelectedUserActivity,
  selectUserActivities,
  selectUsersActivityDeleting,
  selectUsersActivityDeletingAll,
  selectUsersActivityDetailLoading,
  selectUsersActivityError,
  selectUsersActivityLimit,
  selectUsersActivityLoading,
  selectUsersActivityPage,
  selectUsersActivitySuccess,
  selectUsersActivityTotal,
  selectUsersActivityTotalPages,
  selectUsersActivityUpdating,
} from "../../features/users/UsersActivitySlice";

import type {
  UserActivity,
  UserActivityAction,
} from "../../features/users/UsersActivitySlice";

import "./UsersActivity.css";

/* =========================================================
   ABN FLEET
   USERS ACTIVITY / AUDIT LOG
   ========================================================= */

const ACTION_OPTIONS: UserActivityAction[] = [
  "LOGIN",
  "LOGIN_FAILED",
  "LOGOUT",
  "CREATE_USER",
  "UPDATE_USER",
  "DELETE_USER",
  "UPDATE_USER_STATUS",
  "CREATE_VEHICLE",
  "UPDATE_VEHICLE",
  "DELETE_VEHICLE",
  "CREATE_DRIVER",
  "UPDATE_DRIVER",
  "DELETE_DRIVER",
  "CREATE_DEVICE",
  "UPDATE_DEVICE",
  "DELETE_DEVICE",
  "CREATE_GEOFENCE",
  "UPDATE_GEOFENCE",
  "DELETE_GEOFENCE",
  "CREATE_TICKET",
  "UPDATE_TICKET",
  "DELETE_TICKET",
  "SYSTEM_SETTINGS_UPDATE",
  "OTHER",
];

/* =========================================================
   HELPERS
   ========================================================= */

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
};

const formatShortDate = (value?: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getActionClass = (action?: string | null) => {
  if (!action) return "activity-badge activity-badge-default";

  if (action === "LOGIN") {
    return "activity-badge activity-badge-success";
  }

  if (action === "LOGIN_FAILED") {
    return "activity-badge activity-badge-danger";
  }

  if (action === "LOGOUT") {
    return "activity-badge activity-badge-warning";
  }

  if (action.startsWith("CREATE_")) {
    return "activity-badge activity-badge-create";
  }

  if (action.startsWith("UPDATE_")) {
    return "activity-badge activity-badge-update";
  }

  if (action.startsWith("DELETE_")) {
    return "activity-badge activity-badge-danger";
  }

  if (action === "SYSTEM_SETTINGS_UPDATE") {
    return "activity-badge activity-badge-system";
  }

  return "activity-badge activity-badge-default";
};

const getMethodClass = (method?: string | null) => {
  switch (method?.toUpperCase()) {
    case "GET":
      return "method-badge method-get";

    case "POST":
      return "method-badge method-post";

    case "PUT":
    case "PATCH":
      return "method-badge method-put";

    case "DELETE":
      return "method-badge method-delete";

    default:
      return "method-badge";
  }
};

/* =========================================================
   COMPONENT
   ========================================================= */

const UsersActivity = () => {
  const dispatch = useDispatch<AppDispatch>();

  /* =======================================================
     REDUX
     ======================================================= */

  const activities = useSelector(selectUserActivities);

  const selectedActivity = useSelector(selectSelectedUserActivity);

  const loading = useSelector(selectUsersActivityLoading);

  const loadingDetail = useSelector(selectUsersActivityDetailLoading);

  const deleting = useSelector(selectUsersActivityDeleting);

  const deletingAll = useSelector(selectUsersActivityDeletingAll);

  const updating = useSelector(selectUsersActivityUpdating);

  const error = useSelector(selectUsersActivityError);

  const success = useSelector(selectUsersActivitySuccess);

  const page = useSelector(selectUsersActivityPage);

  const limit = useSelector(selectUsersActivityLimit);

  const total = useSelector(selectUsersActivityTotal);

  const totalPages = useSelector(selectUsersActivityTotalPages);

  /* =======================================================
     LOCAL FILTER STATE
     ======================================================= */

  const [search, setSearch] = useState("");

  const [action, setAction] = useState("");

  const [userId, setUserId] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const [showDetail, setShowDetail] = useState(false);

  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  /* =======================================================
     FETCH
     ======================================================= */

  const loadActivities = useCallback(
    (targetPage = 1) => {
      dispatch(
        fetchUserActivities({
          page: targetPage,
          limit,
          search: search.trim() || undefined,
          action: action || undefined,
          user_id: userId || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        }),
      );
    },
    [dispatch, limit, search, action, userId, startDate, endDate],
  );

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    loadActivities(1);
  }, []);

  /* =======================================================
     APPLY FILTER
     ======================================================= */

  const handleApplyFilter = () => {
    loadActivities(1);
  };

  /* =======================================================
     RESET FILTER
     ======================================================= */

  const handleResetFilter = () => {
    setSearch("");

    setAction("");

    setUserId("");

    setStartDate("");

    setEndDate("");

    dispatch(
      fetchUserActivities({
        page: 1,
        limit,
      }),
    );
  };

  /* =======================================================
     REFRESH
     ======================================================= */

  const handleRefresh = () => {
    loadActivities(page);
  };

  /* =======================================================
     DETAIL
     ======================================================= */

  const handleOpenDetail = async (activity: UserActivity) => {
    setShowDetail(true);

    await dispatch(fetchUserActivityById(activity.id));
  };

  const handleCloseDetail = () => {
    setShowDetail(false);

    dispatch(clearSelectedUserActivity());
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const handleDelete = async (activity: UserActivity) => {
    const confirmed = window.confirm(
      `Hapus activity #${activity.id}?\n\n` +
        `${activity.action} - ${activity.username || "System"}`,
    );

    if (!confirmed) {
      return;
    }

    const result = await dispatch(deleteUserActivity(activity.id));

    if (deleteUserActivity.fulfilled.match(result)) {
      loadActivities(page);
    }
  };

  /* =======================================================
     DELETE ALL
     ======================================================= */

  const handleDeleteAll = async () => {
    const result = await dispatch(deleteAllUserActivities());

    if (deleteAllUserActivities.fulfilled.match(result)) {
      setShowDeleteAllModal(false);

      loadActivities(1);
    }
  };

  /* =======================================================
     PAGINATION
     ======================================================= */

  const handlePreviousPage = () => {
    if (page <= 1 || loading) return;

    loadActivities(page - 1);
  };

  const handleNextPage = () => {
    if (page >= totalPages || loading) return;

    loadActivities(page + 1);
  };

  /* =======================================================
     SUMMARY
     ======================================================= */

  const firstItem = total === 0 ? 0 : (page - 1) * limit + 1;

  const lastItem = total === 0 ? 0 : Math.min(page * limit, total);

  const hasFilters = useMemo(() => {
    return Boolean(search.trim() || action || userId || startDate || endDate);
  }, [search, action, userId, startDate, endDate]);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="users-activity-page">
      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="users-activity-header">
        <div>
          <div className="users-activity-title-row">
            <div className="users-activity-title-icon">
              <FileText size={22} />
            </div>

            <div>
              <h1>User Activity</h1>

              <p>Audit log aktivitas pengguna dan sistem ABN Fleet</p>
            </div>
          </div>
        </div>

        <div className="users-activity-header-actions">
          <button
            type="button"
            className="activity-btn activity-btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "activity-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            className="activity-btn activity-btn-danger"
            onClick={() => setShowDeleteAllModal(true)}
            disabled={deletingAll || total === 0}
          >
            {deletingAll ? (
              <Loader2 size={16} className="activity-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Hapus Semua
          </button>
        </div>
      </div>

      {/* ===================================================
          ALERT ERROR
          =================================================== */}

      {error && (
        <div className="activity-alert activity-alert-error">
          <AlertTriangle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => dispatch(clearUsersActivityError())}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ===================================================
          ALERT SUCCESS
          =================================================== */}

      {success && (
        <div className="activity-alert activity-alert-success">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => dispatch(clearUsersActivitySuccess())}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ===================================================
          FILTER CARD
          =================================================== */}

      <div className="users-activity-toolbar">
        <div className="activity-search-wrapper">
          <Search size={17} />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleApplyFilter();
              }
            }}
            placeholder="Cari username, description, path..."
          />

          {search && (
            <button
              type="button"
              className="activity-input-clear"
              onClick={() => setSearch("")}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          type="button"
          className={`activity-btn activity-filter-button ${
            showFilters || hasFilters ? "activity-filter-active" : ""
          }`}
          onClick={() => setShowFilters((value) => !value)}
        >
          <Filter size={16} />
          Filter
          {hasFilters && <span className="activity-filter-dot" />}
        </button>
      </div>

      {showFilters && (
        <div className="users-activity-filter-panel">
          <div className="activity-filter-grid">
            {/* ACTION */}

            <div className="activity-field">
              <label htmlFor="activity-action">Action</label>

              <select
                id="activity-action"
                value={action}
                onChange={(event) => setAction(event.target.value)}
              >
                <option value="">Semua Action</option>

                {ACTION_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* USER */}

            <div className="activity-field">
              <label htmlFor="activity-user-id">User ID</label>

              <div className="activity-input-with-icon">
                <User size={16} />

                <input
                  id="activity-user-id"
                  type="number"
                  min="1"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  placeholder="Contoh: 1"
                />
              </div>
            </div>

            {/* START DATE */}

            <div className="activity-field">
              <label htmlFor="activity-start-date">Dari Tanggal</label>

              <div className="activity-input-with-icon">
                <Calendar size={16} />

                <input
                  id="activity-start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
            </div>

            {/* END DATE */}

            <div className="activity-field">
              <label htmlFor="activity-end-date">Sampai Tanggal</label>

              <div className="activity-input-with-icon">
                <Calendar size={16} />

                <input
                  id="activity-end-date"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="activity-filter-actions">
            <button
              type="button"
              className="activity-btn activity-btn-secondary"
              onClick={handleResetFilter}
            >
              Reset
            </button>

            <button
              type="button"
              className="activity-btn activity-btn-primary"
              onClick={handleApplyFilter}
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={16} className="activity-spin" />
              ) : (
                <Search size={16} />
              )}
              Terapkan Filter
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          TABLE CARD
          =================================================== */}

      <div className="users-activity-card">
        <div className="users-activity-card-header">
          <div>
            <h2>Activity Log</h2>

            <span>{total.toLocaleString("id-ID")} aktivitas</span>
          </div>

          <div className="activity-live-indicator">
            <span />
            Audit Monitoring
          </div>
        </div>

        <div className="users-activity-table-wrapper">
          <table className="users-activity-table">
            <thead>
              <tr>
                <th>ID</th>

                <th>WAKTU</th>

                <th>USER</th>

                <th>ACTION</th>

                <th>DESCRIPTION</th>

                <th>REQUEST</th>

                <th>IP ADDRESS</th>

                <th>AKSI</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="activity-table-loading">
                    <Loader2 size={28} className="activity-spin" />

                    <span>Memuat activity...</span>
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={8} className="activity-table-empty">
                    <FileText size={38} />

                    <strong>Tidak ada activity</strong>

                    <span>Belum ada audit log yang sesuai filter.</span>
                  </td>
                </tr>
              ) : (
                activities.map((activity) => (
                  <tr key={activity.id}>
                    {/* ID */}

                    <td>
                      <span className="activity-id">#{activity.id}</span>
                    </td>

                    {/* TIME */}

                    <td>
                      <div className="activity-time">
                        <span>{formatShortDate(activity.created_at)}</span>

                        <small>
                          <Clock3 size={12} />

                          {formatDateTime(activity.created_at)
                            .split(", ")
                            .pop()}
                        </small>
                      </div>
                    </td>

                    {/* USER */}

                    <td>
                      <div className="activity-user-cell">
                        <div className="activity-user-avatar">
                          <User size={15} />
                        </div>

                        <div>
                          <strong>
                            {activity.username ||
                              activity.user?.username ||
                              "System"}
                          </strong>

                          {activity.user?.role && (
                            <small>{activity.user.role}</small>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ACTION */}

                    <td>
                      <span className={getActionClass(activity.action)}>
                        {activity.action}
                      </span>
                    </td>

                    {/* DESCRIPTION */}

                    <td>
                      <div className="activity-description">
                        {activity.description || "Tidak ada deskripsi"}
                      </div>
                    </td>

                    {/* REQUEST */}

                    <td>
                      <div className="activity-request">
                        {activity.request_method && (
                          <span
                            className={getMethodClass(activity.request_method)}
                          >
                            {activity.request_method}
                          </span>
                        )}

                        <code>{activity.request_path || "-"}</code>
                      </div>
                    </td>

                    {/* IP */}

                    <td>
                      <div className="activity-ip">
                        <Globe size={14} />

                        {activity.ip_address || "-"}
                      </div>
                    </td>

                    {/* ACTION */}

                    <td>
                      <div className="activity-row-actions">
                        <button
                          type="button"
                          className="activity-icon-btn activity-icon-view"
                          title="Lihat detail"
                          onClick={() => handleOpenDetail(activity)}
                          disabled={loadingDetail || deleting || updating}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="activity-icon-btn activity-icon-delete"
                          title="Hapus activity"
                          onClick={() => handleDelete(activity)}
                          disabled={deleting}
                        >
                          {deleting ? (
                            <Loader2 size={16} className="activity-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
            PAGINATION
            ================================================= */}

        <div className="users-activity-pagination">
          <div className="activity-pagination-info">
            Menampilkan <strong>{firstItem}</strong>
            {" - "}
            <strong>{lastItem}</strong>
            {" dari "}
            <strong>{total}</strong>
            {" activity"}
          </div>

          <div className="activity-pagination-controls">
            <button
              type="button"
              className="activity-pagination-btn"
              onClick={handlePreviousPage}
              disabled={loading || page <= 1 || totalPages <= 1}
            >
              <ChevronLeft size={17} />
            </button>

            <span className="activity-page-number">
              Page <strong>{page}</strong> / <strong>{totalPages || 1}</strong>
            </span>

            <button
              type="button"
              className="activity-pagination-btn"
              onClick={handleNextPage}
              disabled={loading || page >= totalPages || totalPages <= 1}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          DETAIL MODAL
          =================================================== */}

      {showDetail && (
        <div
          className="activity-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseDetail();
            }
          }}
        >
          <div className="activity-detail-modal">
            <div className="activity-modal-header">
              <div>
                <div className="activity-modal-title">
                  <FileText size={19} />

                  <h2>Activity Detail</h2>
                </div>

                {selectedActivity && (
                  <span>Activity #{selectedActivity.id}</span>
                )}
              </div>

              <button
                type="button"
                className="activity-modal-close"
                onClick={handleCloseDetail}
              >
                <X size={18} />
              </button>
            </div>

            <div className="activity-modal-body">
              {loadingDetail ? (
                <div className="activity-detail-loading">
                  <Loader2 size={30} className="activity-spin" />

                  <span>Memuat detail activity...</span>
                </div>
              ) : selectedActivity ? (
                <>
                  <div className="activity-detail-top">
                    <span className={getActionClass(selectedActivity.action)}>
                      {selectedActivity.action}
                    </span>

                    <span className="activity-detail-time">
                      <Clock3 size={14} />

                      {formatDateTime(selectedActivity.created_at)}
                    </span>
                  </div>

                  <div className="activity-detail-grid">
                    <div className="activity-detail-item">
                      <label>User</label>

                      <strong>
                        {selectedActivity.username ||
                          selectedActivity.user?.username ||
                          "System"}
                      </strong>
                    </div>

                    <div className="activity-detail-item">
                      <label>User ID</label>

                      <strong>{selectedActivity.user_id ?? "-"}</strong>
                    </div>

                    <div className="activity-detail-item">
                      <label>Role</label>

                      <strong>{selectedActivity.user?.role || "-"}</strong>
                    </div>

                    <div className="activity-detail-item">
                      <label>IP Address</label>

                      <strong>{selectedActivity.ip_address || "-"}</strong>
                    </div>

                    <div className="activity-detail-item">
                      <label>HTTP Method</label>

                      <strong>{selectedActivity.request_method || "-"}</strong>
                    </div>

                    <div className="activity-detail-item">
                      <label>Request Path</label>

                      <strong>{selectedActivity.request_path || "-"}</strong>
                    </div>
                  </div>

                  <div className="activity-detail-section">
                    <label>Description</label>

                    <div className="activity-detail-description">
                      {selectedActivity.description || "Tidak ada deskripsi."}
                    </div>
                  </div>

                  <div className="activity-detail-section">
                    <label>User Agent</label>

                    <div className="activity-detail-code">
                      {selectedActivity.user_agent || "-"}
                    </div>
                  </div>

                  <div className="activity-detail-section">
                    <label>Metadata</label>

                    <pre className="activity-metadata">
                      {selectedActivity.metadata
                        ? JSON.stringify(selectedActivity.metadata, null, 2)
                        : "{}"}
                    </pre>
                  </div>

                  <div className="activity-detail-section">
                    <label>Created At</label>

                    <div className="activity-detail-code">
                      {selectedActivity.created_at}
                    </div>
                  </div>

                  <div className="activity-detail-section">
                    <label>Updated At</label>

                    <div className="activity-detail-code">
                      {selectedActivity.updated_at}
                    </div>
                  </div>
                </>
              ) : (
                <div className="activity-detail-empty">
                  Detail activity tidak tersedia.
                </div>
              )}
            </div>

            <div className="activity-modal-footer">
              <button
                type="button"
                className="activity-btn activity-btn-secondary"
                onClick={handleCloseDetail}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          DELETE ALL MODAL
          =================================================== */}

      {showDeleteAllModal && (
        <div
          className="activity-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowDeleteAllModal(false);
            }
          }}
        >
          <div className="activity-confirm-modal">
            <div className="activity-confirm-icon">
              <AlertTriangle size={27} />
            </div>

            <h2>Hapus Semua Activity?</h2>

            <p>
              Tindakan ini akan menghapus seluruh audit log User Activity
              sebanyak <strong>{total.toLocaleString("id-ID")}</strong> record.
            </p>

            <div className="activity-confirm-warning">
              <AlertTriangle size={15} />

              <span>Tindakan ini tidak dapat dibatalkan.</span>
            </div>

            <div className="activity-confirm-actions">
              <button
                type="button"
                className="activity-btn activity-btn-secondary"
                onClick={() => setShowDeleteAllModal(false)}
                disabled={deletingAll}
              >
                Batal
              </button>

              <button
                type="button"
                className="activity-btn activity-btn-danger"
                onClick={handleDeleteAll}
                disabled={deletingAll}
              >
                {deletingAll ? (
                  <>
                    <Loader2 size={16} className="activity-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Ya, Hapus Semua
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersActivity;
