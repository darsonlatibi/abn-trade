/* =========================================================
   ABN FLEET
   SAP INTEGRATION MANAGEMENT
   ========================================================= */

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Settings2,
  Trash2,
  Truck,
  Unlink,
  X,
  Zap,
} from "lucide-react";

import type { AppDispatch, RootState } from "../../stores/store";

import {
  createSAPIntegration,
  deleteSAPIntegration,
  disableSAPIntegration,
  enableSAPIntegration,
  fetchSAPIntegrationById,
  fetchSAPIntegrations,
  retrySAPIntegration,
  updateSAPIntegration,
  type CreateSAPIntegrationPayload,
  type SAPIntegration,
  type SAPIntegrationStatus,
  type SAPSyncDirection,
  type SAPSyncMethod,
  type UpdateSAPIntegrationPayload,
} from "../../features/integration/SAPIntegrationSlice";

import "./SAP.css";

/* =========================================================
   HELPERS
   ========================================================= */

const formatDate = (value: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const getStatusLabel = (status: SAPIntegrationStatus) => {
  switch (status) {
    case "CONNECTED":
      return "Connected";
    case "SYNCING":
      return "Syncing";
    case "SYNCED":
      return "Synced";
    case "FAILED":
      return "Failed";
    case "DISABLED":
      return "Disabled";
    case "PENDING":
      return "Pending";
    default:
      return status;
  }
};

const getDirectionLabel = (direction: SAPSyncDirection) => {
  switch (direction) {
    case "SAP_TO_ABN":
      return "SAP → ABN";
    case "ABN_TO_SAP":
      return "ABN → SAP";
    case "BIDIRECTIONAL":
      return "SAP ↔ ABN";
    default:
      return direction;
  }
};

/* =========================================================
   FORM TYPE
   ========================================================= */

interface SAPFormState {
  device_id: string;
  vehicle_id: string;

  sap_system: string;
  sap_client: string;
  sap_company_code: string;
  sap_plant: string;

  sap_equipment_id: string;
  sap_vehicle_id: string;
  sap_asset_id: string;
  sap_cost_center: string;

  external_id: string;

  sync_direction: SAPSyncDirection;
  sync_method: SAPSyncMethod;

  is_active: boolean;
}

const emptyForm: SAPFormState = {
  device_id: "",
  vehicle_id: "",

  sap_system: "",
  sap_client: "",
  sap_company_code: "",
  sap_plant: "",

  sap_equipment_id: "",
  sap_vehicle_id: "",
  sap_asset_id: "",
  sap_cost_center: "",

  external_id: "",

  sync_direction: "BIDIRECTIONAL",
  sync_method: "REST",

  is_active: true,
};

/* =========================================================
   COMPONENT
   ========================================================= */

export default function SAP() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    integrations,
    selectedIntegration,
    loading,
    detailLoading,
    saving,
    deleting,
    syncing,
    error,
    successMessage,
    count,
  } = useSelector((state: RootState) => state.sapIntegration);

  /* =======================================================
     LOCAL STATE
     ======================================================= */

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SAPIntegrationStatus | "">(
    "",
  );

  const [directionFilter, setDirectionFilter] = useState<SAPSyncDirection | "">(
    "",
  );

  const [methodFilter, setMethodFilter] = useState<SAPSyncMethod | "">("");

  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<SAPFormState>(emptyForm);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  /* =======================================================
     INITIAL FETCH
     ======================================================= */

  useEffect(() => {
    dispatch(fetchSAPIntegrations());
  }, [dispatch]);

  /* =======================================================
     FILTER
     ======================================================= */

  const filteredIntegrations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return integrations.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.sap_system?.toLowerCase().includes(keyword) ||
        item.external_id?.toLowerCase().includes(keyword) ||
        item.sap_equipment_id?.toLowerCase().includes(keyword) ||
        item.sap_vehicle_id?.toLowerCase().includes(keyword) ||
        item.sap_asset_id?.toLowerCase().includes(keyword) ||
        item.device?.device_code?.toLowerCase().includes(keyword) ||
        item.vehicle?.vehicle_code?.toLowerCase().includes(keyword) ||
        item.vehicle?.plate_number?.toLowerCase().includes(keyword);

      const matchesStatus =
        !statusFilter || item.integration_status === statusFilter;

      const matchesDirection =
        !directionFilter || item.sync_direction === directionFilter;

      const matchesMethod = !methodFilter || item.sync_method === methodFilter;

      const matchesActive =
        activeFilter === "" || item.is_active === (activeFilter === "true");

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDirection &&
        matchesMethod &&
        matchesActive
      );
    });
  }, [
    integrations,
    search,
    statusFilter,
    directionFilter,
    methodFilter,
    activeFilter,
  ]);

  /* =======================================================
     PAGINATION
     ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredIntegrations.length / pageSize),
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedIntegrations = filteredIntegrations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  /* =======================================================
     KPI
     ======================================================= */

  const total = count;

  const active = integrations.filter((item) => item.is_active).length;

  const synced = integrations.filter(
    (item) => item.integration_status === "SYNCED",
  ).length;

  const failed = integrations.filter(
    (item) => item.integration_status === "FAILED",
  ).length;

  /* =======================================================
     HANDLERS
     ======================================================= */

  const handleRefresh = () => {
    dispatch(
      fetchSAPIntegrations({
        search: search || undefined,
        status: statusFilter || undefined,
        sync_direction: directionFilter || undefined,
        sync_method: methodFilter || undefined,
        is_active: activeFilter === "" ? undefined : activeFilter === "true",
      }),
    );
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleOpenEdit = (item: SAPIntegration) => {
    setEditingId(item.id);

    setForm({
      device_id: String(item.device_id),
      vehicle_id: item.vehicle_id ? String(item.vehicle_id) : "",

      sap_system: item.sap_system || "",
      sap_client: item.sap_client || "",
      sap_company_code: item.sap_company_code || "",
      sap_plant: item.sap_plant || "",

      sap_equipment_id: item.sap_equipment_id || "",
      sap_vehicle_id: item.sap_vehicle_id || "",
      sap_asset_id: item.sap_asset_id || "",
      sap_cost_center: item.sap_cost_center || "",

      external_id: item.external_id || "",

      sync_direction: item.sync_direction,
      sync_method: item.sync_method,

      is_active: item.is_active,
    });

    setShowForm(true);
  };

  const handleOpenDetail = async (id: number) => {
    setShowDetail(true);

    await dispatch(fetchSAPIntegrationById(id));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const basePayload = {
      device_id: Number(form.device_id),
      vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : null,

      sap_system: form.sap_system || undefined,
      sap_client: form.sap_client || null,
      sap_company_code: form.sap_company_code || null,
      sap_plant: form.sap_plant || null,

      sap_equipment_id: form.sap_equipment_id || null,
      sap_vehicle_id: form.sap_vehicle_id || null,
      sap_asset_id: form.sap_asset_id || null,
      sap_cost_center: form.sap_cost_center || null,

      external_id: form.external_id || null,

      sync_direction: form.sync_direction,
      sync_method: form.sync_method,

      is_active: form.is_active,
    };

    if (editingId !== null) {
      const payload: UpdateSAPIntegrationPayload = {
        id: editingId,
        ...basePayload,
      };

      const result = await dispatch(updateSAPIntegration(payload));

      if (updateSAPIntegration.fulfilled.match(result)) {
        setShowForm(false);
      }
    } else {
      const payload: CreateSAPIntegrationPayload = basePayload;

      const result = await dispatch(createSAPIntegration(payload));

      if (createSAPIntegration.fulfilled.match(result)) {
        setShowForm(false);
      }
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Hapus SAP integration ini? Data integration akan dihapus.",
    );

    if (!confirmed) return;

    await dispatch(deleteSAPIntegration(id));
  };

  const handleToggle = async (item: SAPIntegration) => {
    if (item.is_active) {
      await dispatch(disableSAPIntegration(item.id));
    } else {
      await dispatch(enableSAPIntegration(item.id));
    }
  };

  const handleRetry = async (id: number) => {
    await dispatch(retrySAPIntegration(id));
  };

  const updateForm = <K extends keyof SAPFormState>(
    key: K,
    value: SAPFormState[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="sap-page">
      {/* ===================================================
          HEADER
         =================================================== */}

      <div className="sap-page-header">
        <div>
          <div className="sap-title-row">
            <div className="sap-title-icon">
              <Link2 size={22} />
            </div>

            <div>
              <h1>SAP Integration</h1>

              <p>Kelola koneksi dan sinkronisasi data ABN Fleet dengan SAP.</p>
            </div>
          </div>
        </div>

        <div className="sap-header-actions">
          <button
            type="button"
            className="sap-btn sap-btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "sap-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            className="sap-btn sap-btn-primary"
            onClick={handleOpenCreate}
          >
            <Plus size={17} />
            Add Integration
          </button>
        </div>
      </div>

      {/* ===================================================
          KPI
         =================================================== */}

      <div className="sap-kpi-grid">
        <div className="sap-kpi-card">
          <div className="sap-kpi-icon">
            <Link2 size={20} />
          </div>

          <div>
            <span>Total Integration</span>
            <strong>{total}</strong>
          </div>
        </div>

        <div className="sap-kpi-card">
          <div className="sap-kpi-icon">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Active</span>
            <strong>{active}</strong>
          </div>
        </div>

        <div className="sap-kpi-card">
          <div className="sap-kpi-icon">
            <Activity size={20} />
          </div>

          <div>
            <span>Synced</span>
            <strong>{synced}</strong>
          </div>
        </div>

        <div className="sap-kpi-card">
          <div className="sap-kpi-icon sap-kpi-danger">
            <AlertCircle size={20} />
          </div>

          <div>
            <span>Failed</span>
            <strong>{failed}</strong>
          </div>
        </div>
      </div>

      {/* ===================================================
          ERROR
         =================================================== */}

      {error && (
        <div className="sap-alert sap-alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="sap-alert sap-alert-success">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ===================================================
          FILTER BAR
         =================================================== */}

      <div className="sap-filter-card">
        <div className="sap-search-box">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search SAP, device, vehicle..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as SAPIntegrationStatus | "");
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONNECTED">Connected</option>
          <option value="SYNCING">Syncing</option>
          <option value="SYNCED">Synced</option>
          <option value="FAILED">Failed</option>
          <option value="DISABLED">Disabled</option>
        </select>

        <select
          value={directionFilter}
          onChange={(event) => {
            setDirectionFilter(event.target.value as SAPSyncDirection | "");
            setPage(1);
          }}
        >
          <option value="">All Direction</option>
          <option value="SAP_TO_ABN">SAP → ABN</option>
          <option value="ABN_TO_SAP">ABN → SAP</option>
          <option value="BIDIRECTIONAL">SAP ↔ ABN</option>
        </select>

        <select
          value={methodFilter}
          onChange={(event) => {
            setMethodFilter(event.target.value as SAPSyncMethod | "");
            setPage(1);
          }}
        >
          <option value="">All Method</option>
          <option value="REST">REST</option>
          <option value="ODATA">OData</option>
          <option value="SOAP">SOAP</option>
          <option value="RFC">RFC</option>
        </select>

        <select
          value={activeFilter}
          onChange={(event) => {
            setActiveFilter(event.target.value as "" | "true" | "false");
            setPage(1);
          }}
        >
          <option value="">All State</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* ===================================================
          TABLE
         =================================================== */}

      <div className="sap-table-card">
        <div className="sap-table-header">
          <div>
            <h2>Integration List</h2>

            <span>
              {filteredIntegrations.length} integration
              {filteredIntegrations.length !== 1 ? "s" : ""}
            </span>
          </div>

          {syncing && (
            <div className="sap-sync-indicator">
              <Loader2 size={15} className="sap-spin" />
              Processing...
            </div>
          )}
        </div>

        <div className="sap-table-wrapper">
          <table className="sap-table">
            <thead>
              <tr>
                <th>Integration</th>
                <th>Device / Vehicle</th>
                <th>SAP Mapping</th>
                <th>Direction</th>
                <th>Method</th>
                <th>Last Sync</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && integrations.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="sap-table-loading">
                      <Loader2 size={25} className="sap-spin" />
                      Loading SAP integrations...
                    </div>
                  </td>
                </tr>
              ) : paginatedIntegrations.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="sap-empty">
                      <Server size={38} />
                      <strong>No SAP integration found</strong>
                      <span>
                        Belum ada integration yang sesuai dengan filter.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedIntegrations.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="sap-integration-name">
                        <div className="sap-row-icon">
                          <Server size={16} />
                        </div>

                        <div>
                          <strong>{item.sap_system || "SAP"}</strong>

                          <span>
                            {item.external_id || `Integration #${item.id}`}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="sap-device-cell">
                        <span>
                          <Server size={14} />
                          {item.device?.device_code ||
                            `Device #${item.device_id}`}
                        </span>

                        <span>
                          <Truck size={14} />
                          {item.vehicle?.plate_number ||
                            item.vehicle?.vehicle_code ||
                            (item.vehicle_id
                              ? `Vehicle #${item.vehicle_id}`
                              : "-")}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="sap-mapping-cell">
                        {item.sap_equipment_id && (
                          <span>EQ: {item.sap_equipment_id}</span>
                        )}

                        {item.sap_vehicle_id && (
                          <span>VEH: {item.sap_vehicle_id}</span>
                        )}

                        {item.sap_asset_id && (
                          <span>AST: {item.sap_asset_id}</span>
                        )}

                        {!item.sap_equipment_id &&
                          !item.sap_vehicle_id &&
                          !item.sap_asset_id && (
                            <span className="sap-muted">Not mapped</span>
                          )}
                      </div>
                    </td>

                    <td>
                      <span className="sap-direction">
                        {getDirectionLabel(item.sync_direction)}
                      </span>
                    </td>

                    <td>
                      <span className="sap-method">{item.sync_method}</span>
                    </td>

                    <td>
                      <div className="sap-last-sync">
                        <span>{formatDate(item.last_sync_at)}</span>

                        {item.last_sync_status && (
                          <small
                            className={
                              item.last_sync_status === "SUCCESS"
                                ? "success"
                                : item.last_sync_status === "FAILED"
                                  ? "failed"
                                  : "pending"
                            }
                          >
                            {item.last_sync_status}
                          </small>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="sap-status-wrapper">
                        <span
                          className={`sap-status sap-status-${item.integration_status.toLowerCase()}`}
                        >
                          <span className="sap-status-dot" />
                          {getStatusLabel(item.integration_status)}
                        </span>

                        {!item.is_active && (
                          <small className="sap-inactive-label">Inactive</small>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="sap-actions">
                        <button
                          type="button"
                          title="View"
                          onClick={() => handleOpenDetail(item.id)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          title="Edit"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          type="button"
                          title={item.is_active ? "Disable" : "Enable"}
                          onClick={() => handleToggle(item)}
                          disabled={syncing}
                        >
                          {item.is_active ? (
                            <Unlink size={16} />
                          ) : (
                            <Zap size={16} />
                          )}
                        </button>

                        {item.integration_status === "FAILED" && (
                          <button
                            type="button"
                            title="Retry"
                            onClick={() => handleRetry(item.id)}
                            disabled={syncing}
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}

                        <button
                          type="button"
                          className="danger"
                          title="Delete"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting}
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

        <div className="sap-pagination">
          <span>
            Showing{" "}
            {filteredIntegrations.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}{" "}
            - {Math.min(currentPage * pageSize, filteredIntegrations.length)} of{" "}
            {filteredIntegrations.length}
          </span>

          <div>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft size={16} />
            </button>

            <strong>
              {currentPage} / {totalPages}
            </strong>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          CREATE / EDIT MODAL
         =================================================== */}

      {showForm && (
        <div className="sap-modal-backdrop">
          <div className="sap-modal sap-modal-large">
            <div className="sap-modal-header">
              <div>
                <h2>
                  {editingId ? "Edit SAP Integration" : "Add SAP Integration"}
                </h2>

                <p>Konfigurasi mapping device/vehicle dengan SAP.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="sap-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="sap-modal-body">
                <div className="sap-form-section">
                  <div className="sap-form-section-title">
                    <Settings2 size={17} />
                    ABN Mapping
                  </div>

                  <div className="sap-form-grid">
                    <label>
                      Device ID *
                      <input
                        type="number"
                        min="1"
                        required
                        value={form.device_id}
                        onChange={(event) =>
                          updateForm("device_id", event.target.value)
                        }
                        placeholder="Device ID"
                      />
                    </label>

                    <label>
                      Vehicle ID
                      <input
                        type="number"
                        min="1"
                        value={form.vehicle_id}
                        onChange={(event) =>
                          updateForm("vehicle_id", event.target.value)
                        }
                        placeholder="Vehicle ID"
                      />
                    </label>
                  </div>
                </div>

                <div className="sap-form-section">
                  <div className="sap-form-section-title">
                    <Server size={17} />
                    SAP System
                  </div>

                  <div className="sap-form-grid">
                    <label>
                      SAP System
                      <input
                        value={form.sap_system}
                        onChange={(event) =>
                          updateForm("sap_system", event.target.value)
                        }
                        placeholder="SAP ERP / S4HANA"
                      />
                    </label>

                    <label>
                      SAP Client
                      <input
                        value={form.sap_client}
                        onChange={(event) =>
                          updateForm("sap_client", event.target.value)
                        }
                        placeholder="100"
                      />
                    </label>

                    <label>
                      Company Code
                      <input
                        value={form.sap_company_code}
                        onChange={(event) =>
                          updateForm("sap_company_code", event.target.value)
                        }
                        placeholder="1000"
                      />
                    </label>

                    <label>
                      Plant
                      <input
                        value={form.sap_plant}
                        onChange={(event) =>
                          updateForm("sap_plant", event.target.value)
                        }
                        placeholder="PLANT-01"
                      />
                    </label>
                  </div>
                </div>

                <div className="sap-form-section">
                  <div className="sap-form-section-title">
                    <Truck size={17} />
                    SAP Object Mapping
                  </div>

                  <div className="sap-form-grid">
                    <label>
                      SAP Equipment ID
                      <input
                        value={form.sap_equipment_id}
                        onChange={(event) =>
                          updateForm("sap_equipment_id", event.target.value)
                        }
                        placeholder="Equipment number"
                      />
                    </label>

                    <label>
                      SAP Vehicle ID
                      <input
                        value={form.sap_vehicle_id}
                        onChange={(event) =>
                          updateForm("sap_vehicle_id", event.target.value)
                        }
                        placeholder="SAP vehicle"
                      />
                    </label>

                    <label>
                      SAP Asset ID
                      <input
                        value={form.sap_asset_id}
                        onChange={(event) =>
                          updateForm("sap_asset_id", event.target.value)
                        }
                        placeholder="Asset number"
                      />
                    </label>

                    <label>
                      Cost Center
                      <input
                        value={form.sap_cost_center}
                        onChange={(event) =>
                          updateForm("sap_cost_center", event.target.value)
                        }
                        placeholder="Cost center"
                      />
                    </label>

                    <label>
                      External ID
                      <input
                        value={form.external_id}
                        onChange={(event) =>
                          updateForm("external_id", event.target.value)
                        }
                        placeholder="External reference"
                      />
                    </label>
                  </div>
                </div>

                <div className="sap-form-section">
                  <div className="sap-form-section-title">
                    <Activity size={17} />
                    Synchronization
                  </div>

                  <div className="sap-form-grid">
                    <label>
                      Sync Direction
                      <select
                        value={form.sync_direction}
                        onChange={(event) =>
                          updateForm(
                            "sync_direction",
                            event.target.value as SAPSyncDirection,
                          )
                        }
                      >
                        <option value="SAP_TO_ABN">SAP → ABN</option>

                        <option value="ABN_TO_SAP">ABN → SAP</option>

                        <option value="BIDIRECTIONAL">SAP ↔ ABN</option>
                      </select>
                    </label>

                    <label>
                      Sync Method
                      <select
                        value={form.sync_method}
                        onChange={(event) =>
                          updateForm(
                            "sync_method",
                            event.target.value as SAPSyncMethod,
                          )
                        }
                      >
                        <option value="REST">REST</option>
                        <option value="ODATA">OData</option>
                        <option value="SOAP">SOAP</option>
                        <option value="RFC">RFC</option>
                      </select>
                    </label>
                  </div>

                  <label className="sap-checkbox">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(event) =>
                        updateForm("is_active", event.target.checked)
                      }
                    />

                    <span>Integration Active</span>
                  </label>
                </div>
              </div>

              <div className="sap-modal-footer">
                <button
                  type="button"
                  className="sap-btn sap-btn-secondary"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="sap-btn sap-btn-primary"
                  disabled={saving}
                >
                  {saving && <Loader2 size={16} className="sap-spin" />}

                  {editingId ? "Save Changes" : "Create Integration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================
          DETAIL MODAL
         =================================================== */}

      {showDetail && (
        <div className="sap-modal-backdrop">
          <div className="sap-modal">
            <div className="sap-modal-header">
              <div>
                <h2>SAP Integration Detail</h2>
                <p>Integration configuration dan synchronization status.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowDetail(false)}
                className="sap-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="sap-modal-body">
              {detailLoading || !selectedIntegration ? (
                <div className="sap-detail-loading">
                  <Loader2 size={25} className="sap-spin" />
                  Loading detail...
                </div>
              ) : (
                <>
                  <div className="sap-detail-status">
                    <span
                      className={`sap-status sap-status-${selectedIntegration.integration_status.toLowerCase()}`}
                    >
                      <span className="sap-status-dot" />
                      {getStatusLabel(selectedIntegration.integration_status)}
                    </span>

                    <span
                      className={
                        selectedIntegration.is_active
                          ? "sap-active"
                          : "sap-inactive"
                      }
                    >
                      {selectedIntegration.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  <div className="sap-detail-grid">
                    <div>
                      <span>SAP System</span>
                      <strong>{selectedIntegration.sap_system || "-"}</strong>
                    </div>

                    <div>
                      <span>SAP Client</span>
                      <strong>{selectedIntegration.sap_client || "-"}</strong>
                    </div>

                    <div>
                      <span>Company Code</span>
                      <strong>
                        {selectedIntegration.sap_company_code || "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Plant</span>
                      <strong>{selectedIntegration.sap_plant || "-"}</strong>
                    </div>

                    <div>
                      <span>Device</span>
                      <strong>
                        {selectedIntegration.device?.device_code ||
                          `#${selectedIntegration.device_id}`}
                      </strong>
                    </div>

                    <div>
                      <span>Vehicle</span>
                      <strong>
                        {selectedIntegration.vehicle?.plate_number ||
                          selectedIntegration.vehicle?.vehicle_code ||
                          "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Equipment</span>
                      <strong>
                        {selectedIntegration.sap_equipment_id || "-"}
                      </strong>
                    </div>

                    <div>
                      <span>SAP Vehicle</span>
                      <strong>
                        {selectedIntegration.sap_vehicle_id || "-"}
                      </strong>
                    </div>

                    <div>
                      <span>SAP Asset</span>
                      <strong>{selectedIntegration.sap_asset_id || "-"}</strong>
                    </div>

                    <div>
                      <span>Cost Center</span>
                      <strong>
                        {selectedIntegration.sap_cost_center || "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Sync Direction</span>
                      <strong>
                        {getDirectionLabel(selectedIntegration.sync_direction)}
                      </strong>
                    </div>

                    <div>
                      <span>Sync Method</span>
                      <strong>{selectedIntegration.sync_method}</strong>
                    </div>

                    <div>
                      <span>Last Sync</span>
                      <strong>
                        {formatDate(selectedIntegration.last_sync_at)}
                      </strong>
                    </div>

                    <div>
                      <span>Last Sync Status</span>
                      <strong>
                        {selectedIntegration.last_sync_status || "-"}
                      </strong>
                    </div>

                    <div>
                      <span>Sync Attempts</span>
                      <strong>{selectedIntegration.sync_attempts}</strong>
                    </div>

                    <div>
                      <span>Success / Failure</span>
                      <strong>
                        {selectedIntegration.sync_success_count} /{" "}
                        {selectedIntegration.sync_failure_count}
                      </strong>
                    </div>
                  </div>

                  {selectedIntegration.last_sync_error && (
                    <div className="sap-detail-error">
                      <AlertCircle size={17} />

                      <div>
                        <strong>Last Sync Error</strong>
                        <span>{selectedIntegration.last_sync_error}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="sap-modal-footer">
              <button
                type="button"
                className="sap-btn sap-btn-secondary"
                onClick={() => setShowDetail(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
