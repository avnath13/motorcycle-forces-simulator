import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { type RideState, type RideConfig, type Inputs, defaultConfig, initialState, step, zeroInputs } from "./engine";

type Action = "thr" | "brk" | "left" | "right" | "clutch";

interface RideCtx {
  state: RideState;
  config: RideConfig;
  inputs: Inputs;
  setConfig: (c: Partial<RideConfig>) => void;
  press: (a: Action, down: boolean) => void;
  setSteer: (v: number | null) => void; // slider override; null releases
  setThrottle: (v: number | null) => void;
  setBrake: (v: number | null) => void;
  setClutch: (v: number | null) => void;
  gearUp: () => void;
  gearDown: () => void;
  assist: boolean;
  toggleAssist: () => void;
  reset: () => void;
}

const Ctx = createContext<RideCtx>(null as any);
export const useRide = () => useContext(Ctx);

export function RideProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RideState>(initialState);
  const [config, setConfigState] = useState<RideConfig>(defaultConfig);
  const [inputs, setInputs] = useState<Inputs>(zeroInputs);
  const [assist, setAssist] = useState(false);

  const stateRef = useRef(state);
  const cfgRef = useRef(config);
  const inRef = useRef<Inputs>({ ...zeroInputs });
  const held = useRef<Record<Action, boolean>>({ thr: false, brk: false, left: false, right: false, clutch: false });
  const override = useRef<{ steer: number | null; throttle: number | null; brake: number | null; clutch: number | null }>({ steer: null, throttle: null, brake: null, clutch: null });
  const raf = useRef<number>();
  const last = useRef<number>(0);
  const blipUntil = useRef<number>(0);
  const assistRef = useRef(false);
  assistRef.current = assist;

  cfgRef.current = config;

  const setConfig = useCallback((c: Partial<RideConfig>) => setConfigState((p) => ({ ...p, ...c })), []);
  const press = useCallback((a: Action, down: boolean) => { held.current[a] = down; }, []);
  const setSteer = useCallback((v: number | null) => { override.current.steer = v; }, []);
  const setThrottle = useCallback((v: number | null) => { override.current.throttle = v; }, []);
  const setBrake = useCallback((v: number | null) => { override.current.brake = v; }, []);
  const setClutch = useCallback((v: number | null) => { override.current.clutch = v; }, []);
  const gearUp = useCallback(() => { inRef.current.gear = Math.min(6, Math.round(inRef.current.gear) + 1); blipUntil.current = performance.now() + 220; }, []);
  const gearDown = useCallback(() => { inRef.current.gear = Math.max(1, Math.round(inRef.current.gear) - 1); blipUntil.current = performance.now() + 220; }, []);
  const toggleAssist = useCallback(() => setAssist((a) => !a), []);
  const reset = useCallback(() => {
    stateRef.current = initialState();
    inRef.current = { ...zeroInputs };
    held.current = { thr: false, brk: false, left: false, right: false, clutch: false };
    override.current = { steer: null, throttle: null, brake: null, clutch: null };
    setState(stateRef.current);
  }, []);

  useEffect(() => {
    const key = (down: boolean) => (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      let hit = true;
      if (k === "w" || k === "arrowup") held.current.thr = down;
      else if (k === " " || k === "s" || k === "arrowdown") held.current.brk = down;
      else if (k === "a") held.current.left = down;
      else if (k === "d") held.current.right = down;
      else if (k === "shift") held.current.clutch = down;
      else if (k === "e" || k === "]") { if (down && !e.repeat) gearUp(); }
      else if (k === "q" || k === "[") { if (down && !e.repeat) gearDown(); }
      else hit = false;
      if (hit) { e.preventDefault(); if (down) override.current.steer = null; }
    };
    const kd = key(true), ku = key(false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, []);

  useEffect(() => {
    const loop = (now: number) => {
      const dt = last.current ? (now - last.current) / 1000 : 0.016;
      last.current = now;
      const i = inRef.current;
      const ov = override.current;
      // throttle
      if (ov.throttle != null) i.throttle = ov.throttle;
      else i.throttle = held.current.thr ? Math.min(1, i.throttle + dt * 1.3) : Math.max(0, i.throttle - dt * 3.5);
      // brakes
      if (ov.brake != null) { i.brakeF = ov.brake; i.brakeR = ov.brake * 0.7; }
      else { const t = held.current.brk ? 1 : 0; i.brakeF = t ? Math.min(1, i.brakeF + dt * 3) : Math.max(0, i.brakeF - dt * 4); i.brakeR = i.brakeF * 0.7; }
      // steer
      if (ov.steer != null) i.steer = ov.steer;
      else {
        const dir = (held.current.right ? 1 : 0) - (held.current.left ? 1 : 0);
        if (dir !== 0) i.steer = Math.max(-1, Math.min(1, i.steer + dir * dt * 1.6));
        else i.steer = Math.abs(i.steer) < 0.02 ? 0 : i.steer - Math.sign(i.steer) * dt * 2;
      }
      // clutch: assist auto-manages it; otherwise Shift/slider with a feather-able ramp
      if (assistRef.current) {
        const v = stateRef.current.v;
        const at = v < 0.5 && i.throttle < 0.05 ? 1 : v < 2.5 ? 0.5 : 0;
        i.clutch = i.clutch + (at - i.clutch) * Math.min(1, dt * 8);
      } else {
        const clutchTarget = held.current.clutch ? 1 : (ov.clutch != null ? ov.clutch : 0);
        i.clutch = i.clutch + (clutchTarget - i.clutch) * Math.min(1, dt * 3.5);
      }
      if (now < blipUntil.current) i.clutch = 1;  // quickshifter blip on gear change
      i.assist = assistRef.current;
      const next = step(stateRef.current, i, cfgRef.current, dt);
      stateRef.current = next;
      setState(next);
      setInputs({ ...i });
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <Ctx.Provider value={{ state, config, inputs, setConfig, press, setSteer, setThrottle, setBrake, setClutch, gearUp, gearDown, assist, toggleAssist, reset }}>
      {children}
    </Ctx.Provider>
  );
}
