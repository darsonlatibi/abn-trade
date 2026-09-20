import { useEffect, useState } from "react";
import {
  Bell,
  Home,
  LogOut,
  Menu,
  Radio,
  Server,
  UserCircle,
  Contact,
  Sun,
  Moon,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";

import type { AppDispatch, RootState } from "../../stores/store";

import { clearAuth } from "../../features/auth/authSlice";

import api from "../../api/axios";

import "./Header.css";

interface HeaderProps {
  onMenuClick?: () => void;
}

/* =========================================================
   ABN FLEET SYSTEM
   APPLICATION HEADER
   ========================================================= */

function Header({ onMenuClick }: HeaderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("abn-theme");

    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  /* =====================================================
     LOGOUT
     ===================================================== */

  const handleLogout = async () => {
    try {
      /*
       * Hapus refresh-token / session
       * melalui backend.
       *
       * Backend:
       * POST /api/auth/logout
       *
       * HttpOnly refresh cookie akan
       * dibersihkan oleh server.
       */
      await api.post(
        "/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );

      console.log("ABN LOGOUT: server logout success");
    } catch (error) {
      /*
       * Walaupun server logout gagal,
       * authentication state lokal tetap
       * harus dibersihkan.
       */
      console.error("ABN LOGOUT ERROR:", error);
    } finally {
      /*
       * Bersihkan:
       * - user
       * - accessToken
       * - authenticated
       * - loading
       * - refreshing
       * - error
       */
      dispatch(clearAuth());

      /*
       * Kembali ke login.
       */
      navigate("/login", {
        replace: true,
      });
    }
  };
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("abn-theme", theme);
  }, [theme]);
  return (
    <header className="app-header">
      {/* =====================================================
          LEFT
          ===================================================== */}
      <div className="header-left">
        {/* MENU */}

        <button
          type="button"
          className="header-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          title="Open navigation"
        >
          <Menu size={21} strokeWidth={2} />
        </button>

        {/* ===================================================
            QUICK NAVIGATION
            =================================================== */}

        <nav className="header-nav" aria-label="Quick navigation">
          {/* HOME */}

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `header-nav-link ${isActive ? "active" : ""}`
            }
          >
            <Home size={16} strokeWidth={2} />

            <span>HOME</span>
          </NavLink>

          {/* CONTACT */}

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `header-nav-link ${isActive ? "active" : ""}`
            }
          >
            <Contact size={18} strokeWidth={2} />
            <span>CONTACT</span>
          </NavLink>
        </nav>
      </div>
      {/* =====================================================
          RIGHT
          ===================================================== */}

      <div className="header-right">
        {/* ===================================================
      SERVER STATUS
      =================================================== */}

        <div className="header-server">
          <div className="header-server-icon">
            <Server size={16} />
          </div>

          <div className="header-server-info">
            <div className="header-server-top">
              <span className="header-status-dot" />

              <strong>SERVER ONLINE</strong>
            </div>

            <span>ABN SERVER :5000</span>
          </div>
        </div>

        {/* ===================================================
      WEBSOCKET
      =================================================== */}

        <div className="header-connection" title="WebSocket connection">
          <Radio size={17} />

          <span>REALTIME</span>

          <i />
        </div>

        {/* ===================================================
      THEME
      =================================================== */}

        <button
          type="button"
          className="header-icon-button theme-button"
          onClick={() => {
            setTheme((current) => (current === "dark" ? "light" : "dark"));
          }}
          aria-label={
            theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
          }
          title={
            theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
          }
        >
          {theme === "dark" ? (
            <Sun size={18} strokeWidth={2} />
          ) : (
            <Moon size={18} strokeWidth={2} />
          )}
        </button>

        {/* ===================================================
      NOTIFICATION
      =================================================== */}

        <button
          type="button"
          className="header-icon-button notification-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={18} strokeWidth={2} />

          <span className="notification-badge">2</span>
        </button>

        {/* ===================================================
      USER
      =================================================== */}

        <div className="header-user">
          <div className="header-user-avatar">
            <UserCircle size={32} strokeWidth={1.7} />
          </div>

          <div className="header-user-info">
            <strong>{user?.full_name || user?.username || "ABN User"}</strong>

            <span>{user?.role || "VIEWER"}</span>
          </div>
        </div>

        {/* ===================================================
      LOGOUT
      =================================================== */}

        <button
          type="button"
          className="header-logout-button"
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={18} strokeWidth={2} />

          <span>LOGOUT</span>
        </button>
      </div>
    </header>
  );
}

/* =========================================================
   TRUCK LOGO
   ========================================================= */

// function TruckLogo() {
//   return (
//     <svg
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       aria-hidden="true"
//     >
//       <path
//         d="M3 6.5C3 5.67 3.67 5 4.5 5H14.5C15.33 5 16 5.67 16 6.5V15H3V6.5Z"
//         stroke="currentColor"
//         strokeWidth="1.8"
//       />

//       <path
//         d="M16 9H19L21 12V15H16V9Z"
//         stroke="currentColor"
//         strokeWidth="1.8"
//         strokeLinejoin="round"
//       />

//       <circle cx="7" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" />

//       <circle cx="18" cy="17" r="2" stroke="currentColor" strokeWidth="1.8" />

//       <path d="M9 17H16" stroke="currentColor" strokeWidth="1.8" />
//     </svg>
//   );
// }

export default Header;
