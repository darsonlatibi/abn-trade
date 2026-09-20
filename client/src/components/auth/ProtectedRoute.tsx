import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useSelector } from "react-redux";

import type { RootState } from "../../stores/store";
import AuthLoading from "./AuthLoading";

/* =========================================================
   ABN FLEET SYSTEM
   PROTECTED ROUTE
   ========================================================= */

function ProtectedRoute() {
  const location = useLocation();

  const { authenticated, initialized, loading } = useSelector(
    (state: RootState) => state.auth,
  );

  /* =======================================================
     AUTH INITIALIZATION
     ======================================================= */

  /*
   * Saat aplikasi baru dibuka,
   * tunggu AuthInitializer menyelesaikan
   * pengecekan session.
   */
  if (!initialized || loading) {
    return <AuthLoading />;
  }

  /* =======================================================
     NOT AUTHENTICATED
     ======================================================= */

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  /* =======================================================
     AUTHENTICATED
     ======================================================= */

  return <Outlet />;
}

export default ProtectedRoute;
