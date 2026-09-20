import AuthInitializer from "../components/auth/AuthInitializer";
import AppRouter from "./router";

export default function App() {
  return (
    <>
      {/* ===================================================
          AUTH INITIALIZER
          =================================================== */}

      <AuthInitializer />

      {/* ===================================================
          APPLICATION ROUTER
          =================================================== */}
      <AppRouter />
    </>
  );
}
