import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  Cpu,
  Info,
  MapPinned,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Truck,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../stores/store";

import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  selectNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
  selectNotificationsActionLoading,
  selectNotificationsError,
  type Notification as NotificationItem,
  type NotificationSeverity,
} from "../../features/notifications/notificationsSlice";

import "./Notification.css";

/* =========================================================
   ABN FLEET
   NOTIFICATION PAGE
   ========================================================= */

type FilterType = "ALL" | "UNREAD" | "WARNING" | "CRITICAL";

const PAGE_LIMIT = 20;

/* =========================================================
   HELPERS
   ========================================================= */

function getNotificationIcon(notification: NotificationItem) {
  const type = notification.type?.toUpperCase() || "";

  if (type.includes("VEHICLE")) {
    return <Truck size={19} />;
  }

  if (type.includes("DEVICE") || type.includes("GPS")) {
    return <Cpu size={19} />;
  }

  if (type.includes("DRIVER")) {
    return <UserRound size={19} />;
  }

  if (type.includes("GEOFENCE")) {
    return <MapPinned size={19} />;
  }

  if (type.includes("TRIP") || type.includes("ROUTE")) {
    return <Activity size={19} />;
  }

  if (type.includes("SECURITY")) {
    return <ShieldAlert size={19} />;
  }

  switch (notification.severity) {
    case "CRITICAL":
      return <CircleAlert size={19} />;

    case "WARNING":
      return <AlertTriangle size={19} />;

    case "SUCCESS":
      return <CheckCircle2 size={19} />;

    default:
      return <Info size={19} />;
  }
}

/* =========================================================
   SEVERITY LABEL
   ========================================================= */

function getSeverityLabel(severity: NotificationSeverity) {
  switch (severity) {
    case "CRITICAL":
      return "Critical";

    case "WARNING":
      return "Warning";

    case "SUCCESS":
      return "Success";

    default:
      return "Info";
  }
}

/* =========================================================
   TIME FORMAT
   ========================================================= */

function formatNotificationTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const now = Date.now();

  const diff = now - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) {
    return "Baru saja";
  }

  if (minutes < 60) {
    return `${minutes} menit lalu`;
  }

  if (hours < 24) {
    return `${hours} jam lalu`;
  }

  if (days < 7) {
    return `${days} hari lalu`;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   COMPONENT
   ========================================================= */

function Notification() {
  const dispatch = useDispatch<AppDispatch>();

  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationsLoading);
  const actionLoading = useSelector(selectNotificationsActionLoading);
  const error = useSelector(selectNotificationsError);

  const [filter, setFilter] = useState<FilterType>("ALL");

  const [showFilter, setShowFilter] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<NotificationItem | null>(
    null,
  );

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    dispatch(
      fetchNotifications({
        limit: PAGE_LIMIT,
        offset: 0,
      }),
    );

    dispatch(fetchUnreadCount());
  }, [dispatch]);

  /* =======================================================
     FILTERED DATA
     ======================================================= */

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case "UNREAD":
        return notifications.filter((notification) => !notification.is_read);

      case "WARNING":
        return notifications.filter(
          (notification) => notification.severity === "WARNING",
        );

      case "CRITICAL":
        return notifications.filter(
          (notification) => notification.severity === "CRITICAL",
        );

      default:
        return notifications;
    }
  }, [notifications, filter]);

  /* =======================================================
     FILTER LABEL
     ======================================================= */

  const filterLabel = useMemo(() => {
    switch (filter) {
      case "UNREAD":
        return "Unread";

      case "WARNING":
        return "Warning";

      case "CRITICAL":
        return "Critical";

      default:
        return "All Notifications";
    }
  }, [filter]);

  /* =======================================================
     REFRESH
     ======================================================= */

  const handleRefresh = () => {
    dispatch(
      fetchNotifications({
        limit: PAGE_LIMIT,
        offset: 0,
      }),
    );

    dispatch(fetchUnreadCount());
  };

  /* =======================================================
     MARK READ
     ======================================================= */

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.is_read) {
      dispatch(markNotificationAsRead(notification.id));
    }

    /*
     * Future:
     * Navigate to entity detail page.
     *
     * Example:
     *
     * VEHICLE -> /vehicles/:id
     * DEVICE  -> /devices/:id
     * DRIVER  -> /drivers/:id
     * TRIP    -> /trips/:id
     */
  };

  /* =======================================================
     MARK ALL
     ======================================================= */

  const handleMarkAllRead = () => {
    if (unreadCount === 0 || actionLoading) {
      return;
    }

    dispatch(markAllNotificationsAsRead());
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const handleDelete = () => {
    if (!confirmDelete || actionLoading) {
      return;
    }

    dispatch(deleteNotification(confirmDelete.id));

    setConfirmDelete(null);
  };

  /* =======================================================
     LOAD MORE
     ======================================================= */

  const handleLoadMore = () => {
    const currentCount = notifications.length;

    dispatch(
      fetchNotifications({
        limit: PAGE_LIMIT,
        offset: currentCount,
      }),
    );
  };

  const hasMore = useSelector(
    (state: RootState) => state.notifications.pagination.hasMore,
  );

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="notification-page">
      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <section className="notification-header">
        <div className="notification-header-left">
          <div className="notification-page-icon">
            <Bell size={22} strokeWidth={2} />
          </div>

          <div>
            <span className="notification-eyebrow">ABN FLEET SYSTEM</span>

            <h1>Notifications</h1>

            <p>
              Monitor informasi, aktivitas, dan kejadian penting pada armada
              Anda.
            </p>
          </div>
        </div>

        <div className="notification-header-actions">
          <button
            type="button"
            className="notification-refresh-button"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh notifications"
          >
            <RefreshCw
              size={17}
              className={loading ? "notification-spin" : ""}
            />

            <span>Refresh</span>
          </button>
        </div>
      </section>

      {/* =====================================================
          SUMMARY
          ===================================================== */}

      <section className="notification-summary">
        <div className="notification-summary-card">
          <div className="notification-summary-icon">
            <Bell size={18} />
          </div>

          <div>
            <span>Total Notifications</span>

            <strong>{notifications.length}</strong>
          </div>
        </div>

        <div className="notification-summary-card unread">
          <div className="notification-summary-icon">
            <Zap size={18} />
          </div>

          <div>
            <span>Unread</span>

            <strong>{unreadCount}</strong>
          </div>
        </div>

        <div className="notification-summary-card critical">
          <div className="notification-summary-icon">
            <CircleAlert size={18} />
          </div>

          <div>
            <span>Critical</span>

            <strong>
              {
                notifications.filter((item) => item.severity === "CRITICAL")
                  .length
              }
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          TOOLBAR
          ===================================================== */}

      <section className="notification-toolbar">
        <div className="notification-toolbar-left">
          <div className="notification-filter">
            <button
              type="button"
              className="notification-filter-button"
              onClick={() => setShowFilter((value) => !value)}
            >
              <span>{filterLabel}</span>

              <ChevronDown size={16} />
            </button>

            {showFilter && (
              <div className="notification-filter-menu">
                <button
                  type="button"
                  className={filter === "ALL" ? "active" : ""}
                  onClick={() => {
                    setFilter("ALL");
                    setShowFilter(false);
                  }}
                >
                  All Notifications
                </button>

                <button
                  type="button"
                  className={filter === "UNREAD" ? "active" : ""}
                  onClick={() => {
                    setFilter("UNREAD");
                    setShowFilter(false);
                  }}
                >
                  Unread
                  {unreadCount > 0 && <span>{unreadCount}</span>}
                </button>

                <button
                  type="button"
                  className={filter === "WARNING" ? "active" : ""}
                  onClick={() => {
                    setFilter("WARNING");
                    setShowFilter(false);
                  }}
                >
                  Warning
                </button>

                <button
                  type="button"
                  className={filter === "CRITICAL" ? "active" : ""}
                  onClick={() => {
                    setFilter("CRITICAL");
                    setShowFilter(false);
                  }}
                >
                  Critical
                </button>
              </div>
            )}
          </div>

          <span className="notification-result-count">
            {filteredNotifications.length} notification
            {filteredNotifications.length !== 1 ? "s" : ""}
          </span>
        </div>

        <button
          type="button"
          className="notification-mark-all"
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0 || actionLoading}
        >
          <CheckCircle2 size={16} />

          {actionLoading ? "Processing..." : "Mark all as read"}
        </button>
      </section>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="notification-error">
          <AlertTriangle size={17} />

          <span>{error}</span>

          <button type="button" onClick={handleRefresh}>
            Retry
          </button>
        </div>
      )}

      {/* =====================================================
          LIST
          ===================================================== */}

      <section className="notification-list">
        {loading && notifications.length === 0 ? (
          <>
            <NotificationSkeleton />
            <NotificationSkeleton />
            <NotificationSkeleton />
          </>
        ) : filteredNotifications.length === 0 ? (
          <div className="notification-empty">
            <div className="notification-empty-icon">
              <Bell size={28} />
            </div>

            <h3>
              {filter === "UNREAD"
                ? "Tidak ada notification yang belum dibaca"
                : "Tidak ada notification"}
            </h3>

            <p>
              Semua aktivitas penting dari ABN Fleet akan ditampilkan di halaman
              ini.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <article
              key={notification.id}
              className={`notification-item ${
                notification.is_read
                  ? "notification-item-read"
                  : "notification-item-unread"
              } notification-severity-${notification.severity.toLowerCase()}`}
              onClick={() => handleNotificationClick(notification)}
            >
              {/* =================================================
                  ICON
                  ================================================= */}

              <div className="notification-item-icon">
                {getNotificationIcon(notification)}
              </div>

              {/* =================================================
                  CONTENT
                  ================================================= */}

              <div className="notification-item-content">
                <div className="notification-item-top">
                  <div className="notification-item-title">
                    <h3>{notification.title}</h3>

                    {!notification.is_read && (
                      <span className="notification-unread-dot" />
                    )}
                  </div>

                  <span
                    className={`notification-severity notification-severity-${notification.severity.toLowerCase()}`}
                  >
                    {getSeverityLabel(notification.severity)}
                  </span>
                </div>

                <p>{notification.message}</p>

                <div className="notification-item-meta">
                  <span>
                    <Clock3 size={13} />

                    {formatNotificationTime(notification.created_at)}
                  </span>

                  {notification.entity_type && (
                    <span>
                      <span className="notification-meta-divider">•</span>

                      {notification.entity_type}

                      {notification.entity_id
                        ? ` #${notification.entity_id}`
                        : ""}
                    </span>
                  )}

                  {notification.type && (
                    <span className="notification-type">
                      {notification.type}
                    </span>
                  )}
                </div>
              </div>

              {/* =================================================
                  ACTIONS
                  ================================================= */}

              <div className="notification-item-actions">
                {!notification.is_read && (
                  <button
                    type="button"
                    className="notification-action-read"
                    title="Mark as read"
                    onClick={(event) => {
                      event.stopPropagation();

                      dispatch(markNotificationAsRead(notification.id));
                    }}
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}

                <button
                  type="button"
                  className="notification-action-delete"
                  title="Delete notification"
                  onClick={(event) => {
                    event.stopPropagation();

                    setConfirmDelete(notification);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {/* =====================================================
          LOAD MORE
          ===================================================== */}

      {!loading && filteredNotifications.length > 0 && hasMore && (
        <div className="notification-load-more">
          <button type="button" onClick={handleLoadMore} disabled={loading}>
            <RefreshCw size={16} />
            Load more notifications
          </button>
        </div>
      )}

      {/* =====================================================
          DELETE CONFIRMATION
          ===================================================== */}

      {confirmDelete && (
        <div
          className="notification-confirm-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setConfirmDelete(null);
            }
          }}
        >
          <div className="notification-confirm">
            <div className="notification-confirm-icon">
              <Trash2 size={21} />
            </div>

            <div className="notification-confirm-content">
              <h3>Hapus notification?</h3>

              <p>
                Notification ini akan dihapus dari daftar Anda. Tindakan ini
                tidak dapat dibatalkan.
              </p>
            </div>

            <div className="notification-confirm-actions">
              <button
                type="button"
                className="notification-confirm-cancel"
                onClick={() => setConfirmDelete(null)}
              >
                Batal
              </button>

              <button
                type="button"
                className="notification-confirm-delete"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? "Menghapus..." : "Hapus"}
              </button>
            </div>

            <button
              type="button"
              className="notification-confirm-close"
              onClick={() => setConfirmDelete(null)}
              aria-label="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   SKELETON
   ========================================================= */

function NotificationSkeleton() {
  return (
    <div className="notification-skeleton">
      <div className="notification-skeleton-icon" />

      <div className="notification-skeleton-content">
        <div className="notification-skeleton-line title" />

        <div className="notification-skeleton-line" />

        <div className="notification-skeleton-line short" />
      </div>
    </div>
  );
}

export default Notification;
