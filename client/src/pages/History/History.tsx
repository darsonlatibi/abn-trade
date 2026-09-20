/* =========================================================
   ABN FLEET
   HISTORY PAGE
   ========================================================= */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Activity,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  Eye,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  Server,
  Trash2,
  Truck,
  User,
  //   Users,
  X,
} from "lucide-react";

import type { AppDispatch } from "../../stores/store";

import {
  deleteAllHistories,
  deleteHistory,
  fetchHistories,
  fetchHistoryById,
  fetchHistorySummary,
  resetHistoryFilters,
  selectHistories,
  selectHistoryActionError,
  selectHistoryActionLoading,
  selectHistoryError,
  selectHistoryFilters,
  selectHistoryLoading,
  selectHistoryPagination,
  selectHistorySummary,
  selectHistorySummaryLoading,
  selectSelectedHistory,
  setHistoryFilter,
  setHistoryLimit,
  setHistoryPage,
  setSelectedHistory,
  type ActivityHistory,
  type ActivityHistoryType,
} from "../../features/history/historySlice";

import "./History.css";

/* =========================================================
   TYPES
   ========================================================= */

type HistoryFilterKey =
  | "search"
  | "type"
  | "vehicle_id"
  | "driver_id"
  | "device_id"
  | "user_id"
  | "date_from"
  | "date_to";

/* =========================================================
   TYPE CONFIG
   ========================================================= */

const HISTORY_TYPES: ActivityHistoryType[] = [
  "GPS",
  "TRIP",
  "ALERT",
  "STATUS",
  "DRIVER",
  "DEVICE",
  "SYSTEM",
];

/* =========================================================
   HELPERS
   ========================================================= */

const formatDateTime = (value: string) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCoordinate = (
  value: string | number | null | undefined,
): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return Number(value).toFixed(6);
};

const getTypeClass = (type: ActivityHistoryType) => {
  return `history-type history-type-${type.toLowerCase()}`;
};

const getTypeIcon = (type: ActivityHistoryType) => {
  switch (type) {
    case "GPS":
      return <MapPin size={15} />;

    case "TRIP":
      return <Truck size={15} />;

    case "ALERT":
      return <AlertTriangle size={15} />;

    case "STATUS":
      return <Activity size={15} />;

    case "DRIVER":
      return <User size={15} />;

    case "DEVICE":
      return <Database size={15} />;

    case "SYSTEM":
      return <Server size={15} />;

    default:
      return <Activity size={15} />;
  }
};

/* =========================================================
   SUMMARY CARD
   ========================================================= */

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  type?: string;
}

const SummaryCard = ({ label, value, icon, type = "" }: SummaryCardProps) => {
  return (
    <div className={`history-summary-card ${type}`}>
      <div className="history-summary-icon">{icon}</div>

      <div className="history-summary-content">
        <span>{label}</span>
        <strong>{value.toLocaleString("id-ID")}</strong>
      </div>
    </div>
  );
};

/* =========================================================
   PAGE
   ========================================================= */

const History = () => {
  const dispatch = useDispatch<AppDispatch>();

  const histories = useSelector(selectHistories);
  const selectedHistory = useSelector(selectSelectedHistory);

  const summary = useSelector(selectHistorySummary);
  const pagination = useSelector(selectHistoryPagination);
  const filters = useSelector(selectHistoryFilters);

  const loading = useSelector(selectHistoryLoading);
  const summaryLoading = useSelector(selectHistorySummaryLoading);
  const actionLoading = useSelector(selectHistoryActionLoading);

  const error = useSelector(selectHistoryError);
  const actionError = useSelector(selectHistoryActionError);

  const [showFilters, setShowFilters] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [searchInput, setSearchInput] = useState(filters.search);

  /* =======================================================
     LOAD DATA
     ======================================================= */

  const loadHistory = useCallback(() => {
    dispatch(fetchHistories(filters));
    dispatch(fetchHistorySummary(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  /* =======================================================
     SEARCH
     ======================================================= */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput !== filters.search) {
        dispatch(
          setHistoryFilter({
            key: "search",
            value: searchInput,
          }),
        );

        dispatch(setHistoryPage(1));
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput, filters.search, dispatch]);

  /* =======================================================
     FILTER HANDLER
     ======================================================= */

  const handleFilter = (key: HistoryFilterKey, value: string) => {
    dispatch(
      setHistoryFilter({
        key,
        value,
      }),
    );

    dispatch(setHistoryPage(1));
  };

  /* =======================================================
     RESET FILTER
     ======================================================= */

  const handleResetFilters = () => {
    setSearchInput("");

    dispatch(resetHistoryFilters());
  };

  /* =======================================================
     PAGE
     ======================================================= */

  const currentPage = pagination.page || 1;

  const totalPages = pagination.totalPages || 0;

  const hasPrevious = currentPage > 1;

  const hasNext = totalPages > 0 && currentPage < totalPages;

  /* =======================================================
     PAGINATION RANGE
     ======================================================= */

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) {
      return [];
    }

    const pages: number[] = [];

    const start = Math.max(1, currentPage - 2);

    const end = Math.min(totalPages, currentPage + 2);

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  /* =======================================================
     DETAIL
     ======================================================= */

  const handleOpenDetail = async (history: ActivityHistory) => {
    setShowDetail(true);

    dispatch(setSelectedHistory(history));

    await dispatch(fetchHistoryById(history.id));
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    dispatch(setSelectedHistory(null));
  };

  /* =======================================================
     DELETE ONE
     ======================================================= */

  const handleDelete = async (history: ActivityHistory) => {
    const confirmed = window.confirm(`Delete history "${history.title}"?`);

    if (!confirmed) {
      return;
    }

    await dispatch(deleteHistory(history.id));

    if (selectedHistory?.id === history.id) {
      setShowDetail(false);
    }
  };

  /* =======================================================
     DELETE FILTERED
     ======================================================= */

  const handleDeleteAll = async () => {
    const hasFilter =
      Boolean(filters.search) ||
      Boolean(filters.type) ||
      Boolean(filters.vehicle_id) ||
      Boolean(filters.driver_id) ||
      Boolean(filters.device_id) ||
      Boolean(filters.user_id) ||
      Boolean(filters.date_from) ||
      Boolean(filters.date_to);

    const message = hasFilter
      ? "Delete ALL history records matching the current filters?"
      : "Delete ALL activity history records?";

    const confirmed = window.confirm(message);

    if (!confirmed) {
      return;
    }

    await dispatch(deleteAllHistories(filters));

    setShowDetail(false);
  };

  /* =======================================================
     REFRESH
     ======================================================= */

  const handleRefresh = () => {
    loadHistory();
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="history-page">
      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="history-header">
        <div className="history-header-left">
          <div className="history-header-icon">
            <Clock size={22} />
          </div>

          <div>
            <h1>Activity History</h1>

            <p>Monitor and review all ABN Fleet activities</p>
          </div>
        </div>

        <div className="history-header-actions">
          <button
            type="button"
            className="history-btn history-btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "history-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            className="history-btn history-btn-danger"
            onClick={handleDeleteAll}
            disabled={actionLoading || histories.length === 0}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* ===================================================
          ERROR
          =================================================== */}

      {(error || actionError) && (
        <div className="history-error">
          <AlertTriangle size={17} />

          <span>{error || actionError}</span>
        </div>
      )}

      {/* ===================================================
          SUMMARY
          =================================================== */}

      <div className="history-summary-grid">
        <SummaryCard
          label="Total"
          value={summary?.total ?? 0}
          icon={<Activity size={20} />}
          type="summary-total"
        />

        <SummaryCard
          label="GPS"
          value={summary?.type.GPS ?? 0}
          icon={<MapPin size={20} />}
          type="summary-gps"
        />

        <SummaryCard
          label="Trip"
          value={summary?.type.TRIP ?? 0}
          icon={<Truck size={20} />}
          type="summary-trip"
        />

        <SummaryCard
          label="Alert"
          value={summary?.type.ALERT ?? 0}
          icon={<AlertTriangle size={20} />}
          type="summary-alert"
        />

        <SummaryCard
          label="Status"
          value={summary?.type.STATUS ?? 0}
          icon={<Activity size={20} />}
          type="summary-status"
        />

        <SummaryCard
          label="Driver"
          value={summary?.type.DRIVER ?? 0}
          icon={<User size={20} />}
          type="summary-driver"
        />

        <SummaryCard
          label="Device"
          value={summary?.type.DEVICE ?? 0}
          icon={<Database size={20} />}
          type="summary-device"
        />

        <SummaryCard
          label="System"
          value={summary?.type.SYSTEM ?? 0}
          icon={<Server size={20} />}
          type="summary-system"
        />
      </div>

      {/* ===================================================
          FILTER BAR
          =================================================== */}

      <div className="history-toolbar">
        <div className="history-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search activity, vehicle, driver..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />

          {searchInput && (
            <button
              type="button"
              className="history-search-clear"
              onClick={() => setSearchInput("")}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          type="button"
          className={`history-filter-btn ${showFilters ? "active" : ""}`}
          onClick={() => setShowFilters((value) => !value)}
        >
          <Filter size={16} />
          Filters
        </button>

        <select
          className="history-limit"
          value={filters.limit}
          onChange={(event) =>
            dispatch(setHistoryLimit(Number(event.target.value)))
          }
        >
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>

      {/* ===================================================
          ADVANCED FILTERS
          =================================================== */}

      {showFilters && (
        <div className="history-filter-panel">
          <div className="history-filter-field">
            <label>Activity Type</label>

            <select
              value={filters.type}
              onChange={(event) => handleFilter("type", event.target.value)}
            >
              <option value="">All Types</option>

              {HISTORY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="history-filter-field">
            <label>Vehicle ID</label>

            <input
              type="text"
              placeholder="Vehicle ID"
              value={filters.vehicle_id}
              onChange={(event) =>
                handleFilter("vehicle_id", event.target.value)
              }
            />
          </div>

          <div className="history-filter-field">
            <label>Driver ID</label>

            <input
              type="text"
              placeholder="Driver ID"
              value={filters.driver_id}
              onChange={(event) =>
                handleFilter("driver_id", event.target.value)
              }
            />
          </div>

          <div className="history-filter-field">
            <label>Device ID</label>

            <input
              type="text"
              placeholder="Device ID"
              value={filters.device_id}
              onChange={(event) =>
                handleFilter("device_id", event.target.value)
              }
            />
          </div>

          <div className="history-filter-field">
            <label>From</label>

            <div className="history-date-input">
              <Calendar size={15} />

              <input
                type="date"
                value={filters.date_from}
                onChange={(event) =>
                  handleFilter("date_from", event.target.value)
                }
              />
            </div>
          </div>

          <div className="history-filter-field">
            <label>To</label>

            <div className="history-date-input">
              <Calendar size={15} />

              <input
                type="date"
                value={filters.date_to}
                onChange={(event) =>
                  handleFilter("date_to", event.target.value)
                }
              />
            </div>
          </div>

          <button
            type="button"
            className="history-reset-btn"
            onClick={handleResetFilters}
          >
            Reset
          </button>
        </div>
      )}

      {/* ===================================================
          TABLE
          =================================================== */}

      <div className="history-card">
        <div className="history-card-header">
          <div>
            <h2>Activity Log</h2>

            <span>{pagination.total.toLocaleString("id-ID")} records</span>
          </div>

          {summaryLoading && (
            <div className="history-summary-loading">Updating summary...</div>
          )}
        </div>

        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>TYPE</th>
                <th>ACTIVITY</th>
                <th>VEHICLE</th>
                <th>DRIVER</th>
                <th>DEVICE</th>
                <th>LOCATION</th>
                <th>TIME</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="history-empty">
                    <div className="history-loading">
                      <RefreshCw size={22} className="history-spin" />
                      Loading activity history...
                    </div>
                  </td>
                </tr>
              ) : histories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="history-empty">
                    <div className="history-empty-content">
                      <Clock size={34} />

                      <strong>No activity history found</strong>

                      <span>Try changing your search or filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                histories.map((history) => (
                  <tr key={history.id}>
                    {/* TYPE */}

                    <td>
                      <span className={getTypeClass(history.type)}>
                        {getTypeIcon(history.type)}
                        {history.type}
                      </span>
                    </td>

                    {/* ACTIVITY */}

                    <td>
                      <div className="history-activity">
                        <strong>{history.title}</strong>

                        {history.message && <span>{history.message}</span>}
                      </div>
                    </td>

                    {/* VEHICLE */}

                    <td>
                      {history.vehicle ? (
                        <div className="history-entity">
                          <Truck size={15} />

                          <div>
                            <strong>{history.vehicle.vehicle_code}</strong>

                            {history.vehicle.plate_number && (
                              <span>{history.vehicle.plate_number}</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="history-muted">-</span>
                      )}
                    </td>

                    {/* DRIVER */}

                    <td>
                      {history.driver ? (
                        <div className="history-entity">
                          <User size={15} />

                          <span>{history.driver.name}</span>
                        </div>
                      ) : (
                        <span className="history-muted">-</span>
                      )}
                    </td>

                    {/* DEVICE */}

                    <td>
                      {history.device ? (
                        <div className="history-entity">
                          <Database size={15} />

                          <span>{history.device.device_code}</span>
                        </div>
                      ) : (
                        <span className="history-muted">-</span>
                      )}
                    </td>

                    {/* LOCATION */}

                    <td>
                      {history.latitude !== null &&
                      history.longitude !== null ? (
                        <div className="history-location">
                          <MapPin size={15} />

                          <span>
                            {formatCoordinate(history.latitude)}
                            <br />
                            {formatCoordinate(history.longitude)}
                          </span>
                        </div>
                      ) : (
                        <span className="history-muted">-</span>
                      )}
                    </td>

                    {/* TIME */}

                    <td>
                      <span className="history-time">
                        {formatDateTime(history.created_at)}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td>
                      <div className="history-row-actions">
                        <button
                          type="button"
                          className="history-icon-btn"
                          title="View detail"
                          onClick={() => handleOpenDetail(history)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="history-icon-btn danger"
                          title="Delete"
                          disabled={actionLoading}
                          onClick={() => handleDelete(history)}
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

        {/* =================================================
            PAGINATION
            ================================================= */}

        {pagination.total > 0 && (
          <div className="history-pagination">
            <span className="history-pagination-info">
              Showing <strong>{pagination.offset + 1}</strong> -{" "}
              <strong>
                {Math.min(
                  pagination.offset + pagination.limit,
                  pagination.total,
                )}
              </strong>{" "}
              of <strong>{pagination.total}</strong>
            </span>

            <div className="history-pagination-controls">
              <button
                type="button"
                disabled={!hasPrevious}
                onClick={() => dispatch(setHistoryPage(currentPage - 1))}
              >
                <ChevronLeft size={16} />
              </button>

              {pageNumbers.map((page) => (
                <button
                  type="button"
                  key={page}
                  className={page === currentPage ? "active" : ""}
                  onClick={() => dispatch(setHistoryPage(page))}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={!hasNext}
                onClick={() => dispatch(setHistoryPage(currentPage + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================
          DETAIL MODAL
          =================================================== */}

      {showDetail && selectedHistory && (
        <div
          className="history-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseDetail();
            }
          }}
        >
          <div className="history-modal">
            <div className="history-modal-header">
              <div>
                <span className="history-modal-label">ACTIVITY DETAIL</span>

                <h2>{selectedHistory.title}</h2>
              </div>

              <button
                type="button"
                className="history-modal-close"
                onClick={handleCloseDetail}
              >
                <X size={19} />
              </button>
            </div>

            <div className="history-modal-body">
              <div className="history-detail-type">
                <span className={getTypeClass(selectedHistory.type)}>
                  {getTypeIcon(selectedHistory.type)}

                  {selectedHistory.type}
                </span>

                <span>{formatDateTime(selectedHistory.created_at)}</span>
              </div>

              {selectedHistory.message && (
                <div className="history-detail-message">
                  {selectedHistory.message}
                </div>
              )}

              <div className="history-detail-grid">
                <div>
                  <label>Vehicle</label>

                  <strong>
                    {selectedHistory.vehicle
                      ? `${selectedHistory.vehicle.vehicle_code}${
                          selectedHistory.vehicle.plate_number
                            ? ` — ${selectedHistory.vehicle.plate_number}`
                            : ""
                        }`
                      : "-"}
                  </strong>
                </div>

                <div>
                  <label>Driver</label>

                  <strong>{selectedHistory.driver?.name || "-"}</strong>
                </div>

                <div>
                  <label>Device</label>

                  <strong>{selectedHistory.device?.device_code || "-"}</strong>
                </div>

                <div>
                  <label>User</label>

                  <strong>
                    {selectedHistory.user ? selectedHistory.user.name : "-"}
                  </strong>
                </div>

                <div>
                  <label>Latitude</label>

                  <strong>{formatCoordinate(selectedHistory.latitude)}</strong>
                </div>

                <div>
                  <label>Longitude</label>

                  <strong>{formatCoordinate(selectedHistory.longitude)}</strong>
                </div>
              </div>

              {selectedHistory.metadata && (
                <div className="history-metadata">
                  <div className="history-metadata-header">
                    <Database size={16} />
                    Metadata
                  </div>

                  <pre>{JSON.stringify(selectedHistory.metadata, null, 2)}</pre>
                </div>
              )}
            </div>

            <div className="history-modal-footer">
              <button
                type="button"
                className="history-btn history-btn-secondary"
                onClick={handleCloseDetail}
              >
                Close
              </button>

              <button
                type="button"
                className="history-btn history-btn-danger"
                disabled={actionLoading}
                onClick={() => handleDelete(selectedHistory)}
              >
                <Trash2 size={16} />
                Delete History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
