import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";

import ProtectedRoute from "../components/auth/ProtectedRoute";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Register from "../pages/Login/Register";
import ForgotPassword from "../pages/Login/ForgotPassword";
import ResetPassword from "../pages/Login/ResetPassword";
//import Tracking from "../pages/Tracking/Tracking";
//import GeofencePage from "../pages/Geofence/Geofence";
//import Drivers from "../pages/Drivers/Drivers";
//import Fleet from "../pages/Fleet/Fleet";
//import Alerts from "../pages/Alerts/Alerts";
import Reports from "../pages/Reports/Reports";
import History from "../pages/History/History";
//import Trips from "../pages/Trips/Trips";
import Settings from "../pages/Settings/Settings";
import HelpdeskTicket from "../pages/helpdesk/HelpdeskTicket";
import HelpdeskMessage from "../pages/helpdesk/HelpdeskMessage";
import Notification from "../pages/helpdesk/Notification";
import Users from "../pages/users/Users";
import UsersActivity from "../pages/users/UsersActivity";
import Contact from "../pages/contact/Contact";
import Devices from "../pages/device/Devices";
import SAP from "../pages/integration/SAP";
import About from "../pages/about/About";
import SendEmail from "../pages/contact/SendEmail";
import Inbox from "../pages/mail/Inbox";
import Compose from "../pages/mail/Compose";
import Sent from "../pages/mail/Sent";
import Drafts from "../pages/mail/Drafts";
import Trash from "../pages/mail/Trash";
import IDXDashboard from "../pages/idx/IDXDashboard";
import ForexDashboard from "../pages/forex/ForexDashboard";
import CryptoDashboard from "../pages/crypto/CryptoDashboard";
import BinanceDashboard from "../pages/binance/BinanceDashboard";

function AppRouter() {
  return (
    <Routes>
      {/* =====================================================
          AUTH
          PUBLIC ROUTES
          ===================================================== */}

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/contact" element={<Contact />} />
      <Route path="/contact/send-email" element={<SendEmail />} />
      {/* =====================================================
          APPLICATION
          PROTECTED ROUTES
          ===================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/tracking" element={<Tracking />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/trips" element={<Trips />} /> */}
          <Route path="/history" element={<History />} />
          {/* <Route path="/geofence" element={<GeofencePage />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/drivers" element={<Drivers />} /> */}
          <Route path="/reports" element={<Reports />} />
          <Route path="/sap" element={<div>SAP Integration</div>} />
          <Route path="/device" element={<Devices />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/users/list" element={<Users />} />
          <Route path="/users/activity" element={<UsersActivity />} />
          <Route path="/helpdesk/tickets" element={<HelpdeskTicket />} />
          <Route path="/helpdesk/messages" element={<HelpdeskMessage />} />
          <Route path="/helpdesk/notifications" element={<Notification />} />
          <Route path="/sap" element={<SAP />} />
          <Route path="/about" element={<About />} />
          <Route path="/mail/inbox" element={<Inbox />} />
          <Route path="/mail/compose" element={<Compose />} />
          <Route path="/mail/sent" element={<Sent />} />
          <Route path="/mail/drafts" element={<Drafts />} />
          <Route path="/mail/trash" element={<Trash />} />
          {/* =====================================================
          IDX
          ===================================================== */}
          <Route path="/trading/markets/idx" element={<IDXDashboard />} />

          {/* =====================================================
          FOREX
          ===================================================== */}
          <Route path="/trading/markets/forex" element={<ForexDashboard />} />

          {/* =====================================================
          FOREX
          ===================================================== */}
          <Route path="/trading/markets/crypto" element={<CryptoDashboard />} />
          {/* =====================================================
          FOREX
          ===================================================== */}
          <Route
            path="/trading/markets/binance"
            element={<BinanceDashboard />}
          />
        </Route>
      </Route>

      {/* =====================================================
          DEFAULT
          ===================================================== */}

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* =====================================================
          404
          ===================================================== */}

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRouter;
