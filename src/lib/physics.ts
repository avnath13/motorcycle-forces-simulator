export const G = 9.81;

export const kmh = (m: number) => m * 3.6;
export const toMs = (k: number) => k / 3.6;
export const deg = (rad: number) => (rad * 180) / Math.PI;
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Static / at-rest wheel loads. a = horizontal distance front-axle -> CoG, L = wheelbase
export function staticLoads(mass: number, a: number, L: number) {
  const W = mass * G;
  const Nr = (W * a) / L;
  const Nf = W - Nr;
  return { W, Nf, Nr };
}

export function weightTransfer(mass: number, accel: number, h: number, L: number) {
  return (mass * accel * h) / L;
}

export function leanAngle(speedMs: number, radius: number) {
  return Math.atan((speedMs * speedMs) / (G * radius));
}

export function maxCornerSpeed(mu: number, radius: number) {
  return Math.sqrt(mu * G * radius);
}

export function stoppingDistance(speedMs: number, decel: number) {
  return (speedMs * speedMs) / (2 * Math.max(decel, 0.01));
}
