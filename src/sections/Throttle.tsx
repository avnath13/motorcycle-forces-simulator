import { useState } from "react";
import { FpvView } from "@/components/FpvView";
import BikeSidePro from "@/components/BikeSidePro";
import { Arrow } from "@/components/Arrow";
import { Ctrl } from "@/components/Ctrl";
import { Gauge, MiniBar } from "@/components/Gauge";
import { StageFrame, GaugeRow, Tile, Chip, Deck, Heading, Note , TryThis, ViewToggle } from "@/components/Sim";
import { useRide } from "@/sim/RideContext";
import { deg, G } from "@/lib/physics";

export default function Throttle() {
  const { state: s, config, inputs, setConfig } = useRide();
  const [fpv, setFpv] = useState(false);
  const accel = Math.max(0, s.aLong);
  const W = s.W || 1;
  const rearUse = s.gripUsed;
  let state = "Driving", tone: "good" | "warn" | "bad" = "good";
  if (s.wheelie) { state = "Wheelie"; tone = "bad"; }
  else if (s.sliding) { state = "Rear spin"; tone = "bad"; }
  else if (accel / G > 0.7) { state = "On the edge"; tone = "warn"; }
  const pitch = s.wheelie ? Math.min(24, (accel - G * (config.cogFromRear / config.cogHeight)) * 10 + 5) : 0;
  const rear = { x: 76, y: 152 }, front = { x: 308, y: 152 }, gy = 198, cogX = 185, cogY = 108;
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">
        <GaugeRow>
          <Gauge value={s.speedKmh} max={200} label="Speed" unit="km/h" />
          <Gauge value={accel / G} max={1.2} decimals={2} label="Accel" unit="g" redlineFrom={G * (config.cogFromRear / config.cogHeight) / G} color="#b59000" />
          <Gauge value={(s.Nr / W) * 100} max={100} label="Rear load" unit="%" color="#8a8a8a" />
        </GaugeRow>
        <ViewToggle fpv={fpv} setFpv={setFpv} />
        {fpv ? (
          <StageFrame label="First-person · behind rider" aspect="384 / 224"><FpvView leanDeg={deg(s.lean)} steer={Math.max(-1, Math.min(1, s.lean * 1.5))} speedKmh={s.speedKmh} phase={s.distance} /></StageFrame>
        ) : (
        <StageFrame label="Side · drive & squat" aspect="384 / 224">
          <div className="relative h-full w-full">
            <BikeSidePro squat={Math.min(1, accel / 8)} pitch={pitch} throttle={inputs.throttle} motion={s.v / 28} className="absolute inset-0" />
            <svg viewBox="0 0 384 224" className="absolute inset-0 h-full w-full">
              {accel > 0.3 && <Arrow x1={cogX} y1={cogY} x2={cogX - accel * 9} y2={cogY} color="#111111" label="inertia" labelDx={-46} labelDy={-8} />}
              <circle cx={cogX} cy={cogY} r={5} fill="#111111" />
              <Arrow x1={front.x} y1={gy} x2={front.x} y2={gy - (s.Nf / W) * 66} color="#8a8a8a" label="Nf" labelDy={-4} />
              <Arrow x1={rear.x} y1={gy} x2={rear.x} y2={gy - (s.Nr / W) * 66} color="#8a8a8a" label="Nr" labelDy={-4} />
              {accel > 0.3 && <Arrow x1={rear.x} y1={gy - 3} x2={rear.x + accel * 8} y2={gy - 3} color="#b59000" label="drive" />}
              {s.wheelie && <text x={cogX} y={cogY - 26} textAnchor="middle" fill="#e23b3b" fontSize={12}>front lifting</text>}
            </svg>
          </div>
        </StageFrame>
        )}
        <div className="panel p-3">
          <div className="mb-2 flex items-center justify-between"><span className="eyebrow text-muted-foreground">Drive traction</span><Chip tone={tone}>{state}</Chip></div>
          <div className="grid grid-cols-2 gap-3">
            <MiniBar label="Grip used" value={rearUse * 100} max={120} unit="%" color={rearUse > 1 ? "#e23b3b" : "#8a8a8a"} />
            <MiniBar label="Rear load" value={(s.Nr / W) * 100} max={100} unit="%" color="#b59000" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Heading kicker="Module 06 · Longitudinal" title="Throttle, drive & traction">
          Hold the throttle and feel weight transfer rearward — the opposite of braking. The rear squats and grips; the front lightens. A taller CoG or shorter wheelbase lifts the front sooner.
        </Heading>
        <TryThis>Hold <b className="text-foreground">Throttle</b> and watch weight shift rearward (rear load climbs, front lightens). Now raise <b className="text-foreground">CoG height</b> or shorten the <b className="text-foreground">wheelbase</b> and accelerate hard — the front lifts into a wheelie.</TryThis>
        <Deck title="Geometry & surface">
          <Ctrl label="CoG height" value={config.cogHeight * 100} min={40} max={110} step={1} unit=" cm" onChange={(v) => setConfig({ cogHeight: v / 100 })} hint="Higher centre of mass = the front wheel lifts (wheelie) at lower acceleration." />
          <Ctrl label="Wheelbase" value={config.wheelbase * 100} min={120} max={170} step={1} unit=" cm" onChange={(v) => setConfig({ wheelbase: v / 100 })} hint="Longer wheelbase = harder to wheelie and more stable under drive." />
          <Ctrl label="Tyre grip (μ)" value={config.mu} min={0.4} max={1.1} step={0.05} onChange={(v) => setConfig({ mu: v })} fmt={(x) => x.toFixed(2)} hint="Rear grip. Too little and the rear spins up instead of driving forward." />
        </Deck>
        <Deck title="Equation">
          <div className="rounded-lg bg-[hsl(var(--muted)/0.6)] px-3 py-2 font-mono text-[12px] text-foreground">wheelie when a &gt; g·(b/h)</div>
          <Note>Smooth, progressive throttle feeds drive the rear can use; a sudden fistful spins the rear (low grip) or lifts the front (high grip). Roll on gently exiting a corner to keep the chassis settled.</Note>
        </Deck>
      </div>
    </div>
  );
}
