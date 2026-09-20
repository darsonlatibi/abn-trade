import { useState } from "react";
import type { FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import type { AppDispatch, RootState } from "../../stores/store";

import { register } from "../../features/auth/authSlice";

import "./Register.css";
import logo from "../../assets/abn-logo.png";
/* =========================================================
   ABN FLEET SYSTEM
   REGISTER PAGE
   ========================================================= */

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  /* =======================================================
     FORM STATE
     ======================================================= */

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const authLoading = useSelector((state: RootState) => state.auth.loading);

  /* =======================================================
     INPUT HANDLER
     ======================================================= */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =======================================================
     REGISTER
     ======================================================= */

  /* =======================================================
   REGISTER
   ======================================================= */

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (authLoading) {
      return;
    }

    setError("");
    setSuccess("");

    const email = formData.email.trim().toLowerCase();
    const full_name = formData.full_name.trim();

    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    /* =====================================================
     VALIDATION
     ===================================================== */

    if (!full_name) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (full_name.length > 150) {
      setError("Nama lengkap maksimal 150 karakter.");
      return;
    }

    if (!email) {
      setError("Email wajib diisi.");
      return;
    }

    if (email.length > 150) {
      setError("Email maksimal 150 karakter.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Format email tidak valid.");
      return;
    }

    if (!password) {
      setError("Password wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    /* =====================================================
     SUBMIT REDUX
     ===================================================== */

    try {
      const result = await dispatch(
        register({
          email,
          password,
          full_name,
        }),
      ).unwrap();

      setSuccess(result.message || "Registrasi berhasil.");

      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        full_name: "",
      });

      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);
    } catch (err) {
      console.error("ABN REGISTER ERROR:", err);

      setError(
        typeof err === "string" ? err : "Registrasi gagal. Silakan coba lagi.",
      );
    }
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="register-page">
      <section className="register-card">
        {/* =================================================
            HEADER / LOGO
            ================================================= */}

        <div className="register-header">
          <div className="register-logo-wrapper">
            <img src={logo} alt="ABN Fleet System" className="register-logo" />
          </div>

          <h1>PT TIGA KAWAN JAYA</h1>

          <p>Fleet Tracking &amp; Monitoring System</p>

          <span className="register-subtitle">Buat akun baru</span>
        </div>

        {/* =================================================
            ERROR
            ================================================= */}

        {error && (
          <div className="register-alert register-error" role="alert">
            {error}
          </div>
        )}

        {/* =================================================
            SUCCESS
            ================================================= */}

        {success && (
          <div className="register-alert register-success" role="status">
            {success}
          </div>
        )}

        {/* =================================================
            FORM
            ================================================= */}

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* FULL NAME */}

          <div className="form-group">
            <label htmlFor="full_name">Nama Lengkap</label>

            <input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              maxLength={150}
              autoComplete="name"
              disabled={authLoading}
              required
            />
          </div>

          {/* EMAIL */}

          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Masukkan email"
              maxLength={150}
              autoComplete="email"
              disabled={authLoading}
              required
            />
          </div>

          {/* PASSWORD */}

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
              disabled={authLoading}
              required
            />
          </div>

          {/* CONFIRM PASSWORD */}

          <div className="form-group">
            <label htmlFor="confirmPassword">Konfirmasi Password</label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Ulangi password"
              autoComplete="new-password"
              disabled={authLoading}
              required
            />
          </div>

          {/* REGISTER BUTTON */}

          <button
            type="submit"
            disabled={authLoading}
            className="register-button"
          >
            {authLoading ? "MENDAFTARKAN..." : "DAFTAR USER"}
          </button>
        </form>

        {/* =================================================
            LOGIN
            ================================================= */}

        <div className="register-login-section">
          <div className="register-login-divider">
            <span>Sudah punya akun?</span>
          </div>

          <Link to="/login" className="register-login-button">
            LOGIN
          </Link>
        </div>

        {/* =================================================
            FOOTER
            ================================================= */}

        <div className="register-footer">
          <span>ABN Fleet System</span>

          <span>V1.0</span>
        </div>
      </section>
    </main>
  );
};

export default Register;
