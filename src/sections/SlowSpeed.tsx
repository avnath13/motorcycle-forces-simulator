import { useState } from "react";
import { FpvView } from "@/components/FpvView";
import BikeRearPro from "@/components/BikeRearPro";
import { Gauge } from "@/components/Gauge";
import { StageFrame, GaugeRow, Tile, Chip, Deck, Heading, Note , TryThis, ViewToggle } from "@/components/Sim";
import { useRide } from "@/sim/RideContext";
import { FZ_LOW, FZ_HIGH } from "@/sim/engine";
import { deg } from "@/lib/physics";

const VCRIT = 8; // km/h

export default function SlowSpeed() {
  const { state: s, inputs } = useRide();
  const [fpv, setFpv] = useState(false);
  const stableEnough = s.speedKmh >= VCRIT;
  const inFZ = inputs.clutch >= FZ_LOW && inputs.clutch <= FZ_HIGH;
  const drive = s.stalled ? "Stalled" : inFZ ? "Friction zone" : s.clutchEngage > 0.9 ? "Fully engaged" : inputs.clutch > 0.85 ? "Clutch in" : "Slipping";
  const settled = inFZ && inputs.brakeF > 0.04;
  const stab = s.speedKmh < VCRIT ? (s.speedKmh / VCRIT) * 25 : Math.min(100, 25 + (s.speedKmh - VCRIT) / 14 * 100);
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">
        <GaugeRow>
          <Gauge value={Math.min(40, s.speedKmh)} max={40} decimals={1} label="Speed" unit="km/h" redlineFrom={VCRIT} />
          <Gauge value={inputs.clutch * 100} max={100} label="Clutch" unit="%" redlineFrom={FZ_HIGH * 100} />
          <Gauge value={stab} max={100} label="Self-stability" unit="%" color={stableEnough ? "#8a8a8a" : "#e23b3b"} />
        </GaugeRow>
        <ViewToggle fpv={fpv} setFpv={setFpv} />
        {fpv ? (
          <StageFrame label="First-person · behind rider" aspect="400 / 280"><FpvView leanDeg={deg(s.lean)} steer={Math.max(-1, Math.min(1, s.lean * 1.5))} speedKmh={s.speedKmh} phase={s.distance} /></StageFrame>
        ) : (
        <StageFrame label="Rear · slow balance" aspect="400 / 280">
          <div className="relative h-full w-full">
            <BikeRearPro lean={deg(s.lean) * 0.6} height={150} danger={!stableEnough && s.speedKmh > 0.5} className="absolute inset-0" />
            <svg viewBox="0 0 400 280" className="absolute inset-0 h-full w-full">
              <text x={200} y={22} textAnchor="middle" fill="#7a7a7a" fontSize={12} className="font-mono">{stableEnough ? "self-balancing" : "you balance it"}</text>
            </svg>
          </div>
        </StageFrame>
        )}
        <div className="panel p-3">
          <div className="mb-2 eyebrow text-muted-foreground">Self-stability vs speed</div>
          <svg viewBox="0 0 400 120" className="w-full">
            <line x1={30} y1={100} x2={388} y2={100} stroke="var(--hair)" />
            {(() => { const pts = []; for (let i = 0; i <= 100; i++) { const v = (i / 100) * 40; const sx = 30 + (i / 100) * 358; const st = v < VCRIT ? (v / VCRIT) * 0.25 : Math.min(1, 0.25 + (v - VCRIT) / 26); pts.push(`${sx},${100 - st * 82}`); }
              const xc = 30 + (VCRIT / 40) * 358; const xm = 30 + (Math.min(s.speedKmh, 40) / 40) * 358; const stm = s.speedKmh < VCRIT ? (s.speedKmh / VCRIT) * 0.25 : Math.min(1, 0.25 + (s.speedKmh - VCRIT) / 26);
              return (<g><polyline points={pts.join(" ")} fill="none" stroke="hsl(var(--primary))" strokeWidth={2.5} /><line x1={xc} y1={14} x2={xc} y2={100} stroke="#b59000" strokeWidth={1.5} strokeDasharray="4 4" /><text x={xc + 5} y={24} fill="#b59000" fontSize={11} className="font-mono">critical</text><circle cx={xm} cy={100 - stm * 82} r={5} fill="#e23b3b" /></g>); })()}
          </svg>
        </div>
      </div>
      <div className="space-y-4">
        <Heading kicker="Module 02 · Balance" title="Slow speed & the friction zone">
          Feather the throttle and drag a little brake to creep below walking pace. Below the critical speed there's almost no self-stability — you build it with the clutch friction zone, a trailing brake, and direct steering.
        </Heading>
        <TryThis>Set the <b className="text-foreground">Clutch</b> slider into the yellow <b className="text-foreground">friction zone</b> and add a little <b className="text-foreground">Throttle</b> to creep forward. Hold it under the orange critical mark and the SELF-STABILITY gauge stays near zero — slip the clutch (and drag the brake) to stay balanced. Let the clutch fully out at a standstill with no throttle and the engine <b className="text-foreground">stalls</b>.</TryThis>
        <div className="grid grid-cols-2 gap-2">
          <Tile label="Stability" value={<Chip tone={stableEnough ? "good" : "warn"}>{stableEnough ? "Self-balancing" : "You balance it"}</Chip>} />
          <Tile label="Chassis" value={<Chip tone={settled ? "good" : "warn"}>{settled ? "Settled" : "Loose"}</Chip>} />
          <Tile label="Drive" value={<span className="text-[14px]">{drive}</span>} tone={s.stalled ? "bad" : undefined} />
          <Tile label="Mode" value={<span className="text-[14px]">Direct</span>} />
        </div>
        <Deck title="Technique">
          <Note>The friction zone is the band of clutch travel where the plates slip — a controllable trickle of drive. Pair it with a <b className="text-foreground">light rear brake</b> and the drivetrain stays under tension: the brake scrubs surplus speed while the clutch keeps gentle pull. That tension settles the chassis and gives control no throttle alone can match.</Note>
        </Deck>
      </div>
    </div>
  );
}
