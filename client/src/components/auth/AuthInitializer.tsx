import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "../../stores/store";

import {
  getCurrentUser,
  setAuthInitialized,
} from "../../features/auth/authSlice";

import { refreshAccessToken } from "../../api/axios";

/* =========================================================
   ABN TRADE
   AUTH INITIALIZER
   ========================================================= */

function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>();

  const initialized = useSelector((state: RootState) => state.auth.initialized);

  useEffect(() => {
    if (initialized) {
      return;
    }

    let cancelled = false;

    const initializeAuth = async () => {
      console.log("ABN AUTH: Initializing session...");

      try {
        /* =================================================
           RESTORE ACCESS TOKEN
           ================================================= */

        const token = await refreshAccessToken();

        if (cancelled) {
          return;
        }

        /* =================================================
           NO ACTIVE SESSION
           ================================================= */

        if (!token) {
          console.info("ABN AUTH: Tidak ada session aktif.");
          return;
        }

        /* =================================================
           RESTORE CURRENT USER
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
        if (!cancelled) {
          dispatch(setAuthInitialized(true));
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
