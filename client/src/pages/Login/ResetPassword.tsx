import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  Save,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import api from "../../api/axios";

import "./ResetPassword.css";
import logo from "../../assets/abn-logo.png";
/* =========================================================
   ABN FLEET SYSTEM
   RESET PASSWORD PAGE
   ========================================================= */

interface ResetPasswordResponse {
  success?: boolean;
  message?: string;
}

/* =========================================================
   RESET PASSWORD
   ========================================================= */

function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  /* =======================================================
     TOKEN
     ======================================================= */

  const token = useMemo(() => {
    return searchParams.get("token")?.trim() || "";
  }, [searchParams]);

  /* =======================================================
     FORM STATE
     ======================================================= */

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* =======================================================
     REQUEST STATE
     ======================================================= */

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
       TOKEN VALIDATION
       ===================================================== */

    if (!token) {
      setError("Link reset password tidak valid atau token tidak ditemukan.");

      setLoading(false);

      return;
    }

    /* =====================================================
       PASSWORD VALIDATION
       ===================================================== */

    if (!password) {
      setError("Password baru wajib diisi.");

      setLoading(false);

      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");

      setLoading(false);

      return;
    }

    /* =====================================================
       CONFIRM PASSWORD
       ===================================================== */

    if (!confirmPassword) {
      setError("Konfirmasi password wajib diisi.");

      setLoading(false);

      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");

      setLoading(false);

      return;
    }

    /* =====================================================
       RESET PASSWORD REQUEST
       ===================================================== */

    try {
      const response = await api.post<ResetPasswordResponse>(
        "/auth/reset-password",
        {
          token,
          password,
          confirmPassword,
        },
      );

      console.log("ABN RESET PASSWORD RESPONSE:", response.data);

      /* ===================================================
         SUCCESS
         =================================================== */

      setSuccess(
        response.data?.message ||
          "Password berhasil diubah. Silakan login kembali.",
      );

      /* ===================================================
         CLEAR PASSWORD
         =================================================== */

      setPassword("");

      setConfirmPassword("");

      /* ===================================================
         REDIRECT LOGIN
         =================================================== */

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1800);
    } catch (err: any) {
      console.error("ABN RESET PASSWORD ERROR:", err);

      /* ===================================================
         SERVER RESPONSE
         =================================================== */

      if (err.response) {
        setError(
          err.response.data?.message || "Gagal melakukan reset password.",
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

        setError("Terjadi kesalahan saat melakukan reset password.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INVALID TOKEN PAGE
     ======================================================= */

  if (!token) {
    return (
      <main className="reset-password-page">
        <section className="reset-password-card">
          {/* ===============================================
              HEADER
              =============================================== */}

          <div className="reset-password-header">
            <div className="reset-password-brand">
              <img
                src={logo}
                alt="ABN Fleet System"
                className="reset-password-logo"
              />
            </div>

            <h1>PT TIGA KAWAN JAYA</h1>

            <p>Reset Password</p>
          </div>

          {/* ===============================================
              ERROR
              =============================================== */}

          <div className="reset-password-alert">
            <div className="reset-password-error" role="alert">
              Link reset password tidak valid. Silakan meminta link reset
              password baru.
            </div>
          </div>

          {/* ===============================================
              FORGOT PASSWORD
              =============================================== */}

          <Link
            to="/forgot-password"
            className="reset-password-secondary-button"
          >
            <KeyRound size={17} aria-hidden="true" />
            MINTA LINK RESET BARU
          </Link>

          {/* ===============================================
              LOGIN
              =============================================== */}

          <Link to="/login" className="back-login-button">
            <ArrowLeft size={17} aria-hidden="true" />
            KEMBALI KE LOGIN
          </Link>

          {/* ===============================================
              FOOTER
              =============================================== */}

          <div className="reset-password-footer">
            <span>ABN Fleet System</span>

            <span>V1.0</span>
          </div>
        </section>
      </main>
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="reset-password-page">
      <section className="reset-password-card">
        {/* =================================================
            HEADER
            ================================================= */}

        <div className="reset-password-header">
          <div className="reset-password-brand">
            <img
              src="/assets/logo.png"
              alt="ABN Fleet System"
              className="reset-password-logo"
            />
          </div>

          <h1>ABN FLEET SYSTEM</h1>

          <p>Buat Password Baru</p>
        </div>

        {/* =================================================
            ALERT
            ================================================= */}

        {(error || success) && (
          <div className="reset-password-alert">
            {error && (
              <div className="reset-password-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="reset-password-success" role="status">
                <CheckCircle2 size={17} aria-hidden="true" />

                <span>{success}</span>
              </div>
            )}
          </div>
        )}

        {/* =================================================
            FORM
            ================================================= */}

        <form
          className="reset-password-form"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          {/* =================================================
              PASSWORD
              ================================================= */}

          <div className="form-group">
            <label htmlFor="password">Password Baru</label>

            <div className="reset-input-wrapper">
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
                placeholder="Masukkan password baru"
                autoComplete="new-password"
                minLength={6}
                maxLength={100}
                disabled={loading || !!success}
                required
              />

              <button
                type="button"
                className="reset-password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                disabled={loading || !!success}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* =================================================
              CONFIRM PASSWORD
              ================================================= */}

          <div className="form-group">
            <label htmlFor="confirmPassword">Konfirmasi Password</label>

            <div className="reset-input-wrapper">
              <LockKeyhole size={18} aria-hidden="true" />

              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);

                  setError("");
                }}
                placeholder="Ulangi password baru"
                autoComplete="new-password"
                minLength={6}
                maxLength={100}
                disabled={loading || !!success}
                required
              />

              <button
                type="button"
                className="reset-password-toggle"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={
                  showConfirmPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
                disabled={loading || !!success}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* =================================================
              PASSWORD INFO
              ================================================= */}

          <div className="reset-password-info">
            <KeyRound size={17} aria-hidden="true" />

            <span>Password harus memiliki minimal 6 karakter.</span>
          </div>

          {/* =================================================
              SUBMIT
              ================================================= */}

          <button
            type="submit"
            className="reset-password-button"
            disabled={loading || !!success}
          >
            <Save size={18} aria-hidden="true" />

            {loading ? "MENYIMPAN..." : "UBAH PASSWORD"}
          </button>
        </form>

        {/* =================================================
            BACK LOGIN
            ================================================= */}

        {!success && (
          <Link to="/login" className="back-login-button">
            <ArrowLeft size={17} aria-hidden="true" />
            KEMBALI KE LOGIN
          </Link>
        )}

        {/* =================================================
            FOOTER
            ================================================= */}

        <div className="reset-password-footer">
          <span>ABN Fleet System</span>

          <span>V1.0</span>
        </div>
      </section>
    </main>
  );
}

export default ResetPassword;
