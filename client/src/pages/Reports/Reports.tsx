/* =========================================================
   ABN FLEET
   REPORTS PAGE
   ========================================================= */

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../stores/store";

import {
  clearReportErrors,
  createReport,
  deleteReport,
  fetchReportById,
  fetchReports,
  generateReport,
  resetReportFilters,
  setReportFilter,
  setReportPage,
  setSelectedReport,
  updateReport,
} from "../../features/report/reportSlice";

import type {
  Report,
  ReportStatus,
  ReportType,
} from "../../features/report/reportSlice";

import "./Reports.css";

/* =========================================================
   TYPES
   ========================================================= */

type ModalMode = "ADD" | "EDIT" | "VIEW" | null;

/* =========================================================
   CONSTANTS
   ========================================================= */

const REPORT_TYPES: {
  value: ReportType;
  label: string;
}[] = [
  {
    value: "FLEET_SUMMARY",
    label: "Fleet Summary",
  },
  {
    value: "VEHICLE_ACTIVITY",
    label: "Vehicle Activity",
  },
  {
    value: "TRIP_REPORT",
    label: "Trip Report",
  },
  {
    value: "DISTANCE_REPORT",
    label: "Distance Report",
  },
  {
    value: "SPEED_REPORT",
    label: "Speed Report",
  },
  {
    value: "ALERT_REPORT",
    label: "Alert Report",
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

const getReportTypeLabel = (type: ReportType) => {
  return (
    REPORT_TYPES.find((item) => item.value === type)?.label ||
    type.replaceAll("_", " ")
  );
};

const formatNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "0";
  }

  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(Number(value));
};

const formatDistance = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "0 km";
  }

  return `${formatNumber(value)} km`;
};

const formatSpeed = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "0 km/h";
  }

  return `${formatNumber(value)} km/h`;
};

const formatDate = (value: string | null | undefined, includeTime = false) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(date);
};

const formatDuration = (seconds: number | null | undefined) => {
  if (!seconds || seconds <= 0) {
    return "0m";
  }

  const totalMinutes = Math.floor(seconds / 60);

  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes}m`);
  }

  return parts.join(" ");
};

const getStatusLabel = (status: ReportStatus) => {
  switch (status) {
    case "GENERATING":
      return "Generating";

    case "COMPLETED":
      return "Completed";

    case "FAILED":
      return "Failed";

    default:
      return status;
  }
};

/* =========================================================
   EMPTY FORM
   ========================================================= */

const EMPTY_FORM = {
  name: "",
  type: "FLEET_SUMMARY" as ReportType,
  vehicle_id: "",
  date_from: "",
  date_to: "",
};

/* =========================================================
   COMPONENT
   ========================================================= */

export default function Reports() {
  const dispatch = useDispatch<AppDispatch>();

  /* =======================================================
     REDUX
     ======================================================= */

  const reports = useSelector((state: RootState) => state.report.reports);

  const selectedReport = useSelector(
    (state: RootState) => state.report.selectedReport,
  );

  const pagination = useSelector((state: RootState) => state.report.pagination);

  const filters = useSelector((state: RootState) => state.report.filters);

  const loading = useSelector((state: RootState) => state.report.loading);

  const detailLoading = useSelector(
    (state: RootState) => state.report.detailLoading,
  );

  const actionLoading = useSelector(
    (state: RootState) => state.report.actionLoading,
  );

  const error = useSelector((state: RootState) => state.report.error);

  const detailError = useSelector(
    (state: RootState) => state.report.detailError,
  );

  const actionError = useSelector(
    (state: RootState) => state.report.actionError,
  );

  /* =======================================================
     LOCAL STATE
     ======================================================= */

  const [modalMode, setModalMode] = useState<ModalMode>(null);

  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    ...EMPTY_FORM,
  });

  /* =======================================================
     LOAD REPORTS
     ======================================================= */

  useEffect(() => {
    dispatch(fetchReports(filters));

    return () => {
      dispatch(clearReportErrors());
      dispatch(setSelectedReport(null));
    };
  }, [dispatch]);

  /* =======================================================
     FILTER CHANGE
     ======================================================= */

  const handleFilterChange = (
    key: "search" | "type" | "status" | "vehicle_id" | "date_from" | "date_to",
    value: string,
  ) => {
    dispatch(
      setReportFilter({
        key,
        value,
      }),
    );
  };

  /* =======================================================
     FETCH AFTER FILTER
     ======================================================= */

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        dispatch(
          fetchReports({
            ...filters,
            page: filters.page,
          }),
        );
      },
      filters.search ? 350 : 0,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    dispatch,
    filters.page,
    filters.search,
    filters.type,
    filters.status,
    filters.vehicle_id,
    filters.date_from,
    filters.date_to,
  ]);

  /* =======================================================
     SUMMARY
     ======================================================= */

  const totalReports = pagination.total;

  const completedReports = useMemo(
    () => reports.filter((report) => report.status === "COMPLETED").length,
    [reports],
  );

  const generatingReports = useMemo(
    () => reports.filter((report) => report.status === "GENERATING").length,
    [reports],
  );

  const failedReports = useMemo(
    () => reports.filter((report) => report.status === "FAILED").length,
    [reports],
  );

  /* =======================================================
     OPEN ADD
     ======================================================= */

  const handleAdd = () => {
    dispatch(setSelectedReport(null));

    setFormError("");

    setForm({
      ...EMPTY_FORM,
    });

    setModalMode("ADD");
  };

  /* =======================================================
     OPEN VIEW
     ======================================================= */

  const handleView = async (report: Report) => {
    setFormError("");

    setModalMode("VIEW");

    dispatch(setSelectedReport(report));

    try {
      await dispatch(fetchReportById(report.id)).unwrap();
    } catch (err) {
      console.error("FETCH REPORT DETAIL ERROR:", err);
    }
  };

  /* =======================================================
     OPEN EDIT
     ======================================================= */

  const handleEdit = (report: Report) => {
    dispatch(setSelectedReport(report));

    setFormError("");

    setForm({
      name: report.name,
      type: report.type,
      vehicle_id:
        report.vehicle_id !== null && report.vehicle_id !== undefined
          ? String(report.vehicle_id)
          : "",
      date_from: report.date_from ? String(report.date_from).slice(0, 10) : "",
      date_to: report.date_to ? String(report.date_to).slice(0, 10) : "",
    });

    setModalMode("EDIT");
  };

  /* =======================================================
     CLOSE MODAL
     ======================================================= */

  const closeModal = () => {
    if (actionLoading) {
      return;
    }

    setModalMode(null);

    setFormError("");

    dispatch(setSelectedReport(null));
  };

  /* =======================================================
     FORM CHANGE
     ======================================================= */

  const handleFormChange = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     SUBMIT
     ======================================================= */

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (modalMode !== "ADD" && modalMode !== "EDIT") {
      return;
    }

    setFormError("");

    if (!form.name.trim()) {
      setFormError("Report name wajib diisi.");
      return;
    }

    if (!form.type) {
      setFormError("Report type wajib dipilih.");
      return;
    }

    if (!form.date_from) {
      setFormError("Tanggal mulai wajib diisi.");
      return;
    }

    if (!form.date_to) {
      setFormError("Tanggal akhir wajib diisi.");
      return;
    }

    if (form.date_from > form.date_to) {
      setFormError("Tanggal mulai tidak boleh lebih besar dari tanggal akhir.");
      return;
    }

    try {
      if (modalMode === "ADD") {
        await dispatch(
          createReport({
            name: form.name.trim(),
            type: form.type,
            vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : null,
            date_from: form.date_from,
            date_to: form.date_to,
          }),
        ).unwrap();
      }

      if (modalMode === "EDIT" && selectedReport) {
        await dispatch(
          updateReport({
            id: selectedReport.id,
            name: form.name.trim(),
            type: form.type,
            vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : null,
            date_from: form.date_from,
            date_to: form.date_to,
          }),
        ).unwrap();
      }

      setModalMode(null);

      setFormError("");

      dispatch(setSelectedReport(null));

      dispatch(fetchReports(filters));
    } catch (err: any) {
      console.error("REPORT SAVE ERROR:", err);

      setFormError(typeof err === "string" ? err : "Gagal menyimpan report.");
    }
  };

  /* =======================================================
     GENERATE
     ======================================================= */

  const handleGenerate = async (report: Report) => {
    const confirmed = window.confirm(
      `Generate report "${report.name}" sekarang?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await dispatch(generateReport(report.id)).unwrap();

      dispatch(fetchReports(filters));
    } catch (err) {
      console.error("GENERATE REPORT ERROR:", err);
    }
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const handleDelete = async (report: Report) => {
    const confirmed = window.confirm(`Hapus report "${report.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await dispatch(deleteReport(report.id)).unwrap();

      if (selectedReport?.id === report.id) {
        dispatch(setSelectedReport(null));
      }
    } catch (err) {
      console.error("DELETE REPORT ERROR:", err);
    }
  };

  /* =======================================================
     RESET FILTER
     ======================================================= */

  const handleResetFilters = () => {
    dispatch(resetReportFilters());
  };

  /* =======================================================
     PAGINATION
     ======================================================= */

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages || page === filters.page) {
      return;
    }

    dispatch(setReportPage(page));
  };

  /* =======================================================
     RENDER PAGINATION
     ======================================================= */

  const paginationPages = useMemo(() => {
    const pages: number[] = [];

    const current = pagination.page;
    const total = pagination.totalPages;

    if (total <= 7) {
      for (let i = 1; i <= total; i += 1) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (current > 4) {
      pages.push(-1);
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    if (current < total - 3) {
      pages.push(-1);
    }

    pages.push(total);

    return pages;
  }, [pagination.page, pagination.totalPages]);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="reports-page">
      {/* ===================================================
          HEADER
         =================================================== */}

      <div className="reports-header">
        <div>
          <div className="reports-eyebrow">ABN FLEET</div>

          <h1>Reports</h1>

          <p>Generate, monitor, and manage fleet operational reports.</p>
        </div>

        <button
          type="button"
          className="reports-add-button"
          onClick={handleAdd}
        >
          <span>+</span>
          Create Report
        </button>
      </div>

      {/* ===================================================
          ACTION ERROR
         =================================================== */}

      {actionError && (
        <div className="reports-alert reports-alert-error">
          <div>
            <strong>Report action failed</strong>
            <span>{actionError}</span>
          </div>

          <button type="button" onClick={() => dispatch(clearReportErrors())}>
            ×
          </button>
        </div>
      )}

      {/* ===================================================
          SUMMARY
         =================================================== */}

      <div className="reports-summary">
        <div className="report-summary-card">
          <div className="report-summary-icon report-icon-total">
            <span>▤</span>
          </div>

          <div>
            <span>Total Reports</span>
            <strong>{formatNumber(totalReports)}</strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon report-icon-completed">
            <span>✓</span>
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedReports}</strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon report-icon-generating">
            <span>◷</span>
          </div>

          <div>
            <span>Generating</span>
            <strong>{generatingReports}</strong>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon report-icon-failed">
            <span>!</span>
          </div>

          <div>
            <span>Failed</span>
            <strong>{failedReports}</strong>
          </div>
        </div>
      </div>

      {/* ===================================================
          FILTER TOOLBAR
         =================================================== */}

      <div className="reports-toolbar">
        <div className="reports-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search reports..."
            value={filters.search}
            onChange={(event) =>
              handleFilterChange("search", event.target.value)
            }
          />
        </div>

        <select
          className="reports-filter-select"
          value={filters.type}
          onChange={(event) => handleFilterChange("type", event.target.value)}
        >
          <option value="">All Types</option>

          {REPORT_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <select
          className="reports-filter-select"
          value={filters.status}
          onChange={(event) => handleFilterChange("status", event.target.value)}
        >
          <option value="">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="GENERATING">Generating</option>
          <option value="FAILED">Failed</option>
        </select>

        <input
          type="date"
          className="reports-date-filter"
          value={filters.date_from}
          onChange={(event) =>
            handleFilterChange("date_from", event.target.value)
          }
          title="Date from"
        />

        <input
          type="date"
          className="reports-date-filter"
          value={filters.date_to}
          onChange={(event) =>
            handleFilterChange("date_to", event.target.value)
          }
          title="Date to"
        />

        <button
          type="button"
          className="reports-reset-button"
          onClick={handleResetFilters}
          title="Reset filters"
        >
          ↺
        </button>

        <button
          type="button"
          className="reports-refresh-button"
          onClick={() => dispatch(fetchReports(filters))}
          disabled={loading}
        >
          ↻{loading ? " Loading..." : " Refresh"}
        </button>
      </div>

      {/* ===================================================
          LOAD ERROR
         =================================================== */}

      {error && (
        <div className="reports-alert reports-alert-error">
          <div>
            <strong>Failed to load reports</strong>
            <span>{error}</span>
          </div>

          <button type="button" onClick={() => dispatch(fetchReports(filters))}>
            Retry
          </button>
        </div>
      )}

      {/* ===================================================
          TABLE CARD
         =================================================== */}

      <div className="reports-card">
        <div className="reports-card-header">
          <div>
            <h2>Report List</h2>

            <span>
              Showing {reports.length} of {formatNumber(pagination.total)}{" "}
              reports
            </span>
          </div>

          <div className="reports-card-meta">
            Page {pagination.page} / {Math.max(pagination.totalPages, 1)}
          </div>
        </div>

        <div className="reports-table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Type</th>
                <th>Vehicle</th>
                <th>Period</th>
                <th>Distance</th>
                <th>Trips</th>
                <th>Alerts</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="reports-empty">
                    <div className="reports-loading">
                      <div className="reports-spinner" />
                      <span>Loading reports...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="reports-empty">
                    <div className="reports-empty-content">
                      <div className="reports-empty-icon">▤</div>

                      <strong>No reports found</strong>

                      <span>
                        {filters.search ||
                        filters.type ||
                        filters.status ||
                        filters.date_from ||
                        filters.date_to
                          ? "Try changing your filters."
                          : "Create your first fleet report."}
                      </span>

                      {!filters.search &&
                        !filters.type &&
                        !filters.status &&
                        !filters.date_from &&
                        !filters.date_to && (
                          <button type="button" onClick={handleAdd}>
                            Create Report
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    {/* REPORT */}

                    <td>
                      <div className="report-name-cell">
                        <div className="report-type-mini">
                          {report.type === "ALERT_REPORT"
                            ? "!"
                            : report.type === "SPEED_REPORT"
                              ? "↗"
                              : report.type === "DISTANCE_REPORT"
                                ? "↔"
                                : report.type === "TRIP_REPORT"
                                  ? "⇄"
                                  : "▤"}
                        </div>

                        <div>
                          <strong>{report.name}</strong>

                          <span>
                            RPT-
                            {String(report.id).padStart(5, "0")}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* TYPE */}

                    <td>
                      <span className="report-type-badge">
                        {getReportTypeLabel(report.type)}
                      </span>
                    </td>

                    {/* VEHICLE */}

                    <td>
                      {report.vehicle ? (
                        <div className="report-vehicle-cell">
                          <strong>{report.vehicle.vehicle_code}</strong>

                          <span>
                            {report.vehicle.plate_number || "No plate"}
                          </span>
                        </div>
                      ) : (
                        <span className="report-fleet-label">Entire Fleet</span>
                      )}
                    </td>

                    {/* PERIOD */}

                    <td>
                      <div className="report-period">
                        <span>{formatDate(report.date_from)}</span>
                        <small>to</small>
                        <span>{formatDate(report.date_to)}</span>
                      </div>
                    </td>

                    {/* DISTANCE */}

                    <td>
                      <strong className="report-metric">
                        {formatDistance(report.total_distance)}
                      </strong>
                    </td>

                    {/* TRIPS */}

                    <td>
                      <strong className="report-metric">
                        {formatNumber(report.total_trips)}
                      </strong>
                    </td>

                    {/* ALERTS */}

                    <td>
                      <div className="report-alert-metric">
                        <strong>{report.total_alerts}</strong>

                        {report.critical_alerts > 0 && (
                          <span className="critical">
                            {report.critical_alerts} critical
                          </span>
                        )}
                      </div>
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`report-status report-status-${report.status.toLowerCase()}`}
                      >
                        <span className="report-status-dot" />

                        {getStatusLabel(report.status)}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="report-actions">
                        <button
                          type="button"
                          title="View Report"
                          onClick={() => handleView(report)}
                          disabled={actionLoading}
                        >
                          ◉
                        </button>

                        <button
                          type="button"
                          title="Edit Report"
                          onClick={() => handleEdit(report)}
                          disabled={actionLoading}
                        >
                          ✎
                        </button>

                        <button
                          type="button"
                          title="Generate Report"
                          onClick={() => handleGenerate(report)}
                          disabled={
                            actionLoading || report.status === "GENERATING"
                          }
                        >
                          ▶
                        </button>

                        <button
                          type="button"
                          title="Delete Report"
                          className="report-action-delete"
                          onClick={() => handleDelete(report)}
                          disabled={actionLoading}
                        >
                          ×
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

        {pagination.totalPages > 0 && (
          <div className="reports-pagination">
            <div className="reports-pagination-info">
              Page <strong>{pagination.page}</strong> of{" "}
              <strong>{pagination.totalPages}</strong>
            </div>

            <div className="reports-pagination-buttons">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
              >
                ‹
              </button>

              {paginationPages.map((page, index) =>
                page === -1 ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="reports-pagination-ellipsis"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    className={page === pagination.page ? "active" : ""}
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================
          MODAL
         =================================================== */}

      {modalMode && (
        <div
          className="report-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="report-modal">
            {/* =================================================
                MODAL HEADER
               ================================================= */}

            <div className="report-modal-header">
              <div>
                <div className="report-modal-eyebrow">ABN FLEET REPORT</div>

                <h2>
                  {modalMode === "ADD" && "Create Report"}

                  {modalMode === "EDIT" && "Edit Report"}

                  {modalMode === "VIEW" && "Report Details"}
                </h2>

                <p>
                  {modalMode === "ADD" &&
                    "Create a new operational fleet report."}

                  {modalMode === "EDIT" && "Update report configuration."}

                  {modalMode === "VIEW" &&
                    "Review report information and results."}
                </p>
              </div>

              <button
                type="button"
                className="report-modal-close"
                onClick={closeModal}
                disabled={actionLoading}
              >
                ×
              </button>
            </div>

            {/* =================================================
                VIEW MODE
               ================================================= */}

            {modalMode === "VIEW" ? (
              <div className="report-detail">
                {detailLoading ? (
                  <div className="report-detail-loading">
                    <div className="reports-spinner" />

                    <span>Loading report details...</span>
                  </div>
                ) : detailError ? (
                  <div className="report-detail-error">
                    <strong>Failed to load report</strong>
                    <span>{detailError}</span>
                  </div>
                ) : selectedReport ? (
                  <>
                    <div className="report-detail-title">
                      <div>
                        <span>
                          RPT-
                          {String(selectedReport.id).padStart(5, "0")}
                        </span>

                        <h3>{selectedReport.name}</h3>
                      </div>

                      <span
                        className={`report-status report-status-${selectedReport.status.toLowerCase()}`}
                      >
                        <span className="report-status-dot" />

                        {getStatusLabel(selectedReport.status)}
                      </span>
                    </div>

                    <div className="report-detail-grid">
                      <div className="report-detail-item">
                        <span>Report Type</span>
                        <strong>
                          {getReportTypeLabel(selectedReport.type)}
                        </strong>
                      </div>

                      <div className="report-detail-item">
                        <span>Vehicle</span>
                        <strong>
                          {selectedReport.vehicle
                            ? `${selectedReport.vehicle.vehicle_code}${
                                selectedReport.vehicle.plate_number
                                  ? ` · ${selectedReport.vehicle.plate_number}`
                                  : ""
                              }`
                            : "Entire Fleet"}
                        </strong>
                      </div>

                      <div className="report-detail-item">
                        <span>Date From</span>
                        <strong>{formatDate(selectedReport.date_from)}</strong>
                      </div>

                      <div className="report-detail-item">
                        <span>Date To</span>
                        <strong>{formatDate(selectedReport.date_to)}</strong>
                      </div>
                    </div>

                    <div className="report-result-section">
                      <div className="report-result-header">
                        <h3>Report Results</h3>
                      </div>

                      <div className="report-result-grid">
                        <div>
                          <span>Total Vehicles</span>
                          <strong>
                            {formatNumber(selectedReport.total_vehicles)}
                          </strong>
                        </div>

                        <div>
                          <span>Active Vehicles</span>
                          <strong>
                            {formatNumber(selectedReport.active_vehicles)}
                          </strong>
                        </div>

                        <div>
                          <span>Total Trips</span>
                          <strong>
                            {formatNumber(selectedReport.total_trips)}
                          </strong>
                        </div>

                        <div>
                          <span>Total Distance</span>
                          <strong>
                            {formatDistance(selectedReport.total_distance)}
                          </strong>
                        </div>

                        <div>
                          <span>Average Speed</span>
                          <strong>
                            {formatSpeed(selectedReport.average_speed)}
                          </strong>
                        </div>

                        <div>
                          <span>Maximum Speed</span>
                          <strong>
                            {formatSpeed(selectedReport.maximum_speed)}
                          </strong>
                        </div>

                        <div>
                          <span>Driving Time</span>
                          <strong>
                            {formatDuration(selectedReport.driving_seconds)}
                          </strong>
                        </div>

                        <div>
                          <span>Total Alerts</span>
                          <strong>
                            {formatNumber(selectedReport.total_alerts)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="report-alert-summary">
                      <div>
                        <span>Critical</span>
                        <strong>{selectedReport.critical_alerts}</strong>
                      </div>

                      <div>
                        <span>Warning</span>
                        <strong>{selectedReport.warning_alerts}</strong>
                      </div>

                      <div>
                        <span>Generated</span>
                        <strong>
                          {formatDate(selectedReport.generated_at, true)}
                        </strong>
                      </div>
                    </div>

                    {selectedReport.error_message && (
                      <div className="report-error-message">
                        <strong>Generation Error</strong>
                        <span>{selectedReport.error_message}</span>
                      </div>
                    )}
                  </>
                ) : null}

                <div className="report-modal-footer">
                  <button
                    type="button"
                    className="report-modal-cancel"
                    onClick={closeModal}
                  >
                    Close
                  </button>

                  {selectedReport && (
                    <>
                      <button
                        type="button"
                        className="report-modal-secondary"
                        onClick={() => handleEdit(selectedReport)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="report-modal-submit"
                        onClick={() => handleGenerate(selectedReport)}
                        disabled={
                          actionLoading ||
                          selectedReport.status === "GENERATING"
                        }
                      >
                        {selectedReport.status === "GENERATING"
                          ? "Generating..."
                          : "Generate Report"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* =================================================
                 ADD / EDIT FORM
                 ================================================= */

              <form onSubmit={handleSubmit}>
                <div className="report-form-grid">
                  {/* REPORT NAME */}

                  <div className="report-form-group report-form-full">
                    <label>
                      Report Name <span>*</span>
                    </label>

                    <input
                      type="text"
                      value={form.name}
                      disabled={actionLoading}
                      onChange={(event) =>
                        handleFormChange("name", event.target.value)
                      }
                      placeholder="Daily Fleet Activity Report"
                    />
                  </div>

                  {/* REPORT TYPE */}

                  <div className="report-form-group">
                    <label>
                      Report Type <span>*</span>
                    </label>

                    <select
                      value={form.type}
                      disabled={actionLoading}
                      onChange={(event) =>
                        handleFormChange("type", event.target.value)
                      }
                    >
                      {REPORT_TYPES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* VEHICLE ID */}

                  <div className="report-form-group">
                    <label>Vehicle ID</label>

                    <input
                      type="number"
                      min="1"
                      value={form.vehicle_id}
                      disabled={actionLoading}
                      onChange={(event) =>
                        handleFormChange("vehicle_id", event.target.value)
                      }
                      placeholder="Leave empty for entire fleet"
                    />

                    <small>Kosongkan untuk membuat report seluruh fleet.</small>
                  </div>

                  {/* DATE FROM */}

                  <div className="report-form-group">
                    <label>
                      Date From <span>*</span>
                    </label>

                    <input
                      type="date"
                      value={form.date_from}
                      disabled={actionLoading}
                      onChange={(event) =>
                        handleFormChange("date_from", event.target.value)
                      }
                    />
                  </div>

                  {/* DATE TO */}

                  <div className="report-form-group">
                    <label>
                      Date To <span>*</span>
                    </label>

                    <input
                      type="date"
                      value={form.date_to}
                      disabled={actionLoading}
                      onChange={(event) =>
                        handleFormChange("date_to", event.target.value)
                      }
                    />
                  </div>
                </div>

                {/* FORM ERROR */}

                {formError && (
                  <div className="report-form-error">
                    <strong>!</strong>
                    <span>{formError}</span>
                  </div>
                )}

                {/* FOOTER */}

                <div className="report-modal-footer">
                  <button
                    type="button"
                    className="report-modal-cancel"
                    onClick={closeModal}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="report-modal-submit"
                    disabled={actionLoading}
                  >
                    {actionLoading
                      ? "Saving..."
                      : modalMode === "ADD"
                        ? "Create Report"
                        : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
