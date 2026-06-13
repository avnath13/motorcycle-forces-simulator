import { useEffect, useRef } from "react";
import { useRide } from "@/sim/RideContext";
import { AudioEngine } from "@/sim/audio";

export function SoundController({ enabled }: { enabled: boolean }) {
  const { state: s, inputs } = useRide();
  const eng = useRef<AudioEngine>();
  if (!eng.current) eng.current = new AudioEngine();
  useEffect(() => { eng.current!.setEnabled(enabled); }, [enabled]);
  useEffect(() => {
    if (!enabled) return;
    eng.current!.update(s.rpm, inputs.throttle, s.sliding, Math.max(0, s.gripUsed - 1), s.rolling);
  });
  return null;
}
