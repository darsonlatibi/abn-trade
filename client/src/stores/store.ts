import { configureStore } from "@reduxjs/toolkit";

import authReducer, {
  clearAuth,
  selectAccessToken,
  selectAuthenticated,
  setAccessToken,
} from "../features/auth/authSlice";
import usersReducer from "../features/users/UsersSlice";
import usersActivityReducer from "../features/users/UsersActivitySlice";
import settingsReducer from "../features/settings/settingsSlice";
import geofenceReducer from "../features/geofence/geofenceSlice";
import truckReducer from "../features/truck/truckSlice";
import devicesReducer from "../features/devices/devicesSlice";
import gpsReducer from "../features/gps/gpsSlice";

import { registerAuthBridge } from "../features/auth/authBridge";
import driversReducer from "../features/driver/driverSlice";
import vehiclesReducer from "../features/vehicle/vehiclesSlice";
import alertReducer from "../features/alert/alertSlice";
import reportReducer from "../features/report/reportSlice";

import historyReducer from "../features/history/historySlice";
import tripReducer from "../features/trip/tripSlice";
import helpdeskTicketReducer from "../features/helpdesk/helpdeskTicketSlice";
import helpdeskMessageReducer from "../features/helpdesk/helpdeskMessageSlice";
import sapIntegrationReducer from "../features/integration/SAPIntegrationSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";
import emailReducer from "../features/email/emailSlice";
import idxReducer from "../features/trade/idxSlice";
import forexReducer from "../features/trade/forexSlice";
import cryptoReducer from "../features/trade/cryptoSlice";
/* =========================================================
   ABN FLEET SYSTEM
   REDUX STORE
   ========================================================= */

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    usersActivity: usersActivityReducer,
    geofence: geofenceReducer,
    truck: truckReducer,
    devices: devicesReducer,
    gps: gpsReducer,
    drivers: driversReducer,
    vehicles: vehiclesReducer,
    alerts: alertReducer,
    report: reportReducer,
    history: historyReducer,
    trips: tripReducer,
    settings: settingsReducer,
    helpdeskTicket: helpdeskTicketReducer,
    helpdeskMessage: helpdeskMessageReducer,
    sapIntegration: sapIntegrationReducer,
    notifications: notificationsReducer,
    email: emailReducer,
    idx: idxReducer,
    forex: forexReducer,
    crypto: cryptoReducer,
  },

  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

/* =========================================================
   AUTH BRIDGE
   ========================================================= */

registerAuthBridge({
  /* =======================================================
     ACCESS TOKEN
     ======================================================= */

  getAccessToken: () => {
    return selectAccessToken(store.getState());
  },

  setAccessToken: (token: string) => {
    store.dispatch(setAccessToken(token));
  },

  /* =======================================================
     CLEAR AUTH
     ======================================================= */

  clearAuth: () => {
    store.dispatch(clearAuth());
  },

  /* =======================================================
     AUTH STATUS
     ======================================================= */

  getAuthenticated: () => {
    return selectAuthenticated(store.getState());
  },

  getInitialized: () => {
    return store.getState().auth.initialized;
  },

  /* =======================================================
     USER
     ======================================================= */

  getUser: () => {
    return store.getState().auth.user;
  },
});

/* =========================================================
   TYPES
   ========================================================= */

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
