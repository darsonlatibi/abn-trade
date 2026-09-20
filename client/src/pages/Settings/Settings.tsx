import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Database,
  FileJson,
  Globe,
  KeyRound,
  Lock,
  Map,
  RefreshCw,
  Save,
  Search,
  Server,
  Settings as SettingsIcon,
  ShieldCheck,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../stores/store";

import {
  fetchSettings,
  updateSetting,
  updateSettingsBulk,
  toggleSettingStatus,
  setSettingFilter,
  resetSettingFilters,
  clearSettingsError,
  selectSettings,
  selectSettingFilters,
  selectSettingsLoading,
  selectSettingUpdateLoading,
  selectSettingsBulkLoading,
  selectSettingStatusLoading,
  selectSettingsError,
  type SystemSetting,
  type SettingValueType,
} from "../../features/settings/settingsSlice";

import "./Settings.css";

/* =========================================================
   FALLBACK ICON
   ========================================================= */

const NavigationIcon = () => <Zap size={18} />;

/* =========================================================
   GROUP CONFIG
   ========================================================= */

const GROUP_CONFIG: Record<
  string,
  {
    label: string;
    description: string;
    icon: React.ReactNode;
  }
> = {
  GPS: {
    label: "GPS",
    description: "Konfigurasi pengambilan dan validasi posisi GPS.",
    icon: <Map size={18} />,
  },

  MQTT: {
    label: "MQTT",
    description: "Konfigurasi komunikasi tracker melalui MQTT.",
    icon: <Wifi size={18} />,
  },
  MODEM: {
    label: "Modem",
    description: "Konfigurasi koneksi modem 4G LTE tracker.",
    icon: <Wifi size={18} />,
  },
  TRACKER: {
    label: "Tracker",
    description: "Konfigurasi perilaku dan heartbeat GPS tracker.",
    icon: <NavigationIcon />,
  },

  SERVER: {
    label: "Server",
    description: "Konfigurasi komunikasi aplikasi dengan server.",
    icon: <Server size={18} />,
  },

  MAP: {
    label: "Map",
    description: "Konfigurasi tampilan dan provider peta.",
    icon: <Globe size={18} />,
  },

  ALERT: {
    label: "Alert",
    description: "Konfigurasi alarm dan batas operasional kendaraan.",
    icon: <AlertCircle size={18} />,
  },

  SYSTEM: {
    label: "System",
    description: "Konfigurasi umum sistem ABN Fleet.",
    icon: <SettingsIcon size={18} />,
  },
};

/* =========================================================
   HELPERS
   ========================================================= */

const getGroupConfig = (group: string) => {
  return (
    GROUP_CONFIG[group.toUpperCase()] || {
      label: group,
      description: "System configuration.",
      icon: <SlidersHorizontal size={18} />,
    }
  );
};

/* =========================================================
   FORMAT KEY
   ========================================================= */

const formatSettingKey = (key: string) => {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

/* =========================================================
   GET VALUE FOR INPUT
   ========================================================= */

const getValueForInput = (setting: SystemSetting): string => {
  if (setting.is_encrypted) {
    return "";
  }

  if (setting.value === null || setting.value === undefined) {
    return "";
  }

  if (setting.value_type === "JSON") {
    try {
      return JSON.stringify(setting.value, null, 2);
    } catch {
      return "";
    }
  }

  return String(setting.value);
};

/* =========================================================
   PARSE INPUT VALUE
   ========================================================= */

const parseInputValue = (value: string, type: SettingValueType): unknown => {
  switch (type) {
    case "INTEGER": {
      if (value.trim() === "") {
        throw new Error("Integer value tidak boleh kosong");
      }

      const parsed = Number.parseInt(value, 10);

      if (!Number.isInteger(parsed)) {
        throw new Error("Value harus berupa integer yang valid");
      }

      return parsed;
    }

    case "DECIMAL": {
      if (value.trim() === "") {
        throw new Error("Decimal value tidak boleh kosong");
      }

      const parsed = Number.parseFloat(value);

      if (!Number.isFinite(parsed)) {
        throw new Error("Value harus berupa decimal yang valid");
      }

      return parsed;
    }

    case "BOOLEAN":
      return value === "true";

    case "JSON": {
      if (value.trim() === "") {
        throw new Error("JSON tidak boleh kosong");
      }

      try {
        return JSON.parse(value);
      } catch {
        throw new Error("Format JSON tidak valid");
      }
    }

    case "STRING":
    default:
      return value;
  }
};

/* =========================================================
   TYPE LABEL
   ========================================================= */

const getTypeLabel = (type: SettingValueType) => {
  switch (type) {
    case "INTEGER":
      return "Integer";

    case "DECIMAL":
      return "Decimal";

    case "BOOLEAN":
      return "Boolean";

    case "JSON":
      return "JSON";

    case "STRING":
    default:
      return "String";
  }
};

/* =========================================================
   SETTING CARD
   ========================================================= */

interface SettingCardProps {
  setting: SystemSetting;
  localValue: string;

  onChange: (value: string) => void;
  onSave: () => void;
  onToggle: () => void;

  saving: boolean;
  toggling: boolean;
}

const SettingCard = ({
  setting,
  localValue,
  onChange,
  onSave,
  onToggle,
  saving,
  toggling,
}: SettingCardProps) => {
  const originalValue = getValueForInput(setting);

  const isDirty = localValue !== originalValue;

  /* =======================================================
     INPUT
     ======================================================= */

  const renderInput = () => {
    /* =====================================================
       ENCRYPTED
       ===================================================== */

    if (setting.is_encrypted) {
      return (
        <div className="setting-secret-field">
          <Lock size={16} />

          <span>Encrypted value</span>

          <strong>••••••••</strong>
        </div>
      );
    }

    /* =====================================================
       BOOLEAN
       ===================================================== */

    if (setting.value_type === "BOOLEAN") {
      const checked = localValue === "true";

      return (
        <button
          type="button"
          className={`setting-toggle ${checked ? "active" : ""}`}
          onClick={() => onChange(checked ? "false" : "true")}
        >
          {checked ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}

          <span>{checked ? "Enabled" : "Disabled"}</span>
        </button>
      );
    }

    /* =====================================================
       JSON
       ===================================================== */

    if (setting.value_type === "JSON") {
      return (
        <textarea
          className="setting-input setting-json-input"
          value={localValue}
          onChange={(event) => onChange(event.target.value)}
          rows={6}
          spellCheck={false}
        />
      );
    }

    /* =====================================================
       NUMBER
       ===================================================== */

    if (setting.value_type === "INTEGER" || setting.value_type === "DECIMAL") {
      return (
        <input
          className="setting-input"
          type="number"
          step={setting.value_type === "DECIMAL" ? "0.01" : "1"}
          value={localValue}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    }

    /* =====================================================
       STRING
       ===================================================== */

    return (
      <input
        className="setting-input"
        type="text"
        value={localValue}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div
      className={`setting-card ${
        setting.is_active ? "" : "setting-card-disabled"
      }`}
    >
      {/* =================================================
          HEADER
         ================================================= */}

      <div className="setting-card-header">
        <div className="setting-card-title">
          <div className="setting-key-icon">
            {setting.value_type === "JSON" ? (
              <FileJson size={17} />
            ) : setting.is_encrypted ? (
              <KeyRound size={17} />
            ) : setting.value_type === "BOOLEAN" ? (
              <ToggleRight size={17} />
            ) : (
              <SlidersHorizontal size={17} />
            )}
          </div>

          <div>
            <h3>{formatSettingKey(setting.setting_key)}</h3>

            <span className="setting-key">{setting.setting_key}</span>
          </div>
        </div>

        <div className="setting-card-status">
          <span
            className={`setting-status ${
              setting.is_active ? "active" : "inactive"
            }`}
          >
            {setting.is_active ? (
              <>
                <CheckCircle2 size={13} />
                Active
              </>
            ) : (
              <>
                <XCircle size={13} />
                Inactive
              </>
            )}
          </span>
        </div>
      </div>

      {/* =================================================
          DESCRIPTION
         ================================================= */}

      {setting.description && (
        <p className="setting-description">{setting.description}</p>
      )}

      {/* =================================================
          VALUE
         ================================================= */}

      <div className="setting-value-area">
        <div className="setting-value-label">
          <span>Value</span>

          <span className="setting-type">
            {getTypeLabel(setting.value_type)}
          </span>
        </div>

        {renderInput()}
      </div>

      {/* =================================================
          DIRTY INDICATOR
         ================================================= */}

      {isDirty && !setting.is_encrypted && (
        <div className="setting-dirty-indicator">
          <span />
          Unsaved changes
        </div>
      )}

      {/* =================================================
          FOOTER
         ================================================= */}

      <div className="setting-card-footer">
        <div className="setting-meta">
          <span>
            {setting.is_encrypted ? (
              <>
                <Lock size={12} />
                Encrypted
              </>
            ) : (
              <>
                <Database size={12} />
                ID {setting.id}
              </>
            )}
          </span>
        </div>

        <div className="setting-card-actions">
          {/* STATUS */}

          <button
            type="button"
            className={`setting-status-button ${
              setting.is_active ? "disable" : "enable"
            }`}
            onClick={onToggle}
            disabled={toggling}
          >
            {toggling ? (
              <RefreshCw size={14} className="spin" />
            ) : setting.is_active ? (
              "Disable"
            ) : (
              "Enable"
            )}
          </button>

          {/* SAVE */}

          <button
            type="button"
            className="setting-save-button"
            onClick={onSave}
            disabled={saving || !isDirty || setting.is_encrypted}
          >
            {saving ? (
              <>
                <RefreshCw size={14} className="spin" />
                Saving
              </>
            ) : (
              <>
                <Save size={14} />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN PAGE
   ========================================================= */

const Settings = () => {
  const dispatch = useDispatch<AppDispatch>();

  /* =======================================================
     REDUX
     ======================================================= */

  const settings = useSelector((state: RootState) => selectSettings(state));

  const filters = useSelector((state: RootState) =>
    selectSettingFilters(state),
  );

  const loading = useSelector((state: RootState) =>
    selectSettingsLoading(state),
  );

  const updateLoading = useSelector((state: RootState) =>
    selectSettingUpdateLoading(state),
  );

  const bulkLoading = useSelector((state: RootState) =>
    selectSettingsBulkLoading(state),
  );

  const statusLoading = useSelector((state: RootState) =>
    selectSettingStatusLoading(state),
  );

  const error = useSelector((state: RootState) => selectSettingsError(state));

  /* =======================================================
     LOCAL STATE
     ======================================================= */

  const [search, setSearch] = useState("");

  const [localValues, setLocalValues] = useState<Record<number, string>>({});

  const [savingId, setSavingId] = useState<number | null>(null);

  const [togglingId, setTogglingId] = useState<number | null>(null);

  /* =======================================================
     LOAD SETTINGS
     ======================================================= */

  useEffect(() => {
    dispatch(fetchSettings(filters));
  }, [dispatch, filters.group, filters.active]);

  /* =======================================================
     SYNC LOCAL VALUES
     ======================================================= */

  useEffect(() => {
    setLocalValues((current) => {
      const next = { ...current };

      for (const setting of settings) {
        const serverValue = getValueForInput(setting);

        /*
         * Hanya inject value jika belum ada.
         * Jangan overwrite user input yang sedang diedit.
         */

        if (!(setting.id in next)) {
          next[setting.id] = serverValue;
        }
      }

      /*
       * Bersihkan setting yang sudah tidak ada
       * dari state lokal.
       */

      const validIds = new Set(settings.map((setting) => setting.id));

      for (const id of Object.keys(next)) {
        if (!validIds.has(Number(id))) {
          delete next[Number(id)];
        }
      }

      return next;
    });
  }, [settings]);

  /* =======================================================
     GROUP OPTIONS
     ======================================================= */

  const groups = useMemo(() => {
    const uniqueGroups = Array.from(
      new Set(settings.map((setting) => setting.setting_group)),
    );

    return uniqueGroups.sort();
  }, [settings]);

  /* =======================================================
     FILTER
     ======================================================= */

  const filteredSettings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return settings;
    }

    return settings.filter((setting) => {
      return (
        setting.setting_key.toLowerCase().includes(keyword) ||
        setting.setting_group.toLowerCase().includes(keyword) ||
        (setting.description || "").toLowerCase().includes(keyword)
      );
    });
  }, [settings, search]);

  /* =======================================================
     GROUP SETTINGS
     ======================================================= */

  const groupedSettings = useMemo(() => {
    return filteredSettings.reduce<Record<string, SystemSetting[]>>(
      (result, setting) => {
        if (!result[setting.setting_group]) {
          result[setting.setting_group] = [];
        }

        result[setting.setting_group].push(setting);

        return result;
      },
      {},
    );
  }, [filteredSettings]);

  /* =======================================================
     DIRTY SETTINGS COUNT
     ======================================================= */

  const dirtyCount = useMemo(() => {
    return settings.filter((setting) => {
      if (setting.is_encrypted) {
        return false;
      }

      const current = localValues[setting.id] ?? getValueForInput(setting);

      return current !== getValueForInput(setting);
    }).length;
  }, [settings, localValues]);

  /* =======================================================
     CHANGE VALUE
     ======================================================= */

  const handleValueChange = (setting: SystemSetting, value: string) => {
    setLocalValues((current) => ({
      ...current,
      [setting.id]: value,
    }));
  };

  /* =======================================================
     SAVE SINGLE
     ======================================================= */

  const handleSave = async (setting: SystemSetting) => {
    if (setting.is_encrypted) {
      return;
    }

    const rawValue = localValues[setting.id] ?? getValueForInput(setting);

    let value: unknown;

    try {
      value = parseInputValue(rawValue, setting.value_type);
    } catch (error) {
      console.error("INVALID SETTING VALUE:", error);
      return;
    }

    setSavingId(setting.id);

    try {
      const updated = await dispatch(
        updateSetting({
          group: setting.setting_group,
          key: setting.setting_key,
          value,
        }),
      ).unwrap();

      /*
       * Sinkronkan local value dengan response backend.
       */

      if (updated) {
        setLocalValues((current) => ({
          ...current,
          [updated.id]: getValueForInput(updated),
        }));
      }
    } finally {
      setSavingId(null);
    }
  };

  /* =======================================================
     TOGGLE STATUS
     ======================================================= */

  const handleToggle = async (setting: SystemSetting) => {
    setTogglingId(setting.id);

    try {
      await dispatch(
        toggleSettingStatus({
          group: setting.setting_group,
          key: setting.setting_key,
        }),
      ).unwrap();
    } finally {
      setTogglingId(null);
    }
  };

  /* =======================================================
     REFRESH
     ======================================================= */

  const handleRefresh = () => {
    dispatch(fetchSettings(filters));
  };

  /* =======================================================
     RESET FILTER
     ======================================================= */

  const handleReset = () => {
    setSearch("");

    dispatch(resetSettingFilters());
  };

  /* =======================================================
     SAVE ALL
     ======================================================= */

  const handleSaveAll = async () => {
    const payload = settings
      .filter((setting) => {
        if (setting.is_encrypted) {
          return false;
        }

        const current = localValues[setting.id] ?? getValueForInput(setting);

        return current !== getValueForInput(setting);
      })
      .map((setting) => {
        const rawValue = localValues[setting.id] ?? getValueForInput(setting);

        return {
          group: setting.setting_group,
          key: setting.setting_key,
          value: parseInputValue(rawValue, setting.value_type),
        };
      });

    if (payload.length === 0) {
      return;
    }

    try {
      const updated = await dispatch(
        updateSettingsBulk({
          settings: payload,
        }),
      ).unwrap();

      /*
       * Sinkronkan semua local values
       * dengan response backend.
       */

      if (updated.length > 0) {
        setLocalValues((current) => {
          const next = { ...current };

          for (const setting of updated) {
            next[setting.id] = getValueForInput(setting);
          }

          return next;
        });
      }
    } catch (error) {
      console.error("SAVE ALL ERROR:", error);
    }
  };

  /* =======================================================
     SUMMARY
     ======================================================= */

  const activeCount = settings.filter((setting) => setting.is_active).length;

  const inactiveCount = settings.length - activeCount;

  const groupCount = new Set(settings.map((setting) => setting.setting_group))
    .size;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="settings-page">
      {/* =================================================
          HEADER
         ================================================= */}

      <div className="settings-header">
        <div>
          <div className="settings-title-row">
            <SettingsIcon size={25} />

            <h1>Settings</h1>
          </div>

          <p>Kelola konfigurasi sistem ABN Fleet.</p>
        </div>

        <div className="settings-header-actions">
          {/* REFRESH */}

          <button
            type="button"
            className="settings-refresh-button"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            Refresh
          </button>

          {/* SAVE ALL */}

          <button
            type="button"
            className="settings-save-all-button"
            onClick={handleSaveAll}
            disabled={bulkLoading || loading || dirtyCount === 0}
          >
            {bulkLoading ? (
              <RefreshCw size={16} className="spin" />
            ) : (
              <Save size={16} />
            )}

            {bulkLoading
              ? "Saving..."
              : dirtyCount > 0
                ? `Save All (${dirtyCount})`
                : "Save All"}
          </button>
        </div>
      </div>

      {/* =================================================
          SUMMARY
         ================================================= */}

      <div className="settings-summary-grid">
        {/* TOTAL */}

        <div className="settings-summary-card">
          <div className="settings-summary-icon total">
            <Database size={19} />
          </div>

          <div>
            <span>Total Settings</span>

            <strong>{settings.length}</strong>
          </div>
        </div>

        {/* ACTIVE */}

        <div className="settings-summary-card">
          <div className="settings-summary-icon active">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Active</span>

            <strong>{activeCount}</strong>
          </div>
        </div>

        {/* INACTIVE */}

        <div className="settings-summary-card">
          <div className="settings-summary-icon inactive">
            <XCircle size={19} />
          </div>

          <div>
            <span>Inactive</span>

            <strong>{inactiveCount}</strong>
          </div>
        </div>

        {/* GROUPS */}

        <div className="settings-summary-card">
          <div className="settings-summary-icon groups">
            <SlidersHorizontal size={19} />
          </div>

          <div>
            <span>Groups</span>

            <strong>{groupCount}</strong>
          </div>
        </div>
      </div>

      {/* =================================================
          TOOLBAR
         ================================================= */}

      <div className="settings-toolbar">
        {/* SEARCH */}

        <div className="settings-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search setting..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>

        {/* GROUP */}

        <div className="settings-filter">
          <SlidersHorizontal size={16} />

          <select
            value={filters.group}
            onChange={(event) =>
              dispatch(
                setSettingFilter({
                  group: event.target.value,
                }),
              )
            }
          >
            <option value="">All Groups</option>

            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          <ChevronDown size={15} />
        </div>

        {/* STATUS */}

        <div className="settings-filter">
          <ShieldCheck size={16} />

          <select
            value={filters.active}
            onChange={(event) =>
              dispatch(
                setSettingFilter({
                  active: event.target.value,
                }),
              )
            }
          >
            <option value="">All Status</option>

            <option value="true">Active</option>

            <option value="false">Inactive</option>
          </select>

          <ChevronDown size={15} />
        </div>

        {/* RESET */}

        {(search || filters.group || filters.active) && (
          <button
            type="button"
            className="settings-reset-button"
            onClick={handleReset}
          >
            Reset
          </button>
        )}
      </div>

      {/* =================================================
          ERROR
         ================================================= */}

      {error && (
        <div className="settings-error">
          <AlertCircle size={17} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => dispatch(clearSettingsError())}
            aria-label="Close error"
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* =================================================
          CONTENT
         ================================================= */}

      {loading ? (
        <div className="settings-loading">
          <RefreshCw size={26} className="spin" />

          <strong>Loading settings...</strong>

          <span>Mengambil konfigurasi ABN Fleet.</span>
        </div>
      ) : filteredSettings.length === 0 ? (
        <div className="settings-empty">
          <SettingsIcon size={35} />

          <strong>No settings found</strong>

          <span>Belum ada konfigurasi yang sesuai dengan filter.</span>
        </div>
      ) : (
        <div className="settings-groups">
          {Object.entries(groupedSettings).map(([group, groupSettings]) => {
            const config = getGroupConfig(group);

            return (
              <section className="settings-group" key={group}>
                {/* =====================================
                      GROUP HEADER
                     ===================================== */}

                <div className="settings-group-header">
                  <div className="settings-group-title">
                    <div className="settings-group-icon">{config.icon}</div>

                    <div>
                      <h2>{config.label}</h2>

                      <p>{config.description}</p>
                    </div>
                  </div>

                  <span className="settings-group-count">
                    {groupSettings.length} settings
                  </span>
                </div>

                {/* =====================================
                      SETTINGS
                     ===================================== */}

                <div className="settings-grid">
                  {groupSettings.map((setting) => (
                    <SettingCard
                      key={setting.id}
                      setting={setting}
                      localValue={
                        localValues[setting.id] ?? getValueForInput(setting)
                      }
                      onChange={(value) => handleValueChange(setting, value)}
                      onSave={() => handleSave(setting)}
                      onToggle={() => handleToggle(setting)}
                      saving={updateLoading && savingId === setting.id}
                      toggling={statusLoading && togglingId === setting.id}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Settings;
