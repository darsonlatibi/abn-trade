import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../stores/store";

import { getCurrentUser } from "../../features/auth/authSlice";

import { refreshAccessToken } from "../../api/axios";

/* =========================================================
   ABN FLEET SYSTEM
   AUTH INITIALIZER
   ========================================================= */

function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>();

  const { initialized } = useSelector((state: RootState) => state.auth);

  /* =======================================================
     INITIALIZE AUTH
     ======================================================= */

  useEffect(() => {
    if (initialized) {
      return;
    }

    let cancelled = false;

    const initializeAuth = async () => {
      try {
        console.log("ABN AUTH: Initializing session...");

        /* =================================================
           REFRESH ACCESS TOKEN
           ================================================= */

        const token = await refreshAccessToken();

        /*
         * Component sudah unmount.
         */
        if (cancelled) {
          return;
        }

        /* =================================================
           TIDAK ADA SESSION
           ================================================= */

        if (!token) {
          console.info("ABN AUTH: Tidak ada session aktif.");

          return;
        }

        /* =================================================
           GET CURRENT USER
           ================================================= */

        await dispatch(getCurrentUser()).unwrap();

        if (!cancelled) {
          console.log("ABN AUTH: Session berhasil dipulihkan.");
        }
      } catch (error) {
        if (!cancelled) {
          console.info("ABN AUTH: Session tidak aktif.", error);
        }
      } finally {
        /*
         * Sangat penting:
         *
         * AuthInitializer harus selesai
         * apapun hasil refresh.
         *
         * getCurrentUser.fulfilled/rejected juga
         * mengubah initialized = true.
         *
         * Tetapi jika refresh gagal sebelum
         * getCurrentUser dijalankan, kita tetap
         * harus menandai initialization selesai.
         */

        if (!cancelled) {
          dispatch({
            type: "auth/setAuthInitialized",
            payload: true,
          });
        }
      }
    };

    initializeAuth();

    return () => {
      cancelled = true;
    };
  }, [dispatch, initialized]);

  return null;
}

export default AuthInitializer;
