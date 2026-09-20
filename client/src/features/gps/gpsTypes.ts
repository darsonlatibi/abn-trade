/* =========================================================
   ABN FLEET SYSTEM
   GPS TYPES
   ========================================================= */

/* =========================================================
   VEHICLE STATUS
   ========================================================= */

export type VehicleStatus = "MOVING" | "STOPPED" | "OFFLINE";

/* =========================================================
   TRIP STATUS
   ========================================================= */

export type TripStatus =
  | "IDLE"
  | "ON_TRIP"
  | "LOADING"
  | "UNLOADING"
  | "RETURNING"
  | "STOPPED"
  | "OFFLINE";

/* =========================================================
   VEHICLE TYPE
   ========================================================= */

export type VehicleType =
  | "TRUCK"
  | "DUMP_TRUCK"
  | "TANKER"
  | "TRAILER"
  | "BOX_TRUCK"
  | "PICKUP"
  | "OTHER";

/* =========================================================
   GPS POSITION
   ========================================================= */

export interface GPSPosition {
  id: number;

  vehicle_id: number;
  device_id: string | null;

  latitude: number;
  longitude: number;

  speed: number;
  heading: number;

  altitude: number | null;
  accuracy: number | null;
  satellites: number | null;

  status: VehicleStatus;

  last_update?: string;
}

/* =========================================================
   CARGO
   ========================================================= */

export interface VehicleCargo {
  type: string;
  quantity: number;
  unit: string;
}

/* =========================================================
   DRIVER
   ========================================================= */

export interface VehicleDriver {
  id: number;
  name: string;
}

/* =========================================================
   VEHICLE
   ========================================================= */

export interface FleetVehicle extends GPSPosition {
  vehicle_code: string;

  plate_number: string;
  vehicle_name: string;

  vehicle_type: VehicleType;

  brand: string;
  model: string;
  year: number;

  driver: VehicleDriver | null;

  trip_id: string | null;
  trip_status: TripStatus;

  origin: string | null;
  destination: string | null;

  cargo: VehicleCargo | null;
}

/* =========================================================
   MAP COORDINATE
   ========================================================= */

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

/* =========================================================
   MAP VEHICLE MARKER
   ========================================================= */

export interface FleetMarkerData {
  id: number;

  vehicle_id: number;
  vehicle_code: string;

  latitude: number;
  longitude: number;

  heading: number;
  speed: number;

  status: VehicleStatus;
}

/* =========================================================
   GPS API RESPONSE
   ========================================================= */

export interface GPSResponse {
  data: GPSPosition[];
  total?: number;
  limit?: number;
  offset?: number;
}

/* =========================================================
   GPS FILTER
   ========================================================= */

export interface GPSFilter {
  status?: VehicleStatus | "ALL";

  vehicle_id?: number;

  device_id?: string;

  search?: string;
}

/* =========================================================
   GPS STATE
   ========================================================= */

export interface GPSState {
  positions: GPSPosition[];

  loading: boolean;

  error: string | null;

  lastUpdated: string | null;
}
