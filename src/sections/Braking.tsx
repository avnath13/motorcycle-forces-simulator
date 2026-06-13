import { useState } from "react";
import { FpvView } from "@/components/FpvView";
import BikeSidePro from "@/components/BikeSidePro";
import { Arrow } from "@/components/Arrow";
import { Ctrl } from "@/components/Ctrl";
import { Gauge, MiniBar } from "@/components/Gauge";
import { StageFrame, GaugeRow, Tile, Chip, Deck, Heading, Note , TryThis, ViewToggle } from "@/components/Sim";
import { useRide } from "@/sim/RideContext";
import { stoppingDistance, deg, G } from "@/lib/physics";

export default function Braking() {
  const { state: s, config, inputs, setConfig } = useRide();
  const [fpv, setFpv] = useState(false);
  const decel = Math.max(0, -s.aLong);
  const dive = Math.min(1, decel / 9.5);
  const W = s.W || 1;
  const fd = (inputs.brakeF * 0.9 * config.mu * s.Nf) / (config.mu * (s.Nf || 1));
  const frontUse = s.Nf > 0 ? (inputs.brakeF * 0.9 * config.mu * G * s.W / G) / (config.mu * s.Nf) : 0;
  const dist = stoppingDistance(s.v, Math.max(decel, 0.1));
  let lock = "Stable", tone: "good" | "warn" | "bad" = "good";
  if (s.stoppie) { lock = "Rear airborne"; tone = "bad"; }
  else if (s.sliding) { lock = "Front lock"; tone = "bad"; }
  else if (decel > 8) { lock = "Near limit"; tone = "warn"; }

  const rear = { x: 76, y: 152 }, front = { x: 308, y: 152 }, gy = 198, cogX = 185, cogY = 108;
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">
        <GaugeRow>
          <Gauge value={s.speedKmh} max={200} label="Speed" unit="km/h" />
          <Gauge value={decel / G} max={1.2} decimals={2} label="Decel" unit="g" redlineFrom={1} color="#b59000" />
          <Gauge value={(s.Nf / W) * 100} max={100} label="Front load" unit="%" color="#8a8a8a" />
        </GaugeRow>
        <ViewToggle fpv={fpv} setFpv={setFpv} />
        {fpv ? (
          <StageFrame label="First-person · behind rider" aspect="384 / 224"><FpvView leanDeg={deg(s.lean)} steer={Math.max(-1, Math.min(1, s.lean * 1.5))} speedKmh={s.speedKmh} phase={s.distance} /></StageFrame>
        ) : (
        <StageFrame label="Side · weight transfer" aspect="384 / 224">
          <div className="relative h-full w-full">
            <BikeSidePro dive={dive} brake={inputs.brakeF} motion={s.v / 30} pitch={s.stoppie ? 6 : 0} className="absolute inset-0" />
            <svg viewBox="0 0 384 224" className="absolute inset-0 h-full w-full">
              {decel > 0.3 && <Arrow x1={cogX} y1={cogY} x2={cogX + decel * 9} y2={cogY} color="#111111" label="inertia" labelDy={-8} />}
              <circle cx={cogX} cy={cogY} r={5} fill="#111111" />
              <Arrow x1={front.x} y1={gy} x2={front.x} y2={gy - (s.Nf / W) * 66} color="#8a8a8a" label="Nf" labelDy={-4} />
              <Arrow x1={rear.x} y1={gy} x2={rear.x} y2={gy - (s.Nr / W) * 66} color="#8a8a8a" label="Nr" labelDy={-4} />
            </svg>
          </div>
        </StageFrame>
        )}
        <div className="panel p-3">
          <div className="mb-2 flex items-center justify-between"><span className="eyebrow text-muted-foreground">Wheel loads</span><Chip tone={tone}>{lock}</Chip></div>
          <div className="grid grid-cols-2 gap-3">
            <MiniBar label="Front load" value={(s.Nf / W) * 100} max={100} unit="%" color="#8a8a8a" />
            <MiniBar label="Rear load" value={(s.Nr / W) * 100} max={100} unit="%" color="#8a8a8a" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Heading kicker="Module 05 · Longitudinal" title="Braking & weight transfer">
          Get rolling with the throttle, then hold the brake. Momentum pitches weight forward — the forks dive, the front loads up and the rear goes light. Brake hard enough and the rear lifts (stoppie).
        </Heading>
        <TryThis>Hold <b className="text-foreground">Throttle</b> to get moving, then hold <b className="text-foreground">Brake</b>. The forks dive, the FRONT-LOAD gauge jumps and the rear goes light — which is why the front brake does most of the stopping.</TryThis>
        <Deck title="Surface">
          <Ctrl label="Tyre grip (μ)" value={config.mu} min={0.4} max={1.1} step={0.05} onChange={(v) => setConfig({ mu: v })} fmt={(x) => x.toFixed(2)} hint="Grip available for braking. Lower = the front locks and the stop gets longer." />
        </Deck>
        <div className="grid grid-cols-3 gap-2">
          <Tile label="Front" value={Math.round(s.Nf) + "N"} />
          <Tile label="Rear" value={Math.round(s.Nr) + "N"} />
          <Tile label="To stop" value={s.v > 0.5 ? dist.toFixed(0) + "m" : "—"} />
        </div>
        <Deck title="Equation & technique">
          <div className="rounded-lg bg-[hsl(var(--muted)/0.6)] px-3 py-2 font-mono text-[12px] text-foreground">ΔN = (m·a·h)/L · d = v²/(2a)</div>
          <Note>Squeeze progressively so weight transfers <b className="text-foreground">before</b> you ask for peak grip — grab it and the front can lock before it's loaded. The brake input here is biased front-heavy, like a real bike. Max deceleration on dry tarmac is ~0.9–1.0 g.</Note>
        </Deck>
      </div>
    </div>
  );
}
