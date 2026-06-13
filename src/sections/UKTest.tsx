import { useEffect, useRef, useState } from "react";
import { useRide } from "@/sim/RideContext";
import { StageFrame, Tile, Chip, Deck, Heading, Note, TryThis } from "@/components/Sim";
import { deg } from "@/lib/physics";

type Sample = { x: number; y: number; h: number; v: number; t: number; brake: number };
type Cone = { x: number; y: number; c: string };
type Line = { x0: number; y0: number; x1: number; y1: number; c: string; dash?: boolean };
type Result = { status: "idle" | "go" | "pass" | "fail"; metric: string; progress: number; tip: string };
type Man = {
  id: string; name: string; instr: string; technique: string; physics: string; spec: string;
  cones: Cone[]; lines: Line[]; view: number; lane?: { x: number; y: number }[];
  check: (h: Sample[], cur: Sample) => Result;
};

const YEL = "#e6c200", BLU = "#2f6fd6", RED = "#e23b3b", GRN = "#3a9d4f", GRY = "#7a7a7a", ORG = "#e8702a", WHT = "#d8d8d8";
const speed = (v: number) => v * 3.6;

// cones lining a lane: orange on the outside of the bend, blue on the inside (as on the real pad)
function edgeCones(lane: { x: number; y: number }[], half = 3, step = 4.5, maxX = 16): Cone[] {
  const out: Cone[] = []; let last = -99;
  for (const p of lane) { if (p.x < 0 || p.x > maxX) continue; if (p.x - last >= step) { out.push({ x: p.x, y: p.y + half, c: ORG }); out.push({ x: p.x, y: p.y - half, c: BLU }); last = p.x; } }
  return out;
}

// curved approach lane: a bend (the "cornering") that returns to centre, then runs straight
function bendLane(endX: number, amp = 3): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  for (let x = -3; x <= endX; x += 0.8) {
    const t = Math.max(0, Math.min(1, (x - 2) / 11));
    const y = x > 2 && x <= 13 ? amp * Math.sin(Math.PI * t) : 0;
    pts.push({ x, y });
  }
  return pts;
}

const MANOEUVRES: Man[] = [
  {
    id: "slalom", name: "Slalom", spec: "5 cones \u00b7 4.5 m apart", view: 28,
    instr: "Ride between the first and second cones, then weave through all five using light countersteer pulses.",
    technique: "Keep the revs up and slip the clutch for a steady walking-to-jogging pace; flop the bike side to side, look at the next cone.",
    physics: "At speed you lean by countersteering \u2014 each cone is a push-to-lean then lift-to-stand cycle.",
    cones: [6, 10.5, 15, 19.5, 24].map((x) => ({ x, y: 0, c: YEL })),
    lines: [],
    check: (h, c) => {
      const xs = [6, 10.5, 15, 19.5, 24];
      let passed = 0, last = 0, ok = true;
      for (const cx of xs) { const near = h.filter((p) => Math.abs(p.x - cx) < 0.8); if (!near.length) break; const side = near[0].y >= 0 ? 1 : -1; passed++; if (last !== 0 && side === last) ok = false; last = side; }
      if (c.x > 25 && passed >= 5) return { status: ok ? "pass" : "fail", metric: `${passed}/5 cones`, progress: 1, tip: ok ? "Nice rhythm." : "Alternate sides on each cone." };
      return { status: "go", metric: `${passed}/5 cones \u00b7 ${speed(c.v).toFixed(0)} km/h`, progress: passed / 5, tip: "Weave to the opposite side of each cone." };
    },
  },
  {
    id: "fig8", name: "Figure of eight", spec: "2 cones \u00b7 ~6 m apart \u00b7 twice", view: 16,
    instr: "Loop around one cone, cross between them, loop around the other \u2014 a figure-8, twice without stopping.",
    technique: "Slow, clutch-controlled, plenty of lock. Take a wide line and look across to the next cone.",
    physics: "Two opposite low-speed turns back to back \u2014 balance comes from drive tension and steering, not lean.",
    cones: [{ x: 6, y: 0, c: BLU }, { x: 12, y: 0, c: BLU }],
    lines: [],
    check: (h) => {
      let total = 0;
      for (let i = 1; i < h.length; i++) { let d = h[i].h - h[i - 1].h; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; total += Math.abs(d); }
      const loops = total / (2 * Math.PI);
      if (loops >= 2) return { status: "pass", metric: `${loops.toFixed(1)} loops`, progress: 1, tip: "Figure-8 complete." };
      return { status: "go", metric: `${loops.toFixed(1)} / 2 loops`, progress: Math.min(1, loops / 2), tip: "Keep circling \u2014 loop the far cone the other way." };
    },
  },
  {
    id: "slow", name: "Slow ride", spec: "ride ~15 m at walking pace", view: 20,
    instr: "Ride as slowly as you can in a straight line from the start to the finish marker without a foot down.",
    technique: "First gear, slip the clutch, drag a little rear brake (never the front), look as far ahead as possible.",
    physics: "Below the critical speed there is no self-stability \u2014 clutch slip + trailing brake keep the bike planted.",
    cones: [{ x: 2, y: 0, c: YEL }, { x: 17, y: 0, c: YEL }],
    lines: [{ x0: 2, y0: 0, x1: 17, y1: 0, c: YEL, dash: true }],
    check: (h, c) => {
      const maxV = Math.max(0, ...h.map((p) => speed(p.v)));
      if (c.x >= 17) return { status: maxV <= 8 ? "pass" : "fail", metric: `top speed ${maxV.toFixed(1)} km/h`, progress: 1, tip: maxV <= 8 ? "Smooth slow control." : "Too quick \u2014 feather the clutch, drag more rear brake." };
      return { status: "go", metric: `${speed(c.v).toFixed(1)} km/h \u00b7 ${Math.max(0, c.x).toFixed(0)}/17 m`, progress: Math.min(1, c.x / 17), tip: "Keep it slow and look up." };
    },
  },
  {
    id: "uturn", name: "U-turn", spec: "7.5 m wide strip", view: 16,
    instr: "Ride up the strip, then make a full U-turn and come back \u2014 without crossing the outer lines or stopping.",
    technique: "Lifesaver to the exit, slip the clutch, trail the rear brake, lean the bike (not your body) on full lock.",
    physics: "Tighter turn needs more lean for the speed (r = v\u00b2/g\u00b7tan\u03b8). Keep speed low so the lean fits inside 7.5 m.",
    cones: [{ x: 0, y: -3.75, c: BLU }, { x: 0, y: 3.75, c: BLU }, { x: 13, y: -3.75, c: BLU }, { x: 13, y: 3.75, c: BLU }],
    lines: [{ x0: 0, y0: -3.75, x1: 13, y1: -3.75, c: WHT }, { x0: 0, y0: 3.75, x1: 13, y1: 3.75, c: WHT }],
    check: (h, c) => {
      const maxY = Math.max(0, ...h.map((p) => Math.abs(p.y)));
      const turned = (Math.abs(c.h) * 180) / Math.PI;
      if (maxY > 3.75) return { status: "fail", metric: `width used ${maxY.toFixed(1)} m`, progress: Math.min(1, turned / 180), tip: "Too wide \u2014 slower, more lock, look through the turn." };
      if (turned >= 170) return { status: "pass", metric: `turned ${turned.toFixed(0)}\u00b0 in ${maxY.toFixed(1)} m`, progress: 1, tip: "Clean U-turn inside the strip." };
      return { status: "go", metric: `${turned.toFixed(0)}\u00b0 \u00b7 ${maxY.toFixed(1)} m wide`, progress: Math.min(1, turned / 180), tip: "Keep leaning it round \u2014 look where you want to go." };
    },
  },
  {
    id: "cstop", name: "Cornering & controlled stop", spec: "stop in the cone box", view: 26,
    instr: "Follow the lane round the bend, then bring the bike to a smooth, controlled halt with the front wheel inside the box.",
    technique: "Roll off, squeeze the front progressively, ease in the rear, square the bars and put the left foot down.",
    physics: "Braking shifts weight forward \u2014 squeeze progressively so the front loads before you ask for grip, or it locks.",
    cones: [{ x: 18, y: -1.4, c: RED }, { x: 20.5, y: -1.4, c: RED }, { x: 18, y: 1.4, c: RED }, { x: 20.5, y: 1.4, c: RED }, ...edgeCones(bendLane(23))],
    lines: [], lane: bendLane(23),
    check: (h, c) => {
      if (speed(c.v) < 0.4 && c.x > 3) { const inBox = c.x >= 18 && c.x <= 20.5; return { status: inBox ? "pass" : "fail", metric: `stopped at ${c.x.toFixed(1)} m`, progress: 1, tip: inBox ? "Stopped in the box." : c.x < 18 ? "Stopped short \u2014 carry into the box." : "Overran \u2014 brake a touch earlier." }; }
      return { status: "go", metric: `${speed(c.v).toFixed(0)} km/h \u00b7 ${Math.max(0, c.x).toFixed(1)} m`, progress: Math.min(1, c.x / 20), tip: "Roll up and stop inside the blue box." };
    },
  },
  {
    id: "estop", name: "Cornering & emergency stop", spec: "reach 50 km/h, then stop", view: 36,
    instr: "Round the approach bend, accelerate to at least 50 km/h before the speed-trap line, then brake as hard as you safely can \u2014 straight and upright.",
    technique: "Quick but progressive squeeze: load the front first, then build to maximum. Bars straight, both brakes, paddle to a stop.",
    physics: "Max deceleration is set by grip and weight transfer (~0.9\u20131.0 g dry). Grab the lever and the front locks before it loads.",
    cones: edgeCones(bendLane(33)),
    lines: [{ x0: 28, y0: -2, x1: 28, y1: 2, c: GRY, dash: true }], lane: bendLane(33),
    check: (h, c) => {
      const top = Math.max(0, ...h.map((p) => speed(p.v)));
      if (top < 50) return { status: "go", metric: `${speed(c.v).toFixed(0)} / 50 km/h`, progress: Math.min(1, top / 50), tip: "Accelerate to 50 km/h before the trap line (28 m)." };
      const bs = h.find((p) => p.brake > 0.5 && speed(p.v) > 10);
      if (speed(c.v) < 0.5 && bs) { const dist = c.x - bs.x; return { status: "pass", metric: `stopped in ${dist.toFixed(1)} m`, progress: 1, tip: `Good stop \u2014 ~${dist.toFixed(0)} m from ${top.toFixed(0)} km/h.` }; }
      return { status: "go", metric: `${speed(c.v).toFixed(0)} km/h \u2014 braking`, progress: 0.8, tip: "Squeeze progressively to a full stop." };
    },
  },
  {
    id: "swerve", name: "Cornering & hazard avoidance", spec: "50 km/h \u00b7 swerve \u00b7 stop", view: 42,
    instr: "Round the bend onto the straight, reach 50 km/h down the channel, flick LEFT after the yellow cone to miss the blue hazard, then cut back and stop in the blue box.",
    technique: "Don't stare at the cones \u2014 ride down the middle, one firm countersteer to go round, a second to straighten, then brake once upright.",
    physics: "Steering and braking share one grip budget \u2014 brake hard while still swerving and you exceed the traction circle. Swerve first, brake after.",
    cones: [
      { x: 18, y: -1.2, c: YEL }, { x: 18, y: 1.2, c: YEL },
      { x: 26, y: 0, c: YEL },
      { x: 30, y: -0.7, c: BLU },
      { x: 36, y: -1.3, c: BLU }, { x: 39, y: -1.3, c: BLU }, { x: 36, y: 1.3, c: BLU }, { x: 39, y: 1.3, c: BLU },
      ...edgeCones(bendLane(14, 2.4)),
    ],
    lines: [{ x0: 14, y0: -1.2, x1: 26, y1: -1.2, c: GRY, dash: true }, { x0: 14, y0: 1.2, x1: 26, y1: 1.2, c: GRY, dash: true }], lane: bendLane(14, 2.4),
    check: (h, c) => {
      const top = Math.max(0, ...h.map((p) => speed(p.v)));
      const atHaz = h.filter((p) => Math.abs(p.x - 30) < 1.0);
      const clear = atHaz.length ? Math.max(...atHaz.map((p) => p.y)) : -9;
      const brakedEarly = h.some((p) => p.x < 29 && p.brake > 0.5 && speed(p.v) > 15);
      if (top < 45 && c.x < 26) return { status: "go", metric: `${speed(c.v).toFixed(0)} / 50 km/h`, progress: Math.min(1, top / 50), tip: "Get to ~50 down the channel." };
      if (c.x > 35 && speed(c.v) < 0.6) {
        const ok = clear > 0.6 && !brakedEarly && c.x >= 35.5 && c.x <= 39.5;
        return { status: ok ? "pass" : "fail", metric: ok ? "cleared & stopped" : brakedEarly ? "braked too early" : "missed the line", progress: 1, tip: ok ? "Swerved clean, then stopped in the box." : brakedEarly ? "Swerve first, brake after you're upright." : "Swerve left of the blue hazard, then stop in the box." };
      }
      return { status: "go", metric: c.x > 26 ? "swerve left!" : `${speed(c.v).toFixed(0)} km/h`, progress: Math.min(1, Math.max(top / 50, c.x / 36)), tip: "After the yellow cone, flick left round the blue hazard." };
    },
  },
];


export default function UKTest() {
  const { state: s, reset } = useRide();
  const [mi, setMi] = useState(0);
  const hist = useRef<Sample[]>([]);
  const man = MANOEUVRES[mi];

  useEffect(() => {
    const last = hist.current[hist.current.length - 1];
    const sample: Sample = { x: s.x, y: s.y, h: s.heading, v: s.v, t: s.distance, brake: s.aLong < -2.5 ? 1 : 0 };
    if (!last || Math.hypot(s.x - last.x, s.y - last.y) > 0.15 || Math.abs(s.v - last.v) > 0.5) {
      hist.current.push(sample);
      if (hist.current.length > 600) hist.current.shift();
    }
  });
  function restart() { hist.current = []; reset(); }
  useEffect(() => { hist.current = []; reset(); /* eslint-disable-next-line */ }, [mi]);

  const cur: Sample = { x: s.x, y: s.y, h: s.heading, v: s.v, t: s.distance, brake: s.aLong < -2.5 ? 1 : 0 };
  const res: Result = hist.current.length ? man.check(hist.current, cur) : { status: "idle", metric: "ready", progress: 0, tip: man.instr };
  const tone = res.status === "pass" ? "good" : res.status === "fail" ? "bad" : "warn";

  const C = 200, SCALE = 185 / man.view;
  const ch = Math.cos(s.heading), sh = Math.sin(s.heading);
  const tf = (wx: number, wy: number) => {
    const dx = wx - s.x, dy = wy - s.y;
    const fwd = dx * ch + dy * sh, lat = -dx * sh + dy * ch;
    return [C - lat * SCALE, C - fwd * SCALE];
  };
  const trail = hist.current.slice(-220).map((p) => tf(p.x, p.y));

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {MANOEUVRES.map((m, i) => (
            <button key={m.id} onClick={() => setMi(i)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${i === mi ? "border-transparent bg-foreground text-[hsl(var(--background))]" : "border-border text-muted-foreground hover:text-foreground"}`}>
              {m.name}
            </button>
          ))}
        </div>

        <StageFrame label={`Mod 1 pad · ${man.spec}`} aspect="1 / 1">
          <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
            {man.lane && (() => {
              const mid = man.lane.map((p) => tf(p.x, p.y).join(",")).join(" ");
              return <g key="lane"><polyline points={mid} fill="none" stroke="#5a5a5a" strokeWidth={1} strokeDasharray="5 8" opacity={0.7} /></g>;
            })()}
            {man.lines.map((l, i) => { const a = tf(l.x0, l.y0), b = tf(l.x1, l.y1); return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={l.c} strokeWidth={2.5} strokeDasharray={l.dash ? "7 6" : undefined} opacity={0.9} />; })}
            {trail.length > 1 && <polyline points={trail.map((p) => p.join(",")).join(" ")} fill="none" stroke="#8a8a8a" strokeWidth={2} opacity={0.55} />}
            {man.cones.map((cn, i) => { const p = tf(cn.x, cn.y); const cr = Math.max(4.5, 0.5 * SCALE); return <g key={i}><circle cx={p[0]} cy={p[1]} r={cr} fill={cn.c} stroke="#111" strokeWidth={1} /></g>; })}
            {(() => { const bw = Math.max(5, 0.85 * SCALE), bl = Math.max(15, 2.1 * SCALE); return (
            <g transform={`translate(${C},${C}) rotate(${deg(s.lean) * 0.5})`}>
              <rect x={-bw / 2} y={-bl / 2} width={bw} height={bl} rx={bw / 2} fill="#111" />
              <rect x={-bw * 0.38} y={-bl / 2 - bw * 0.45} width={bw * 0.76} height={bw * 0.8} rx={2} fill={YEL} />
              <circle cx={0} cy={0} r={bw * 0.35} fill="#e2e2e2" />
            </g>); })()}
            <text x={200} y={392} textAnchor="middle" fill="#7a7a7a" fontSize={11} className="font-mono">forward ↑ · {res.metric}</text>
          </svg>
        </StageFrame>

        <div className="grid grid-cols-3 gap-2">
          <Tile label="Speed" value={Math.round(speed(s.v)) + ""} />
          <Tile label="Lean" value={Math.abs(deg(s.lean)).toFixed(0) + "°"} />
          <Tile label="Result" value={<Chip tone={tone}>{res.status === "idle" ? "Ready" : res.status === "go" ? "Running" : res.status === "pass" ? "Pass" : "Retry"}</Chip>} />
        </div>
      </div>

      <div className="space-y-4">
        <Heading kicker="Module 08 · UK Mod 1 pad" title={man.name}>
          Cone layout and colours follow the DVSA Module 1 manoeuvring area. Ride with the Throttle / Brake / Lean controls below; your traced path is checked against the manoeuvre.
        </Heading>
        <TryThis>{man.instr}</TryThis>
        <div className="flex items-center gap-3">
          <button onClick={restart} className="rounded-full bg-foreground px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-[hsl(var(--background))] transition active:scale-95">Restart manoeuvre</button>
          <span className="text-[12px] text-muted-foreground">{res.tip}</span>
        </div>
        <Deck title="Technique"><Note>{man.technique}</Note></Deck>
        <Deck title="The physics"><Note>{man.physics}</Note></Deck>
      </div>
    </div>
  );
}
