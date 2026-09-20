import { useState } from "react";
import type { FormEvent } from "react";
import { useDispatch } from "react-redux";
import { LockKeyhole, LogIn, Mail, UserPlus, Handshake } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import type { AppDispatch } from "../../stores/store";

import { login } from "../../features/auth/authSlice";

import "./Login.css";
import logo from "../../assets/abn-logo.png";
/* =========================================================
   ABN FLEET SYSTEM
   LOGIN PAGE
   ========================================================= */

function Login() {
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();

  /* =======================================================
     FORM STATE
     ======================================================= */

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     SUBMIT
     ======================================================= */

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    /* =====================================================
       VALIDATION
       ===================================================== */

    if (!normalizedEmail) {
      setError("Email wajib diisi.");

      setLoading(false);

      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      setError("Format email tidak valid.");

      setLoading(false);

      return;
    }

    if (!password) {
      setError("Password wajib diisi.");

      setLoading(false);

      return;
    }

    /* =====================================================
       LOGIN
       ===================================================== */

    try {
      const result = await dispatch(
        login({
          email: normalizedEmail,
          password,
        }),
      ).unwrap();

      console.log("ABN LOGIN SUCCESS:", result);

      /* ===================================================
         DASHBOARD
         =================================================== */

      navigate("/trading/markets/binance", {
        replace: true,
      });
    } catch (err) {
      console.error("ABN LOGIN ERROR:", err);

      setError(typeof err === "string" ? err : "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="login-page">
      <section className="login-card">
        {/* =================================================
            HEADER
            ================================================= */}

        <div className="login-header">
          <div className="login-logo">
            <img src={logo} alt="ABN Fleet System" />
          </div>

          <h1>PT Agro Berkah Nusantara</h1>

          <p>Fleet Tracking &amp; Monitoring System</p>
        </div>

        {/* =================================================
            FORM
            ================================================= */}

        <form className="login-form" onSubmit={handleSubmit} autoComplete="on">
          {/* EMAIL */}

          <div className="form-group">
            <label htmlFor="email">Email</label>

            <div className="input-wrapper">
              <Mail size={18} aria-hidden="true" />

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);

                  setError("");
                }}
                placeholder="Masukkan email"
                autoComplete="email"
                maxLength={150}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* PASSWORD */}

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <div className="input-wrapper">
              <LockKeyhole size={18} aria-hidden="true" />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);

                  setError("");
                }}
                placeholder="Masukkan password"
                autoComplete="current-password"
                disabled={loading}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                disabled={loading}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* FORGOT PASSWORD */}

            <div className="forgot-password-wrapper">
              <Link to="/forgot-password" className="forgot-password-link">
                Lupa Password?
              </Link>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          {/* LOGIN */}

          <button type="submit" className="login-button" disabled={loading}>
            <LogIn size={18} aria-hidden="true" />

            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>

          {/* REGISTER */}

          <Link to="/register" className="register-link-button">
            <UserPlus size={18} aria-hidden="true" />
            DAFTAR USER
          </Link>
        </form>
        {/* =================================================
          BUSINESS / PARTNERSHIP
          ================================================= */}

        <div className="login-business">
          <div className="login-business-text">
            <span>Butuh solusi fleet tracking untuk bisnis Anda?</span>

            <Link to="/contact" className="business-link">
              <Handshake size={16} aria-hidden="true" />
              Pembelian, Demo & Kerja Sama
            </Link>
          </div>
        </div>
        {/* FOOTER */}

        <div className="login-footer">
          <span>ABN Fleet System</span>

          <span>V1.0</span>
        </div>
      </section>
    </main>
  );
}

export default Login;
