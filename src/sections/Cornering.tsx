import { useState } from "react";
import BikeRearPro from "@/components/BikeRearPro";
import { FpvView } from "@/components/FpvView";
import { Arrow } from "@/components/Arrow";
import { Ctrl } from "@/components/Ctrl";
import { Gauge } from "@/components/Gauge";
import { StageFrame, GaugeRow, Tile, Chip, Deck, Heading, Note, TryThis, ViewToggle } from "@/components/Sim";
import { useRide } from "@/sim/RideContext";
import { deg } from "@/lib/physics";

export default function Cornering() {
  const { state: s, config, setConfig } = useRide();
  const [fpv, setFpv] = useState(false);
  const leanDeg = deg(s.lean);
  const tone = s.gripUsed < 0.8 ? "good" : s.gripUsed <= 1 ? "warn" : "bad";
  const status = s.gripUsed < 0.8 ? "Within grip" : s.gripUsed <= 1 ? "Near limit" : "Sliding";
  const hPx = 150;
  const cgx = 200 + Math.sin(s.lean) * hPx;
  const cgy = 250 - Math.cos(s.lean) * hPx;
  const latLen = 64 * Math.max(-1, Math.min(1, s.latUsed));

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">
        <GaugeRow>
          <Gauge value={s.speedKmh} max={200} label="Speed" unit="km/h" />
          <Gauge value={Math.abs(leanDeg)} max={60} label="Lean" unit="deg" redlineFrom={50} color={s.sliding ? "#e23b3b" : "hsl(var(--primary))"} />
          <Gauge value={Math.abs(s.gLat)} max={1.4} decimals={2} label="Lateral" unit="g" redlineFrom={1.1} color="#b59000" />
        </GaugeRow>
        <ViewToggle fpv={fpv} setFpv={setFpv} />
        {fpv ? (
          <StageFrame label="First-person · behind rider" aspect="400 / 280"><FpvView leanDeg={leanDeg} steer={Math.max(-1, Math.min(1, s.lean * 1.6))} speedKmh={s.speedKmh} phase={s.distance} /></StageFrame>
        ) : (
        <StageFrame label="Rear · live lean & forces" aspect="400 / 280">
          <div className="relative h-full w-full">
            <BikeRearPro lean={leanDeg} height={hPx} danger={s.sliding} className="absolute inset-0" />
            <svg viewBox="0 0 400 280" className="absolute inset-0 h-full w-full">
              <Arrow x1={cgx} y1={cgy} x2={cgx} y2={cgy + 60} color="#111111" label="mg" />
              {Math.abs(latLen) > 4 && <Arrow x1={cgx} y1={cgy} x2={cgx + latLen} y2={cgy} color="#b59000" label="m·v²/r" labelDy={-10} />}
              <Arrow x1={cgx} y1={cgy} x2={200} y2={250} color="#111111" width={2.5} />
              <text x={200} y={22} textAnchor="middle" fill="#7a7a7a" fontSize={12} className="font-mono">{s.radius === Infinity ? "straight" : "r ≈ " + Math.round(s.radius) + " m"}</text>
            </svg>
          </div>
        </StageFrame>
        )}
        <div className="grid grid-cols-4 gap-2">
          <Tile label="Lean" value={Math.abs(leanDeg).toFixed(0) + "°"} />
          <Tile label="Grip used" value={(s.gripUsed * 100).toFixed(0) + "%"} tone={tone} />
          <Tile label="Radius" value={s.radius === Infinity ? "∞" : Math.round(s.radius) + "m"} />
          <Tile label="Status" value={<Chip tone={tone}>{status}</Chip>} />
        </div>
      </div>
      <div className="space-y-4">
        <Heading kicker="Module 04 · Lateral" title="Cornering & lean angle">
          Ride up to speed, then hold A or D (or the lean slider below) to lean into a corner. The bike leans until gravity and the cornering force line up through the tyre. Watch grip climb as you lean harder or carry more speed.
        </Heading>
        <TryThis>Hold <b className="text-foreground">Throttle</b> to build speed, then <b className="text-foreground">Lean</b>. LEAN and GRIP climb together. Now drop the <b className="text-foreground">grip (μ)</b> slider — the same lean now exceeds the limit and the bike slides.</TryThis>
        <Deck title="Surface">
          <Ctrl label="Tyre grip (μ)" value={config.mu} min={0.4} max={1.3} step={0.05} onChange={(v) => setConfig({ mu: v })} fmt={(x) => x.toFixed(2)} hint="Grip available. Lower it (rain, cold tyres) and the same lean slides sooner — watch the grip readout." />
          <Note>Lean depends on speed and radius, not on grip — μ only sets the limit. Lower it (rain, cold tyres) and the same lean tips you over the friction circle sooner.</Note>
        </Deck>
        <Deck title="Camber thrust">
          <Note>A bike tyre's rounded profile means that, leaned over, the contact patch sits off-centre and the tyre tries to roll in a circle — supplying much of the cornering force on top of sideways grip. That's how a bike corners hard on a small patch of rubber.</Note>
        </Deck>
      </div>
    </div>
  );
}
