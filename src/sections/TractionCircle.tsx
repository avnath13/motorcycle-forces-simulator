import { useRef } from "react";
import { Ctrl } from "@/components/Ctrl";
import { Gauge } from "@/components/Gauge";
import { StageFrame, Tile, Chip, Deck, Heading, Note , TryThis } from "@/components/Sim";
import { Arrow } from "@/components/Arrow";
import { useRide } from "@/sim/RideContext";

export default function TractionCircle() {
  const { state: s, config, setConfig } = useRide();
  const trail = useRef<[number, number][]>([]);
  // record G-G trace
  const pt: [number, number] = [s.latUsed, s.longUsed];
  if (Math.abs(pt[0]) > 0.005 || Math.abs(pt[1]) > 0.005) {
    trail.current.push(pt);
    if (trail.current.length > 120) trail.current.shift();
  }
  const cx = 200, cy = 200, Rr = 160;
  const mag = s.gripUsed;
  const over = mag > 1;
  const px = cx + s.latUsed * Rr, py = cy - s.longUsed * Rr;
  const tone = mag > 1 ? "bad" : mag > 0.92 ? "warn" : "good";
  const status = mag > 1 ? "Sliding" : mag > 0.92 ? "At limit" : "Grip in hand";
  const longTxt = s.aLong < -0.1 ? "Brake" : s.aLong > 0.1 ? "Drive" : "Neutral";

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-center gap-6 sm:justify-start">
          <Gauge value={Math.abs(s.longUsed) * 100} max={125} label={s.aLong < 0 ? "Braking" : "Drive"} unit="%" color="#b59000" redlineFrom={100} />
          <Gauge value={Math.abs(s.latUsed) * 100} max={125} label="Cornering" unit="%" redlineFrom={100} />
          <Gauge value={mag * 100} max={125} label="Grip used" unit="%" redlineFrom={100} color={over ? "#e23b3b" : "#8a8a8a"} />
        </div>
        <StageFrame label="Friction circle · live G-G trace" aspect="1 / 1">
          <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
            <line x1={cx - Rr - 16} y1={cy} x2={cx + Rr + 16} y2={cy} stroke="#cfcfcf" />
            <line x1={cx} y1={cy - Rr - 16} x2={cx} y2={cy + Rr + 16} stroke="#cfcfcf" />
            {[0.25, 0.5, 0.75].map((f) => <circle key={f} cx={cx} cy={cy} r={Rr * f} fill="none" stroke="#1e2a38" strokeDasharray="4 4" />)}
            <circle cx={cx} cy={cy} r={Rr} fill="none" stroke="#111111" strokeWidth={2.5} opacity={over ? 0.4 : 1} />
            {over && <circle cx={cx} cy={cy} r={Rr} fill="none" stroke="#e23b3b" strokeWidth={2.5} strokeDasharray="6 5" />}
            <text x={cx} y={cy - Rr - 22} textAnchor="middle" fill="#b59000" fontSize={13} className="font-mono">BRAKING</text>
            <text x={cx} y={cy + Rr + 30} textAnchor="middle" fill="#b59000" fontSize={13} className="font-mono">ACCELERATING</text>
            <text x={cx - Rr - 2} y={cy - 8} textAnchor="middle" fill="#b59000" fontSize={12} className="font-mono">TURN L</text>
            <text x={cx + Rr + 2} y={cy - 8} textAnchor="middle" fill="#b59000" fontSize={12} className="font-mono">TURN R</text>
            <polyline points={trail.current.map(([la, lo]) => `${cx + la * Rr},${cy - lo * Rr}`).join(" ")} fill="none" stroke="#8a8a8a" strokeWidth={1.5} opacity={0.4} />
            <Arrow x1={cx} y1={cy} x2={px} y2={py} color={over ? "#e23b3b" : "#8a8a8a"} width={3} />
            <circle cx={px} cy={py} r={9} fill={over ? "#e23b3b" : "#8a8a8a"} />
            <circle cx={px} cy={py} r={15} fill="none" stroke={over ? "#e23b3b" : "#8a8a8a"} strokeWidth={1.5} opacity={0.5} />
          </svg>
        </StageFrame>
        <div className="grid grid-cols-4 gap-2">
          <Tile label="Long." value={longTxt} />
          <Tile label="Lateral" value={Math.round(Math.abs(s.latUsed) * 100) + "%"} />
          <Tile label="Total" value={Math.round(mag * 100) + "%"} tone={tone} />
          <Tile label="Status" value={<Chip tone={tone}>{status}</Chip>} />
        </div>
      </div>
      <div className="space-y-4">
        <Heading kicker="Module 07 · Synthesis" title="The traction circle">
          The idea that ties everything together. A tyre has one grip budget, shared between braking/accelerating (vertical) and turning (horizontal). Ride around — brake, lean, drive — and watch the dot trace your grip usage. Cross the circle and you slide.
        </Heading>
        <TryThis>Ride around — brake, then lean, then try braking <b className="text-foreground">while</b> leaned. The dot pushes diagonally toward the edge of the circle. Cross the line and you have asked for more grip than you have: a slide.</TryThis>
        <Deck title="Surface">
          <Ctrl label="Available grip (μ)" value={config.mu} min={0.4} max={1.2} step={0.05} onChange={(v) => setConfig({ mu: v })} fmt={(x) => x.toFixed(2)} hint="Sets the size of the grip circle. Rain or cold rubber shrinks it, so you slide with less input." />
        </Deck>
        <Deck title="Trail braking">
          <Note>Advanced riders <b className="text-foreground">trail</b> the brakes into a corner — bleeding off pressure as lean builds, trading grip from braking to cornering so the total stays just inside the circle. Try braking while leaned: the dot pushes diagonally toward the edge. Brake hard while fully leaned and you cross it. Rain shrinks the whole circle.</Note>
        </Deck>
      </div>
    </div>
  );
}
