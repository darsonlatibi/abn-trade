import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { createPortal } from "react-dom";
import BinanceIcon from "../../icons/BinanceIcon";
import {
  //AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  //Cpu,
  TrendingUp,
  List,
  Zap,
  Wallet,
  History,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Inbox,
  PenLine,
  Send,
  FileEdit,
  Trash2,
  //Map,
  // MapPinned,
  MessageCircle,
  MessageSquare,
  Route,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  X,
  DollarSign,
  Bitcoin,
  Landmark,
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";

import { useSelector } from "react-redux";
import type { RootState } from "../../stores/store";

import "./Sidebar.css";
import logo from "../../assets/abn-logo.png";

/* =========================================================
   TYPES
   ========================================================= */

interface SidebarProps {
  onClose?: () => void;
}

interface MenuItem {
  label: string;

  path?: string;

  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;

  live?: boolean;

  adminOnly?: boolean;

  children?: MenuItem[];
}

/* =========================================================
   MENU ITEMS
   ========================================================= */

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "Trading",
    icon: TrendingUp,
    children: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/trading",
      },

      {
        label: "Markets",
        icon: BarChart3,
        children: [
          {
            label: "IDX",
            icon: BarChart3,
            path: "/trading/markets/idx",
          },
          {
            label: "Forex",
            icon: DollarSign,
            path: "/trading/markets/forex",
          },
          {
            label: "Crypto",
            icon: Bitcoin,
            path: "/trading/markets/crypto",
          },
          {
            label: "Binance",
            icon: BinanceIcon,
            path: "/trading/markets/binance",
          },
        ],
      },

      {
        label: "Brokers",
        icon: Landmark,
        children: [
          {
            label: "Finex",
            icon: Landmark,
            path: "/trading/brokers/finex",
          },
        ],
      },

      {
        label: "Watchlist",
        icon: List,
        path: "/trading/watchlist",
      },

      {
        label: "Signals",
        icon: Zap,
        path: "/trading/signals",
      },

      {
        label: "Orders",
        icon: ClipboardList,
        path: "/trading/orders",
      },

      {
        label: "Portfolio",
        icon: Wallet,
        path: "/trading/portfolio",
      },

      {
        label: "History",
        icon: History,
        path: "/trading/history",
      },
    ],
  },

  {
    label: "Operations",
    icon: Route,

    children: [
      // {
      //   label: "Trips",
      //   path: "/trips",
      //   icon: Map,
      // },
      // {
      //   label: "Geofence",
      //   path: "/geofence",
      //   icon: MapPinned,
      // },
      // {
      //   label: "Alerts",
      //   path: "/alerts",
      //   icon: AlertTriangle,
      // },
    ],
  },

  {
    label: "Monitoring",
    icon: BarChart3,

    children: [
      {
        label: "History",
        path: "/history",
        icon: History,
      },
      {
        label: "Reports",
        path: "/reports",
        icon: BarChart3,
      },
    ],
  },

  {
    label: "Integration",
    icon: ClipboardList,
    adminOnly: true,

    children: [
      {
        label: "SAP Integration",
        path: "/sap",
        icon: ClipboardList,
        adminOnly: true,
      },
    ],
  },

  {
    label: "Administration",
    icon: ShieldCheck,
    adminOnly: true,

    children: [
      {
        label: "Users",
        icon: Users,

        children: [
          {
            label: "Users List",
            path: "/users/list",
            icon: Users,
          },
          {
            label: "User Activity",
            path: "/users/activity",
            icon: History,
          },
        ],
      },

      {
        label: "Helpdesk",
        icon: LifeBuoy,

        children: [
          {
            label: "Helpdesk Tickets",
            path: "/helpdesk/tickets",
            icon: ClipboardList,
          },
          {
            label: "Helpdesk Messages",
            path: "/helpdesk/messages",
            icon: MessageSquare,
          },
          {
            label: "Notifications",
            path: "/helpdesk/notifications",
            icon: Bell,
          },
        ],
      },

      {
        label: "Mail",
        icon: Mail,

        children: [
          {
            label: "Inbox",
            path: "/mail/inbox",
            icon: Inbox,
          },
          {
            label: "Compose",
            path: "/mail/compose",
            icon: PenLine,
          },
          {
            label: "Sent",
            path: "/mail/sent",
            icon: Send,
          },
          {
            label: "Drafts",
            path: "/mail/drafts",
            icon: FileEdit,
          },
          {
            label: "Trash",
            path: "/mail/trash",
            icon: Trash2,
          },
        ],
      },

      {
        label: "Settings",
        path: "/settings",
        icon: Settings,
      },
    ],
  },
];
/* =========================================================
   ROUTE ACTIVE HELPER
   ========================================================= */

const isPathActive = (pathname: string, path?: string): boolean => {
  if (!path) {
    return false;
  }

  return pathname === path || pathname.startsWith(`${path}/`);
};

/* =========================================================
   MENU ACTIVE HELPER
   RECURSIVE
   ========================================================= */

const isMenuActive = (item: MenuItem, pathname: string): boolean => {
  if (item.path && isPathActive(pathname, item.path)) {
    return true;
  }

  if (item.children?.length) {
    return item.children.some((child) => isMenuActive(child, pathname));
  }

  return false;
};

/* =========================================================
   FILTER ACCESS
   ========================================================= */

const canAccessMenuItem = (
  item: MenuItem,
  canAccessAdmin: boolean,
): boolean => {
  if (item.adminOnly && !canAccessAdmin) {
    return false;
  }

  return true;
};

/* =========================================================
   CHECK VISIBLE CHILDREN
   ========================================================= */

const hasVisibleChildren = (
  item: MenuItem,
  canAccessAdmin: boolean,
): boolean => {
  if (!item.children?.length) {
    return false;
  }

  return item.children.some((child) => {
    if (!canAccessMenuItem(child, canAccessAdmin)) {
      return false;
    }

    if (child.path) {
      return true;
    }

    return hasVisibleChildren(child, canAccessAdmin);
  });
};

/* =========================================================
   SIDEBAR
   ========================================================= */

function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();

  const user = useSelector((state: RootState) => state.auth.user);

  /* =======================================================
     ROLE ACCESS
     ======================================================= */

  const canAccessAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  /* =======================================================
     STATE
     ======================================================= */

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const [showSupport, setShowSupport] = useState(false);

  const [showEmailOptions, setShowEmailOptions] = useState(false);

  const [showWhatsappOptions, setShowWhatsappOptions] = useState(false);

  /* =======================================================
     TOGGLE MENU
     ======================================================= */

  const toggleMenu = (key: string) => {
    setOpenMenus((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  /* =======================================================
     EMAIL
     ======================================================= */

  const openEmail = (email: string) => {
    const subject = encodeURIComponent("ABN Fleet Support");

    const body = encodeURIComponent(
      "Halo Tim ABN,\n\n" +
        "Saya membutuhkan bantuan terkait ABN Fleet.\n\n" +
        "Masalah:\n\n" +
        "Vehicle:\n\n" +
        "Device:\n\n" +
        "Lokasi:\n\n" +
        "Waktu kejadian:\n\n" +
        "Terima kasih.",
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    setShowEmailOptions(false);
  };

  /* =======================================================
     WHATSAPP
     ======================================================= */

  const openWhatsApp = (phone: string) => {
    const message = encodeURIComponent(
      "Halo Teknisi ABN,\n\n" +
        "Saya membutuhkan bantuan terkait ABN Fleet.\n\n" +
        "Masalah:\n",
    );

    window.open(
      `https://wa.me/${phone}?text=${message}`,
      "_blank",
      "noopener,noreferrer",
    );

    setShowWhatsappOptions(false);
  };

  /* =======================================================
     CLOSE SUPPORT
     ======================================================= */

  const closeSupport = () => {
    setShowSupport(false);
    setShowEmailOptions(false);
    setShowWhatsappOptions(false);
  };

  /* =======================================================
     AUTO OPEN ACTIVE MENUS
     ======================================================= */

  useEffect(() => {
    const activeKeys: string[] = [];

    const collectActiveParents = (
      items: MenuItem[],
      parentKeys: string[] = [],
    ) => {
      for (const item of items) {
        const currentKey = [...parentKeys, item.label].join("/");

        if (item.children?.length && isMenuActive(item, location.pathname)) {
          activeKeys.push(currentKey);

          collectActiveParents(item.children, [...parentKeys, item.label]);
        }
      }
    };

    collectActiveParents(menuItems);

    if (!activeKeys.length) {
      return;
    }

    setOpenMenus((current) => {
      const next = { ...current };

      let changed = false;

      for (const key of activeKeys) {
        if (!next[key]) {
          next[key] = true;
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [location.pathname]);

  /* =======================================================
     ESCAPE KEY
     ======================================================= */

  useEffect(() => {
    if (!showSupport) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSupport();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showSupport]);

  /* =======================================================
     BODY SCROLL LOCK
     ======================================================= */

  useEffect(() => {
    if (!showSupport) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showSupport]);

  /* =======================================================
     RECURSIVE MENU RENDERER
     ======================================================= */

  const renderMenuItems = (
    items: MenuItem[],
    level = 0,
    parentKeys: string[] = [],
  ): ReactNode => {
    return items.map((item) => {
      /* ===================================================
         ROLE ACCESS
         =================================================== */

      if (!canAccessMenuItem(item, canAccessAdmin)) {
        return null;
      }

      /* ===================================================
         CHECK CHILDREN
         =================================================== */

      const visibleChildren = hasVisibleChildren(item, canAccessAdmin);

      const hasChildren = Boolean(item.children?.length && visibleChildren);

      const Icon = item.icon;

      /* ===================================================
         MENU KEY
         =================================================== */

      const menuKey = [...parentKeys, item.label].join("/");

      /* ===================================================
         PARENT MENU
         =================================================== */

      if (hasChildren) {
        const isOpen = Boolean(openMenus[menuKey]);

        const isParentActive = isMenuActive(item, location.pathname);

        const submenuId = `${menuKey
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}-submenu`;

        /* =================================================
           ROOT LEVEL
           ================================================= */

        if (level === 0) {
          return (
            <div
              key={menuKey}
              className={`sidebar-menu-group ${isOpen ? "open" : ""}`}
            >
              <button
                type="button"
                className={`sidebar-link sidebar-parent-link ${
                  isParentActive ? "active" : ""
                }`}
                onClick={() => toggleMenu(menuKey)}
                aria-expanded={isOpen}
                aria-controls={submenuId}
              >
                <span className="sidebar-link-icon">
                  <Icon size={18} strokeWidth={2} />
                </span>

                <span className="sidebar-link-label">{item.label}</span>

                <span className={`sidebar-chevron ${isOpen ? "open" : ""}`}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </span>
              </button>

              <div
                id={submenuId}
                className={`sidebar-submenu ${isOpen ? "open" : ""}`}
              >
                {renderMenuItems(item.children!, level + 1, [
                  ...parentKeys,
                  item.label,
                ])}
              </div>
            </div>
          );
        }

        /* =================================================
           NESTED PARENT
           ================================================= */

        return (
          <div
            key={menuKey}
            className={`sidebar-nested-group ${isOpen ? "open" : ""}`}
          >
            <button
              type="button"
              className={`sidebar-submenu-link sidebar-nested-parent ${
                isParentActive ? "active" : ""
              }`}
              onClick={() => toggleMenu(menuKey)}
              aria-expanded={isOpen}
              aria-controls={submenuId}
            >
              <span className="sidebar-submenu-line" />

              <span className="sidebar-submenu-icon">
                <Icon size={16} strokeWidth={2} />
              </span>

              <span className="sidebar-submenu-label">{item.label}</span>

              <span className={`sidebar-chevron ${isOpen ? "open" : ""}`}>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </button>

            <div
              id={submenuId}
              className={`sidebar-nested-submenu ${isOpen ? "open" : ""}`}
            >
              {renderMenuItems(item.children!, level + 1, [
                ...parentKeys,
                item.label,
              ])}
            </div>
          </div>
        );
      }

      /* ===================================================
         NORMAL LINK
         =================================================== */

      if (!item.path) {
        return null;
      }

      const isActive = isPathActive(location.pathname, item.path);

      /* ===================================================
         ROOT LINK
         =================================================== */

      if (level === 0) {
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`sidebar-link${isActive ? " active" : ""}${
              item.live ? " tracking-link" : ""
            }`}
            onClick={onClose}
          >
            <span className="sidebar-link-icon">
              <Icon size={18} strokeWidth={2} />
            </span>

            <span className="sidebar-link-label">{item.label}</span>

            {item.live && <span className="sidebar-live">LIVE</span>}
          </NavLink>
        );
      }

      /* ===================================================
         NESTED LINK
         =================================================== */

      return (
        <NavLink
          key={item.path}
          to={item.path}
          className={`sidebar-submenu-link${isActive ? " active" : ""}`}
          onClick={onClose}
        >
          <span className="sidebar-submenu-line" />

          <span className="sidebar-submenu-icon">
            <Icon size={16} strokeWidth={2} />
          </span>

          <span className="sidebar-submenu-label">{item.label}</span>
        </NavLink>
      );
    });
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      <aside className="sidebar">
        {/* ===================================================
            BRAND
            =================================================== */}

        <div className="sidebar-brand">
          <div className="brand-mark">
            <img src={logo} alt="ABN Tracker Logo" />
          </div>

          <div className="brand-text">
            <strong>AGRO BERKAH NUSANTARA</strong>

            <span>ABN WATER MANAGEMENT SYSTEM</span>
          </div>

          {onClose && (
            <button
              type="button"
              className="sidebar-close"
              onClick={onClose}
              aria-label="Close navigation"
              title="Close navigation"
            >
              <X size={19} />
            </button>
          )}
        </div>

        {/* ===================================================
            LIVE SYSTEM STATUS
            =================================================== */}

        <div className="sidebar-status-card">
          <div className="sidebar-status-icon">
            <Truck size={17} />
          </div>

          <div className="sidebar-status-info">
            <strong>FLEET MONITORING</strong>

            <span>
              <i />
              System Online
            </span>
          </div>
        </div>

        {/* ===================================================
            MAIN MENU
            =================================================== */}

        <div className="sidebar-section">
          <span className="sidebar-section-title">MAIN MENU</span>

          <nav className="sidebar-nav" aria-label="Main navigation">
            {renderMenuItems(menuItems)}
          </nav>
        </div>

        {/* ===================================================
            BOTTOM
            =================================================== */}

        <div className="sidebar-bottom">
          {/* =================================================
              ABN SUPPORT
              ================================================= */}

          <button
            type="button"
            className="sidebar-help"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              setShowSupport(true);
              setShowEmailOptions(false);
              setShowWhatsappOptions(false);
            }}
            aria-haspopup="dialog"
            aria-expanded={showSupport}
          >
            <CircleHelp size={18} strokeWidth={2} />

            <div>
              <strong>ABN Support</strong>

              <span>System assistance</span>
            </div>
          </button>

          {/* =================================================
              SYSTEM VERSION
              ================================================= */}

          <NavLink
            to="/about"
            className="sidebar-system"
            onClick={onClose}
            aria-label="About ABN Fleet System"
          >
            <div className="sidebar-system-top">
              <CheckCircle2 size={14} />

              <strong>ABN FLEET SYSTEM</strong>
            </div>

            <div className="sidebar-system-bottom">
              <span>Version 1.0.0</span>

              <span>ONLINE</span>
            </div>
          </NavLink>
        </div>
      </aside>

      {/* =====================================================
          ABN SUPPORT MODAL
          ===================================================== */}

      {showSupport &&
        createPortal(
          <div
            className="support-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeSupport();
              }
            }}
          >
            <div
              className="support-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="support-modal-title"
            >
              {/* =============================================
                  HEADER
                  ============================================= */}

              <div className="support-modal-header">
                <div className="support-modal-title">
                  <div className="support-modal-icon">
                    <CircleHelp size={21} strokeWidth={2} />
                  </div>

                  <div>
                    <h3 id="support-modal-title">ABN Support</h3>

                    <span>System assistance</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="support-modal-close"
                  onClick={closeSupport}
                  aria-label="Close support"
                  title="Close"
                >
                  <X size={19} />
                </button>
              </div>

              {/* =============================================
                  BODY
                  ============================================= */}

              <div className="support-modal-body">
                <p className="support-modal-description">
                  Hubungi teknisi ABN apabila mengalami masalah pada sistem, GPS
                  tracker, modem, kendaraan, atau monitoring fleet.
                </p>

                <div className="support-options">
                  {/* =========================================
                      EMAIL
                      ========================================= */}

                  <button
                    type="button"
                    className="support-option support-option-email"
                    onClick={() => {
                      setShowEmailOptions((current) => !current);

                      setShowWhatsappOptions(false);
                    }}
                  >
                    <div className="support-option-icon">
                      <Mail size={21} strokeWidth={2} />
                    </div>

                    <div className="support-option-content">
                      <strong>Email Teknisi ABN</strong>

                      <span>Kirim laporan masalah melalui email</span>
                    </div>
                  </button>

                  {/* =========================================
                      WHATSAPP
                      ========================================= */}

                  <button
                    type="button"
                    className="support-option support-option-whatsapp"
                    onClick={() => {
                      setShowWhatsappOptions((current) => !current);

                      setShowEmailOptions(false);
                    }}
                  >
                    <div className="support-option-icon">
                      <MessageCircle size={21} strokeWidth={2} />
                    </div>

                    <div className="support-option-content">
                      <strong>WhatsApp Teknisi ABN</strong>

                      <span>
                        Pilih teknisi untuk mendapatkan bantuan langsung
                      </span>
                    </div>
                  </button>
                </div>

                {/* =========================================
                    EMAIL OPTIONS
                    ========================================= */}

                {showEmailOptions && (
                  <div className="email-options">
                    <div className="email-options-title">
                      <Mail size={15} />

                      <span>Pilih Email Support</span>
                    </div>

                    <button
                      type="button"
                      className="email-contact"
                      onClick={() => openEmail("support@abnfleet.com")}
                    >
                      <div className="email-contact-icon">
                        <Mail size={18} />
                      </div>

                      <div className="email-contact-content">
                        <strong>ABN Support</strong>

                        <span>support@abnfleet.com</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="email-contact"
                      onClick={() => openEmail("technical@abnfleet.com")}
                    >
                      <div className="email-contact-icon">
                        <Mail size={18} />
                      </div>

                      <div className="email-contact-content">
                        <strong>ABN Technical</strong>

                        <span>technical@abnfleet.com</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* =========================================
                    WHATSAPP OPTIONS
                    ========================================= */}

                {showWhatsappOptions && (
                  <div className="whatsapp-options">
                    <div className="whatsapp-options-title">
                      <MessageCircle size={15} />

                      <span>Pilih WhatsApp Teknisi</span>
                    </div>

                    <button
                      type="button"
                      className="whatsapp-contact"
                      onClick={() => openWhatsApp("6281249055555")}
                    >
                      <div className="whatsapp-contact-icon">
                        <MessageCircle size={18} />
                      </div>

                      <div className="whatsapp-contact-content">
                        <strong>Teknisi ABN 1</strong>

                        <span>+62 812-4905-5555</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="whatsapp-contact"
                      onClick={() => openWhatsApp("62811447622")}
                    >
                      <div className="whatsapp-contact-icon">
                        <MessageCircle size={18} />
                      </div>

                      <div className="whatsapp-contact-content">
                        <strong>Teknisi ABN 2</strong>

                        <span>+62 811-4476-22</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* =========================================
                    SUPPORT NOTE
                    ========================================= */}

                <div className="support-modal-note">
                  <CheckCircle2 size={15} />

                  <span>
                    Tim support ABN siap membantu masalah operasional dan
                    perangkat tracker.
                  </span>
                </div>
              </div>

              {/* =============================================
                  FOOTER
                  ============================================= */}

              <div className="support-modal-footer">
                <button
                  type="button"
                  className="support-modal-cancel"
                  onClick={closeSupport}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default Sidebar;
