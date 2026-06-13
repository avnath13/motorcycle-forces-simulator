import { useState } from "react";
import BikeRearPro from "@/components/BikeRearPro";
import { FpvView } from "@/components/FpvView";
import { Gauge } from "@/components/Gauge";
import { StageFrame, GaugeRow, Tile, Chip, Deck, Heading, Note, TryThis, ViewToggle } from "@/components/Sim";
import { useRide } from "@/sim/RideContext";
import { deg } from "@/lib/physics";

export default function Steering() {
  const { state: s, inputs } = useRide();
  const [fpv, setFpv] = useState(false);
  const counter = s.v > 2;
  const leanDeg = deg(s.lean);
  const dir = inputs.steer > 0.02 ? 1 : inputs.steer < -0.02 ? -1 : 0;
  const forces: [string, number, string, string][] = [
    ["Gyroscopic precession", 0.18, "#111111", "starts the lean"],
    ["Camber thrust", 0.52, "#b59000", "sustains the turn"],
    ["Centripetal + gravity", 0.30, "#111111", "keeps it balanced"],
  ];
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">
        <GaugeRow>
          <Gauge value={s.speedKmh} max={200} label="Speed" unit="km/h" />
          <Gauge value={Math.abs(leanDeg)} max={55} label="Lean" unit="deg" color="#b59000" />
          <Gauge value={inputs.steer * 100} min={-100} max={100} label="Bar input" unit="%" />
        </GaugeRow>
        <ViewToggle fpv={fpv} setFpv={setFpv} />
        {fpv ? (
          <StageFrame label="First-person · behind rider" aspect="400 / 280"><FpvView leanDeg={leanDeg} steer={inputs.steer} speedKmh={s.speedKmh} phase={s.distance} /></StageFrame>
        ) : (
        <StageFrame label="Rear · countersteer → lean" aspect="400 / 280">
          <div className="relative h-full w-full">
            <BikeRearPro lean={leanDeg} height={150} className="absolute inset-0" />
            <svg viewBox="0 0 400 280" className="absolute inset-0 h-full w-full">
              <text x={200} y={22} textAnchor="middle" fill="#7a7a7a" fontSize={12} className="font-mono">{counter ? "countersteering" : "direct steering"}</text>
              {counter && dir !== 0 && Math.abs(s.steerVis) > 0.001 && (
                <text x={200} y={262} textAnchor="middle" fill="#b59000" fontSize={12}>front kicks {s.steerVis > 0 ? "right" : "left"} → leans {dir > 0 ? "right" : "left"}</text>
              )}
            </svg>
          </div>
        </StageFrame>
        )}
        <div className="panel p-3">
          <div className="mb-2 eyebrow text-muted-foreground">Who does what in the turn</div>
          <div className="space-y-2">
            {forces.map(([name, w, c, sub]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-[12px] text-foreground">{name}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded bg-[var(--hair)]">
                  <div className="h-full rounded" style={{ width: `${w * (counter ? 100 : 40)}%`, background: c, transition: "width .3s" }} />
                </div>
                <span className="w-24 shrink-0 text-right text-[11px] text-muted-foreground">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Heading kicker="Module 03 · Initiation" title="Steering: direct vs counter">
          Get rolling, then push left/right (A/D or the lean slider). Above walking pace the front wheel briefly kicks the <i>opposite</i> way (watch the readout) — that's countersteering, and it's how every bike turns at road speed.
        </Heading>
        <TryThis>Hold <b className="text-foreground">Throttle</b> to get rolling, then nudge the <b className="text-foreground">Lean</b> slider (or A/D). Above walking pace, watch the front wheel flick the <b className="text-foreground">opposite</b> way for an instant before the bike leans in — that is countersteering.</TryThis>
        <div className="grid grid-cols-2 gap-2">
          <Tile label="Mode" value={<Chip tone={counter ? "good" : "warn"}>{counter ? "Counter" : "Direct"}</Chip>} />
          <Tile label="Turning" value={<span className="text-[15px]">{dir === 0 ? "Straight" : dir > 0 ? "Right" : "Left"}</span>} />
        </div>
        <Deck title="Theory">
          <Note>To turn <b className="text-foreground">right you briefly push the right bar</b> (steering the front momentarily left). The contact patches dart out from under the centre of mass, the bike leans right, into the corner it goes. Gyroscopic precession starts the lean, camber thrust sustains it, centripetal force and gravity hold the balance.</Note>
        </Deck>
      </div>
    </div>
  );
}
