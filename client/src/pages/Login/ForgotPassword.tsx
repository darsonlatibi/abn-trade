import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, KeyRound, Mail, Send } from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../api/axios";

import "./ForgotPassword.css";
import logo from "../../assets/abn-logo.png";
/* =========================================================
   ABN TRACKER
   FORGOT PASSWORD PAGE
   ========================================================= */

interface ForgotPasswordResponse {
  success?: boolean;
  message?: string;
}

/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

function ForgotPassword() {
  /* =======================================================
     FORM STATE
     ======================================================= */

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

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

    setSuccess("");

    /* =====================================================
       NORMALIZE EMAIL
       ===================================================== */

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

    if (normalizedEmail.length > 150) {
      setError("Email maksimal 150 karakter.");

      setLoading(false);

      return;
    }

    /* =====================================================
       REQUEST
       ===================================================== */

    try {
      const response = await api.post<ForgotPasswordResponse>(
        "/auth/forgot-password",
        {
          email: normalizedEmail,
        },
      );

      console.log("ABN FORGOT PASSWORD RESPONSE:", response.data);

      /* ===================================================
         SUCCESS
         =================================================== */

      setSuccess(
        response.data?.message ||
          "Jika email terdaftar, instruksi reset password telah dikirim.",
      );

      setEmail("");
    } catch (err: any) {
      console.error("ABN FORGOT PASSWORD ERROR:", err);

      /* ===================================================
         SERVER RESPONSE
         =================================================== */

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Gagal memproses permintaan reset password.",
        );
      } else if (err.request) {
        /* =================================================
           SERVER TIDAK TERHUBUNG
           ================================================= */

        setError(
          "ABN SERVER tidak dapat dihubungi. Pastikan server :5000 aktif.",
        );
      } else {
        /* =================================================
           UNKNOWN ERROR
           ================================================= */

        setError("Terjadi kesalahan saat meminta reset password.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="forgot-password-page">
      <section className="forgot-password-card">
        {/* =================================================
            HEADER
            ================================================= */}

        <div className="forgot-password-header">
          <div className="forgot-password-brand">
            <img
              src={logo}
              alt="ABN Fleet System"
              className="forgot-password-logo"
            />
          </div>

          <h1>PT TIGA KAWAN JAYA</h1>

          <p>Reset Password Account</p>
        </div>

        {/* =================================================
            ALERT
            ================================================= */}

        {(error || success) && (
          <div className="forgot-password-alert">
            {error && (
              <div className="forgot-password-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="forgot-password-success" role="status">
                {success}
              </div>
            )}
          </div>
        )}

        {/* =================================================
            FORM
            ================================================= */}

        <form
          className="forgot-password-form"
          onSubmit={handleSubmit}
          autoComplete="on"
        >
          {/* =================================================
              EMAIL
              ================================================= */}

          <div className="form-group">
            <label htmlFor="forgot-email">Email</label>

            <div className="forgot-input-wrapper">
              <Mail size={18} aria-hidden="true" />

              <input
                id="forgot-email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);

                  setError("");

                  setSuccess("");
                }}
                placeholder="Masukkan email akun"
                autoComplete="email"
                maxLength={150}
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* =================================================
              INFO
              ================================================= */}

          <div className="forgot-password-info">
            <KeyRound size={17} aria-hidden="true" />

            <span>
              Masukkan email yang terdaftar. Jika email ditemukan, link reset
              password akan dikirim ke email Anda.
            </span>
          </div>

          {/* =================================================
              SUBMIT
              ================================================= */}

          <button
            type="submit"
            className="forgot-password-button"
            disabled={loading}
          >
            <Send size={18} aria-hidden="true" />

            {loading ? "MENGIRIM..." : "KIRIM LINK RESET"}
          </button>
        </form>

        {/* =================================================
            BACK LOGIN
            ================================================= */}

        <Link to="/login" className="back-login-button">
          <ArrowLeft size={17} aria-hidden="true" />
          KEMBALI KE LOGIN
        </Link>

        {/* =================================================
            FOOTER
            ================================================= */}

        <div className="forgot-password-footer">
          <span>ABN Fleet System</span>

          <span>V1.0</span>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;
