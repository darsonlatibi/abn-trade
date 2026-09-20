import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  CheckCircle2,
  Cpu,
  Edit3,
  Eye,
  HardDrive,
  Link2,
  Plus,
  RefreshCw,
  Search,
  Server,
  Trash2,
  Truck,
  Unlink,
  Wifi,
  WifiOff,
  X,
  XCircle,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../stores/store";

import {
  clearDeviceError,
  clearDeviceSuccess,
  clearSelectedDevice,
  createDevice,
  deleteDevice,
  fetchDeviceById,
  fetchDevices,
  selectDevices,
  selectDevicesDeleting,
  selectDevicesError,
  selectDevicesLoading,
  selectDevicesSaving,
  selectDevicesSuccess,
  selectSelectedDevice,
  updateDevice,
} from "../../features/devices/devicesSlice";

import type {
  Device,
  DevicePayload,
} from "../../features/devices/devicesSlice";

import "./Device.css";

/* =========================================================
   TYPES
   ========================================================= */

type DeviceStatus = "ONLINE" | "OFFLINE" | "FAULT" | "INACTIVE";

interface DeviceForm {
  device_code: string;
  esp_chip_id: string;
  modem_imei: string;
  sim_iccid: string;
  firmware_version: string;
  vehicle_id: string;
  status: DeviceStatus;
}

/* =========================================================
   HELPERS
   ========================================================= */

const createEmptyForm = (): DeviceForm => ({
  device_code: "",
  esp_chip_id: "",
  modem_imei: "",
  sim_iccid: "",
  firmware_version: "",
  vehicle_id: "",
  status: "OFFLINE",
});

const normalizeStatus = (status?: string): DeviceStatus => {
  const value = String(status ?? "")
    .trim()
    .toUpperCase();

  switch (value) {
    case "ONLINE":
      return "ONLINE";

    case "FAULT":
      return "FAULT";

    case "INACTIVE":
      return "INACTIVE";

    case "OFFLINE":
    default:
      return "OFFLINE";
  }
};

const formatDate = (value?: string | null): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "medium",
  });
};

const normalizeOptionalText = (value: string): string | null => {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
};

/* =========================================================
   STATUS BADGE
   ========================================================= */

function StatusBadge({ status }: { status?: string }) {
  const normalized = normalizeStatus(status);

  const config: Record<
    DeviceStatus,
    {
      label: string;
      icon: typeof CheckCircle2;
    }
  > = {
    ONLINE: {
      label: "ONLINE",
      icon: CheckCircle2,
    },

    OFFLINE: {
      label: "OFFLINE",
      icon: WifiOff,
    },

    FAULT: {
      label: "FAULT",
      icon: XCircle,
    },

    INACTIVE: {
      label: "INACTIVE",
      icon: Activity,
    },
  };

  const Icon = config[normalized].icon;

  return (
    <span className={`device-status device-status-${normalized.toLowerCase()}`}>
      <Icon size={14} strokeWidth={2} />

      {config[normalized].label}
    </span>
  );
}

/* =========================================================
   PAGE
   ========================================================= */

function Devices() {
  const dispatch = useDispatch<AppDispatch>();

  /* =======================================================
     REDUX
     ======================================================= */

  const user = useSelector((state: RootState) => state.auth.user);

  const devices = useSelector(selectDevices);

  const selectedDevice = useSelector(selectSelectedDevice);

  const loading = useSelector(selectDevicesLoading);

  const saving = useSelector(selectDevicesSaving);

  const deleting = useSelector(selectDevicesDeleting);

  const error = useSelector(selectDevicesError);

  const successMessage = useSelector(selectDevicesSuccess);

  /* =======================================================
     ROLE
     ======================================================= */

  const canManageDevice =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  /* =======================================================
     LOCAL STATE
     ======================================================= */

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);

  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  const [form, setForm] = useState<DeviceForm>(createEmptyForm());

  /* =======================================================
     FETCH DEVICES
     ======================================================= */

  useEffect(() => {
    if (!canManageDevice) {
      return;
    }

    dispatch(fetchDevices());
  }, [dispatch, canManageDevice]);

  /* =======================================================
     AUTO CLEAR MESSAGES
     ======================================================= */

  useEffect(() => {
    if (!error && !successMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (error) {
        dispatch(clearDeviceError());
      }

      if (successMessage) {
        dispatch(clearDeviceSuccess());
      }
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [dispatch, error, successMessage]);

  /* =======================================================
     FILTER
     ======================================================= */

  const filteredDevices = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return devices.filter((device) => {
      const status = normalizeStatus(device.status);

      const matchesStatus = statusFilter === "ALL" || status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const searchableValues = [
        device.device_code,
        device.esp_chip_id,
        device.modem_imei,
        device.sim_iccid,
        device.firmware_version,
        device.vehicle?.vehicle_code,
        device.vehicle?.plate_number,
        device.vehicle?.vehicle_name,
      ];

      return searchableValues
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [devices, search, statusFilter]);

  /* =======================================================
     SUMMARY
     ======================================================= */

  const summary = useMemo(() => {
    let online = 0;
    let offline = 0;
    let fault = 0;
    let unassigned = 0;

    for (const device of devices) {
      const status = normalizeStatus(device.status);

      if (status === "ONLINE") {
        online++;
      }

      if (status === "OFFLINE") {
        offline++;
      }

      if (status === "FAULT") {
        fault++;
      }

      if (device.vehicle_id === null || device.vehicle_id === undefined) {
        unassigned++;
      }
    }

    return {
      total: devices.length,
      online,
      offline,
      fault,
      unassigned,
    };
  }, [devices]);

  /* =======================================================
     FORM
     ======================================================= */

  const openCreateForm = () => {
    dispatch(clearSelectedDevice());

    dispatch(clearDeviceError());

    setEditingDevice(null);

    setForm(createEmptyForm());

    setShowForm(true);
  };

  const openEditForm = (device: Device) => {
    dispatch(clearDeviceError());

    setEditingDevice(device);

    setForm({
      device_code: device.device_code ?? "",

      esp_chip_id: device.esp_chip_id ?? "",

      modem_imei: device.modem_imei ?? "",

      sim_iccid: device.sim_iccid ?? "",

      firmware_version: device.firmware_version ?? "",

      vehicle_id:
        device.vehicle_id !== null && device.vehicle_id !== undefined
          ? String(device.vehicle_id)
          : "",

      status: normalizeStatus(device.status),
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);

    setEditingDevice(null);

    setForm(createEmptyForm());
  };

  const handleFormChange = (field: keyof DeviceForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* =======================================================
     SAVE
     ======================================================= */

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const deviceCode = form.device_code.trim();

    if (!deviceCode) {
      dispatch(clearDeviceError());

      return;
    }

    let vehicleId: number | null = null;

    if (form.vehicle_id.trim()) {
      const parsedVehicleId = Number(form.vehicle_id.trim());

      if (!Number.isInteger(parsedVehicleId) || parsedVehicleId <= 0) {
        return;
      }

      vehicleId = parsedVehicleId;
    }

    const payload: DevicePayload = {
      device_code: deviceCode,

      esp_chip_id: normalizeOptionalText(form.esp_chip_id),

      modem_imei: normalizeOptionalText(form.modem_imei),

      sim_iccid: normalizeOptionalText(form.sim_iccid),

      firmware_version: normalizeOptionalText(form.firmware_version),

      vehicle_id: vehicleId,

      status: normalizeStatus(form.status),
    };

    /* =====================================================
       UPDATE
       ===================================================== */

    if (editingDevice) {
      const deviceId = editingDevice.id;

      const result = await dispatch(
        updateDevice({
          id: deviceId,
          data: payload,
        }),
      );

      if (updateDevice.fulfilled.match(result)) {
        setShowForm(false);

        setEditingDevice(null);

        setForm(createEmptyForm());

        await dispatch(fetchDevices());

        if (selectedDevice?.id === deviceId) {
          await dispatch(fetchDeviceById(deviceId));
        }
      }

      return;
    }

    /* =====================================================
       CREATE
       ===================================================== */

    const result = await dispatch(createDevice(payload));

    if (createDevice.fulfilled.match(result)) {
      setShowForm(false);

      setEditingDevice(null);

      setForm(createEmptyForm());

      await dispatch(fetchDevices());
    }
  };

  /* =======================================================
     VIEW
     ======================================================= */

  const handleView = async (device: Device) => {
    await dispatch(fetchDeviceById(device.id));
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const handleDelete = async (device: Device) => {
    const confirmed = window.confirm(
      `Hapus device "${device.device_code}"?\n\nTindakan ini tidak dapat dibatalkan.`,
    );

    if (!confirmed) {
      return;
    }

    const result = await dispatch(deleteDevice(device.id));

    if (deleteDevice.fulfilled.match(result)) {
      if (selectedDevice?.id === device.id) {
        dispatch(clearSelectedDevice());
      }

      if (editingDevice?.id === device.id) {
        setShowForm(false);

        setEditingDevice(null);

        setForm(createEmptyForm());
      }

      await dispatch(fetchDevices());
    }
  };

  /* =======================================================
     REFRESH
     ======================================================= */

  const handleRefresh = () => {
    dispatch(fetchDevices());
  };

  /* =======================================================
     ACCESS DENIED
     ======================================================= */

  if (!canManageDevice) {
    return (
      <main className="device-page">
        <section className="device-access-denied">
          <div className="device-access-denied-icon">
            <XCircle size={30} />
          </div>

          <h2>Access Denied</h2>

          <p>Halaman Device hanya dapat diakses oleh ADMIN dan SUPER_ADMIN.</p>
        </section>
      </main>
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="device-page">
      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="device-page-header">
        <div className="device-page-title">
          <div className="device-page-title-icon">
            <Cpu size={22} strokeWidth={2} />
          </div>

          <div>
            <h1>Device Management</h1>

            <p>
              Kelola ABN Tracker, modem, SIM, firmware, dan assignment
              kendaraan.
            </p>
          </div>
        </div>

        <div className="device-page-actions">
          <button
            type="button"
            className="device-button device-button-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "device-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            className="device-button device-button-primary"
            onClick={openCreateForm}
          >
            <Plus size={17} />
            Add Device
          </button>
        </div>
      </div>

      {/* ===================================================
          ALERT
          =================================================== */}

      {error && (
        <div className="device-alert device-alert-error">
          <XCircle size={17} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => dispatch(clearDeviceError())}
            aria-label="Close error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="device-alert device-alert-success">
          <CheckCircle2 size={17} />

          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() => dispatch(clearDeviceSuccess())}
            aria-label="Close success"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ===================================================
          SUMMARY
          =================================================== */}

      <section className="device-summary-grid">
        <SummaryCard
          icon={<HardDrive size={20} />}
          className="total"
          label="Total Devices"
          value={summary.total}
        />

        <SummaryCard
          icon={<Wifi size={20} />}
          className="online"
          label="Online"
          value={summary.online}
        />

        <SummaryCard
          icon={<WifiOff size={20} />}
          className="offline"
          label="Offline"
          value={summary.offline}
        />

        <SummaryCard
          icon={<Unlink size={20} />}
          className="unassigned"
          label="Unassigned"
          value={summary.unassigned}
        />

        <SummaryCard
          icon={<Activity size={20} />}
          className="fault"
          label="Fault"
          value={summary.fault}
        />
      </section>

      {/* ===================================================
          TABLE
          =================================================== */}

      <section className="device-table-card">
        <div className="device-table-header">
          <div>
            <h2>Device List</h2>

            <span>
              {filteredDevices.length} device
              {filteredDevices.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="device-table-filters">
            <div className="device-search">
              <Search size={16} />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search device, IMEI, vehicle..."
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter device status"
            >
              <option value="ALL">All Status</option>

              <option value="ONLINE">Online</option>

              <option value="OFFLINE">Offline</option>

              <option value="FAULT">Fault</option>

              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <div className="device-table-wrapper">
          <table className="device-table">
            <thead>
              <tr>
                <th>Device</th>

                <th>IMEI</th>

                <th>Vehicle</th>

                <th>SIM / ICCID</th>

                <th>Status</th>

                <th>Firmware</th>

                <th>Updated</th>

                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <div className="device-table-loading">
                      <RefreshCw size={20} className="device-spin" />

                      <span>Loading devices...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="device-empty">
                      <HardDrive size={28} />

                      <strong>No devices found</strong>

                      <span>Belum ada device yang sesuai dengan filter.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => (
                  <tr
                    key={device.id}
                    className={
                      selectedDevice?.id === device.id ? "selected" : ""
                    }
                  >
                    {/* DEVICE */}

                    <td>
                      <div className="device-identity">
                        <div className="device-identity-icon">
                          <Cpu size={17} />
                        </div>

                        <div>
                          <strong>{device.device_code}</strong>

                          <span>ESP: {device.esp_chip_id || "-"}</span>
                        </div>
                      </div>
                    </td>

                    {/* IMEI */}

                    <td>
                      <span className="device-mono">
                        {device.modem_imei || "-"}
                      </span>
                    </td>

                    {/* VEHICLE */}

                    <td>
                      {device.vehicle ? (
                        <div className="device-vehicle">
                          <Truck size={15} />

                          <div>
                            <strong>{device.vehicle.plate_number}</strong>

                            <span>
                              {device.vehicle.vehicle_name ||
                                device.vehicle.vehicle_code}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="device-unassigned">
                          <Unlink size={14} />
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* ICCID */}

                    <td>
                      <span className="device-mono">
                        {device.sim_iccid || "-"}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td>
                      <StatusBadge status={device.status} />
                    </td>

                    {/* FIRMWARE */}

                    <td>
                      <span className="device-firmware">
                        {device.firmware_version || "-"}
                      </span>
                    </td>

                    {/* UPDATED */}

                    <td>
                      <span className="device-date">
                        {formatDate(device.updated_at)}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td>
                      <div className="device-row-actions">
                        <button
                          type="button"
                          className="device-action-button"
                          title="View device"
                          onClick={() => handleView(device)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          type="button"
                          className="device-action-button"
                          title="Edit device"
                          onClick={() => openEditForm(device)}
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          type="button"
                          className="device-action-button danger"
                          title="Delete device"
                          disabled={deleting}
                          onClick={() => handleDelete(device)}
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
      </section>

      {/* ===================================================
          DETAIL
          =================================================== */}

      {selectedDevice && !showForm && (
        <section className="device-detail-card">
          <div className="device-detail-header">
            <div className="device-detail-title">
              <div className="device-detail-icon">
                <Server size={20} />
              </div>

              <div>
                <h2>{selectedDevice.device_code}</h2>

                <span>Device #{selectedDevice.id}</span>
              </div>
            </div>

            <div className="device-detail-header-actions">
              <StatusBadge status={selectedDevice.status} />

              <button
                type="button"
                className="device-close-detail"
                onClick={() => dispatch(clearSelectedDevice())}
                aria-label="Close device detail"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          <div className="device-detail-grid">
            {/* DEVICE IDENTITY */}

            <div className="device-detail-section">
              <h3>Device Identity</h3>

              <div className="device-detail-list">
                <DetailItem
                  label="Device Code"
                  value={selectedDevice.device_code}
                />

                <DetailItem
                  label="ESP Chip ID"
                  value={selectedDevice.esp_chip_id}
                  mono
                />

                <DetailItem
                  label="Firmware"
                  value={selectedDevice.firmware_version}
                />
              </div>
            </div>

            {/* CONNECTIVITY */}

            <div className="device-detail-section">
              <h3>Connectivity</h3>

              <div className="device-detail-list">
                <DetailItem
                  label="Modem IMEI"
                  value={selectedDevice.modem_imei}
                  mono
                />

                <DetailItem
                  label="SIM / ICCID"
                  value={selectedDevice.sim_iccid}
                  mono
                />

                <DetailItem
                  label="Connection"
                  value={normalizeStatus(selectedDevice.status)}
                />
              </div>
            </div>

            {/* VEHICLE */}

            <div className="device-detail-section">
              <h3>Vehicle Assignment</h3>

              <div className="device-detail-list">
                <DetailItem
                  label="Vehicle ID"
                  value={
                    selectedDevice.vehicle_id !== null &&
                    selectedDevice.vehicle_id !== undefined
                      ? String(selectedDevice.vehicle_id)
                      : "Unassigned"
                  }
                />

                <DetailItem
                  label="Plate Number"
                  value={selectedDevice.vehicle?.plate_number || "Unassigned"}
                />

                <DetailItem
                  label="Vehicle"
                  value={
                    selectedDevice.vehicle?.vehicle_name ||
                    selectedDevice.vehicle?.vehicle_code ||
                    "-"
                  }
                />
              </div>
            </div>

            {/* RECORD */}

            <div className="device-detail-section">
              <h3>Record</h3>

              <div className="device-detail-list">
                <DetailItem
                  label="Created"
                  value={formatDate(selectedDevice.created_at)}
                />

                <DetailItem
                  label="Updated"
                  value={formatDate(selectedDevice.updated_at)}
                />
              </div>
            </div>
          </div>

          <div className="device-detail-footer">
            <button
              type="button"
              className="device-button device-button-secondary"
              onClick={() => openEditForm(selectedDevice)}
            >
              <Edit3 size={16} />
              Edit Device
            </button>
          </div>
        </section>
      )}

      {/* ===================================================
          ADD / EDIT MODAL
          =================================================== */}

      {showForm && (
        <div
          className="device-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div
            className="device-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="device-modal-title"
          >
            {/* MODAL HEADER */}

            <div className="device-modal-header">
              <div>
                <div className="device-modal-title-row">
                  <Cpu size={20} />

                  <h2 id="device-modal-title">
                    {editingDevice ? "Edit Device" : "Add Device"}
                  </h2>
                </div>

                <p>
                  {editingDevice
                    ? "Perbarui informasi ABN Tracker."
                    : "Daftarkan ABN Tracker baru ke sistem."}
                </p>
              </div>

              <button
                type="button"
                className="device-modal-close"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}

            <form className="device-form" onSubmit={handleSubmit}>
              <div className="device-form-grid">
                <FormField
                  label="Device Code"
                  required
                  value={form.device_code}
                  placeholder="ABN-TRK-001"
                  onChange={(value) => handleFormChange("device_code", value)}
                />

                <FormField
                  label="ESP Chip ID"
                  value={form.esp_chip_id}
                  placeholder="ESP8266 Chip ID"
                  onChange={(value) => handleFormChange("esp_chip_id", value)}
                />

                <FormField
                  label="Modem IMEI"
                  value={form.modem_imei}
                  placeholder="15 digit IMEI"
                  onChange={(value) => handleFormChange("modem_imei", value)}
                />

                <FormField
                  label="SIM / ICCID"
                  value={form.sim_iccid}
                  placeholder="ICCID SIM"
                  onChange={(value) => handleFormChange("sim_iccid", value)}
                />

                <FormField
                  label="Firmware Version"
                  value={form.firmware_version}
                  placeholder="1.0.0"
                  onChange={(value) =>
                    handleFormChange("firmware_version", value)
                  }
                />

                <FormField
                  label="Vehicle ID"
                  value={form.vehicle_id}
                  placeholder="Contoh: 1"
                  onChange={(value) =>
                    handleFormChange("vehicle_id", value.replace(/\D/g, ""))
                  }
                />

                <div className="device-form-field">
                  <label htmlFor="device-status">Status</label>

                  <select
                    id="device-status"
                    value={form.status}
                    onChange={(event) =>
                      handleFormChange("status", event.target.value)
                    }
                  >
                    <option value="ONLINE">ONLINE</option>

                    <option value="OFFLINE">OFFLINE</option>

                    <option value="FAULT">FAULT</option>

                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              {/* NOTE */}

              <div className="device-form-note">
                <Link2 size={15} />

                <span>
                  Vehicle ID digunakan untuk assignment device ke kendaraan.
                  Biarkan kosong jika device belum dipasang pada kendaraan.
                </span>
              </div>

              {/* FOOTER */}

              <div className="device-modal-footer">
                <button
                  type="button"
                  className="device-button device-button-secondary"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="device-button device-button-primary"
                  disabled={saving || !form.device_code.trim()}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="device-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingDevice ? <Edit3 size={16} /> : <Plus size={16} />}

                      {editingDevice ? "Save Changes" : "Create Device"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   SUMMARY CARD
   ========================================================= */

function SummaryCard({
  icon,
  className,
  label,
  value,
}: {
  icon: React.ReactNode;
  className: string;
  label: string;
  value: number;
}) {
  return (
    <div className="device-summary-card">
      <div className={`device-summary-icon ${className}`}>{icon}</div>

      <div>
        <span>{label}</span>

        <strong>{value}</strong>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ITEM
   ========================================================= */

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="device-detail-item">
      <span>{label}</span>

      <strong className={mono ? "device-mono" : ""}>{value || "-"}</strong>
    </div>
  );
}

/* =========================================================
   FORM FIELD
   ========================================================= */

function FormField({
  label,
  required = false,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="device-form-field">
      <label>
        {label}

        {required && <span className="device-required">*</span>}
      </label>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default Devices;
