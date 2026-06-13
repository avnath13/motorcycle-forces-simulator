// Real-time motorcycle dynamics — one shared model all sections read from.
export const G = 9.81;

export interface RideConfig {
  mass: number;      // kg (bike + rider)
  wheelbase: number; // m
  cogHeight: number; // m
  cogFromRear: number; // m (b)
  mu: number;        // tyre grip coefficient
  power: number;     // peak drive accel (m/s^2) at low speed
  vMax: number;      // top speed (m/s)
  gradient: number;  // road slope in degrees (+uphill, -downhill)
  surface: string;   // label: dry/wet/gravel/ice
  load: string;      // label: solo/pillion/luggage
}

export const defaultConfig: RideConfig = {
  mass: 250, wheelbase: 1.42, cogHeight: 0.6, cogFromRear: 0.7,
  mu: 1.0, power: 6.0, vMax: 64, gradient: 0, surface: "Dry", load: "Solo",
};

export interface Inputs {
  throttle: number; // 0..1
  brakeF: number;   // 0..1
  brakeR: number;   // 0..1
  steer: number;    // -1..1 (rider lean/steer command; + = right)
  clutch: number;   // 0 = released/engaged, 1 = pulled in/disengaged
  gear: number;     // selected gear 1..6
  assist: boolean;  // assisted mode: auto-clutch, no stalling
}

export const zeroInputs: Inputs = { throttle: 0, brakeF: 0, brakeR: 0, steer: 0, clutch: 0, gear: 1, assist: false };

// Friction zone: clutch lever travel where drive bites in
export const FZ_LOW = 0.2, FZ_HIGH = 0.95;

export interface RideState {
  v: number;        // m/s
  speedKmh: number;
  lean: number;     // rad (+ right)
  steerVis: number; // front-wheel visual steer (rad), shows countersteer
  aLong: number;    // m/s^2 (+ accel, - decel)
  aLat: number;     // m/s^2
  gLong: number; gLat: number;
  Nf: number; Nr: number;  // wheel loads (N)
  W: number;
  gripUsed: number;        // 0..1+ fraction of friction circle
  longUsed: number; latUsed: number; // signed components -1..1 of circle
  radius: number;          // m (corner radius, Infinity straight)
  rpm: number; gear: number;
  clutchEngage: number; // 0..1 drive transmitted
  stalled: boolean;
  wheelie: boolean; stoppie: boolean; sliding: boolean;
  distance: number; heading: number; x: number; y: number;
  rolling: boolean;
}

// 6-speed: top speed (m/s) at redline per gear, and torque multiplier (more leverage in low gears)
const GEAR_TOP = [0, 7.5, 14, 22, 32, 45, 64];
const GEAR_MULT = [0, 1.7, 1.32, 1.06, 0.86, 0.72, 0.6];
export const N_GEARS = 6;
const REDLINE = 11000, IDLE = 1050;

export function initialState(): RideState {
  return {
    v: 0, speedKmh: 0, lean: 0, steerVis: 0, aLong: 0, aLat: 0, gLong: 0, gLat: 0,
    Nf: 0, Nr: 0, W: 0, gripUsed: 0, longUsed: 0, latUsed: 0, radius: Infinity,
    rpm: 1100, gear: 1, clutchEngage: 1, stalled: false, wheelie: false, stoppie: false, sliding: false,
    distance: 0, heading: 0, x: 0, y: 0, rolling: false,
  };
}

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

export function step(s: RideState, inp: Inputs, cfg: RideConfig, dt: number): RideState {
  dt = clamp(dt, 0, 0.05);
  const { mass, wheelbase: L, cogHeight: h, cogFromRear: b, mu, power, vMax } = cfg;
  const W = mass * G;

  // --- Clutch & stall ---
  const eRaw = clamp((FZ_HIGH - inp.clutch) / (FZ_HIGH - FZ_LOW), 0, 1);
  const engage = eRaw * eRaw * (3 - 2 * eRaw); // smoothstep: gentle, less sensitive bite
  let stalled = inp.assist ? false : s.stalled;
  if (inp.clutch > 0.82) stalled = false;                 // pull clutch in -> engine idles again
  else if (!inp.assist && engage > 0.5 && s.v > 0.05 && s.v < 0.8 && inp.throttle < 0.12) stalled = true; // rolled to a stop in gear without the clutch

  // --- Gearbox ---
  const gear = clamp(Math.round(inp.gear), 1, N_GEARS);
  const gTop = GEAR_TOP[gear];
  const rev = clamp(s.v / gTop, 0, 1.15);                  // engine revs as fraction of redline
  const rpmEngaged = IDLE + rev * (REDLINE - IDLE);
  const lugging = engage > 0.55 && rpmEngaged < 1500 && s.v > 0.1 && gear > 1; // wrong gear / bogging
  if (!inp.assist && lugging && inp.throttle < 0.5) stalled = true;

  // --- Longitudinal ---
  const driveBase = Math.pow(inp.throttle, 1.5) * power * GEAR_MULT[gear] * Math.max(0, 1 - s.v / gTop);
  const driveAccel = stalled ? 0 : driveBase * engage;
  // braking: limited by available grip per axle (computed from previous loads)
  const brakeAccel = (inp.brakeF * 0.9 + inp.brakeR * 0.35) * mu * G;
  const drag = 0.5 * 1.2 * 0.6 * 0.5 * s.v * s.v / mass; // /mass to accel
  const slope = -G * Math.sin((cfg.gradient * Math.PI) / 180); // uphill (+grad) decelerates
  // engine braking only when the clutch is engaged (pull it in to freewheel)
  const engBrake = !stalled && engage > 0.2 && inp.throttle < 0.08 && s.v > 0.4 ? engage * GEAR_MULT[clamp(Math.round(inp.gear),1,N_GEARS)] * Math.min(2.2, 0.5 + s.v * 0.035) : 0;
  let aLong = driveAccel - (s.v > 0.05 ? brakeAccel + drag + engBrake : 0) + slope;
  let v = s.v + aLong * dt;
  if (v < 0) { v = 0; aLong = 0; }

  // --- Lean / cornering (rider commands lean via steer) ---
  const vSafe = Math.max(v, 0.1);
  const maxLean = clamp(0.05 + v / 18, 0, 0.95); // more lean possible with speed (rad ~54deg)
  const targetLean = inp.steer * maxLean;
  // lean approaches target; rate-limited (countersteer dynamics)
  const leanRate = clamp((targetLean - s.lean) * 6, -3, 3);
  let lean = s.lean + leanRate * dt;
  lean = clamp(lean, -1.05, 1.05);
  // visual countersteer: front wheel kicks opposite to lean rate at speed
  const steerVis = v > 2 ? -leanRate * 0.12 : inp.steer * 0.4;

  const aLat = G * Math.tan(lean);
  const radius = Math.abs(aLat) > 0.05 ? (v * v) / aLat : Infinity;

  // --- Weight transfer ---
  let dN = (mass * aLong * h) / L;
  let Nf = W * (b / L) - dN;     // accel (+aLong) unloads front
  let Nr = W * ((L - b) / L) + dN;
  Nf = clamp(Nf, 0, W); Nr = clamp(Nr, 0, W);

  const wheelie = aLong > G * (b / h) + 0.05 && v < vMax;
  const stoppie = aLong < -G * ((L - b) / h) - 0.05;

  // --- Traction circle ---
  const longUsed = clamp(aLong / (mu * G), -1.4, 1.4);
  const latUsed = clamp(aLat / (mu * G), -1.4, 1.4);
  const gripUsed = Math.hypot(longUsed, latUsed);
  const sliding = gripUsed > 1.0;

  // --- Engine speed ---
  const revNow = clamp(v / gTop, 0, 1.15);
  let rpm: number;
  if (stalled) rpm = 0;
  else if (engage < 0.65) rpm = IDLE + inp.throttle * (REDLINE - IDLE) * 0.85;  // slipping/disengaged: free revs
  else rpm = Math.max(IDLE, IDLE + revNow * (REDLINE - IDLE));

  // --- Track position (for map / G-G trace) ---
  const heading = s.heading - (radius !== Infinity ? (v / radius) * dt : 0);
  const x = s.x + Math.cos(heading) * v * dt;
  const y = s.y + Math.sin(heading) * v * dt;

  return {
    v, speedKmh: v * 3.6, lean, steerVis, aLong, aLat,
    gLong: aLong / G, gLat: aLat / G, Nf, Nr, W,
    gripUsed, longUsed, latUsed, radius,
    rpm, gear, clutchEngage: engage, stalled, wheelie, stoppie, sliding,
    distance: s.distance + v * dt, heading, x, y,
    rolling: v > 0.3,
  };
}
