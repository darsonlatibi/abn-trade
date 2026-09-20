/* =========================================================
   ABN FLEET SYSTEM
   GPS SIMULATOR
   ========================================================= */

export interface SimulatedVehicle {
  id: number;
  vehicle_id: number;
  device_id: string;

  latitude: number;
  longitude: number;

  speed: number;
  heading: number;

  altitude: number;
  accuracy: number;
  satellites: number;

  status: "MOVING" | "STOPPED" | "OFFLINE";
}

/* =========================================================
   INITIAL VEHICLES
   ========================================================= */

export const SIMULATED_VEHICLES: SimulatedVehicle[] = [
  {
    id: 1,
    vehicle_id: 101,
    device_id: "ABN-ESP-001",

    latitude: -7.2458,
    longitude: 112.7351,

    speed: 42.5,
    heading: 45,

    altitude: 18,
    accuracy: 4.2,
    satellites: 12,

    status: "MOVING",
  },

  {
    id: 2,
    vehicle_id: 102,
    device_id: "ABN-ESP-002",

    latitude: -7.2504,
    longitude: 112.7421,

    speed: 0,
    heading: 90,

    altitude: 15,
    accuracy: 5.1,
    satellites: 10,

    status: "STOPPED",
  },

  {
    id: 3,
    vehicle_id: 103,
    device_id: "ABN-ESP-003",

    latitude: -7.2572,
    longitude: 112.7284,

    speed: 57.8,
    heading: 120,

    altitude: 21,
    accuracy: 3.8,
    satellites: 13,

    status: "MOVING",
  },

  {
    id: 4,
    vehicle_id: 104,
    device_id: "ABN-ESP-004",

    latitude: -7.2631,
    longitude: 112.7512,

    speed: 31.4,
    heading: 180,

    altitude: 17,
    accuracy: 6.2,
    satellites: 9,

    status: "MOVING",
  },

  {
    id: 5,
    vehicle_id: 105,
    device_id: "ABN-ESP-005",

    latitude: -7.2702,
    longitude: 112.7388,

    speed: 0,
    heading: 270,

    altitude: 14,
    accuracy: 4.9,
    satellites: 11,

    status: "STOPPED",
  },

  {
    id: 6,
    vehicle_id: 106,
    device_id: "ABN-ESP-006",

    latitude: -7.2781,
    longitude: 112.7562,

    speed: 68.3,
    heading: 315,

    altitude: 25,
    accuracy: 3.5,
    satellites: 14,

    status: "MOVING",
  },

  {
    id: 7,
    vehicle_id: 107,
    device_id: "ABN-ESP-007",

    latitude: -7.2854,
    longitude: 112.7215,

    speed: 0,
    heading: 0,

    altitude: 12,
    accuracy: 7.1,
    satellites: 8,

    status: "STOPPED",
  },

  {
    id: 8,
    vehicle_id: 108,
    device_id: "ABN-ESP-008",

    latitude: -7.2928,
    longitude: 112.7457,

    speed: 0,
    heading: 90,

    altitude: 11,
    accuracy: 8.4,
    satellites: 6,

    status: "OFFLINE",
  },
];

/* =========================================================
   MOVE SIMULATION
   ========================================================= */

export function simulateVehicleMovement(
  vehicles: SimulatedVehicle[],
): SimulatedVehicle[] {
  return vehicles.map((vehicle) => {
    if (vehicle.status !== "MOVING") {
      return vehicle;
    }

    const headingRad = (vehicle.heading * Math.PI) / 180;

    const movement = 0.00015;

    const latitude = vehicle.latitude + Math.cos(headingRad) * movement;

    const longitude = vehicle.longitude + Math.sin(headingRad) * movement;

    const speedVariation = (Math.random() - 0.5) * 8;

    const speed = Math.max(10, vehicle.speed + speedVariation);

    const heading = (vehicle.heading + (Math.random() - 0.5) * 12 + 360) % 360;

    return {
      ...vehicle,

      latitude,
      longitude,

      speed,
      heading,

      accuracy: 3 + Math.random() * 4,

      satellites: Math.floor(9 + Math.random() * 6),
    };
  });
}

/* =========================================================
   RESET SIMULATION
   ========================================================= */

export function resetSimulatedVehicles(): SimulatedVehicle[] {
  return SIMULATED_VEHICLES.map((vehicle) => ({
    ...vehicle,
  }));
}
