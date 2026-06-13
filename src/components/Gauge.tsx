import { clamp } from "@/lib/physics";

type Props = {
  value: number; min?: number; max: number;
  label: string; unit?: string; color?: string;
  redlineFrom?: number; size?: number; decimals?: number;
};

const START = 130, SWEEP = 280;
const pol = (cx: number, cy: number, r: number, d: number) => [cx + r * Math.cos((d * Math.PI) / 180), cy + r * Math.sin((d * Math.PI) / 180)];
function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const [x0, y0] = pol(cx, cy, r, a0), [x1, y1] = pol(cx, cy, r, a1);
  const lg = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${lg} 1 ${x1} ${y1}`;
}

export function Gauge({ value, min = 0, max, label, unit = "", redlineFrom, size = 150, decimals = 0 }: Props) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 18;
  const frac = clamp((value - min) / (max - min), 0, 1);
  const vd = START + frac * SWEEP;
  const danger = redlineFrom != null && value >= redlineFrom;
  const [dx, dy] = pol(cx, cy, r, vd);
  const ticks = Array.from({ length: 9 }, (_, i) => {
    const d = START + (i / 8) * SWEEP;
    const [x1, y1] = pol(cx, cy, r + 5, d), [x2, y2] = pol(cx, cy, r + 9, d);
    const hot = redlineFrom != null && min + (i / 8) * (max - min) >= redlineFrom;
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={hot ? "#e23b3b" : "var(--hair)"} strokeWidth={1.5} />;
  });
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={arc(cx, cy, r, START, START + SWEEP)} fill="none" stroke="var(--dial-track)" strokeWidth={3} />
        <path d={arc(cx, cy, r, START, vd)} fill="none" stroke={danger ? "#e23b3b" : "var(--ink)"} strokeWidth={3}
          style={{ transition: "all .18s linear" }} />
        {ticks}
        <circle cx={dx} cy={dy} r={6} fill={danger ? "#e23b3b" : "var(--yellow)"} stroke="var(--ink)" strokeWidth={2}
          style={{ transition: "all .18s linear" }} />
        <text x={cx} y={cy + size * 0.025} textAnchor="middle" fill="var(--ink)" fontSize={size * 0.2}
          className="num" style={{ fontFamily: "ui-monospace, monospace" }}>{value.toFixed(decimals)}</text>
        <text x={cx} y={cy + size * 0.17} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize={size * 0.075}
          className="label-cap" style={{ fontFamily: "ui-monospace, monospace", letterSpacing: "0.08em" }}>{label} {unit}</text>
      </svg>
    </div>
  );
}

export function MiniBar({ label, value, max, unit = "", danger }: { label: string; value: number; max: number; color?: string; unit?: string; danger?: boolean }) {
  const pct = clamp((value / max) * 100, 0, 100);
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-[11px]"><span className="label-cap text-muted-foreground">{label}</span><span className="num text-foreground">{Math.round(value)}{unit}</span></div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--hair)" }}>
        <div className="h-full rounded-full" style={{ width: pct + "%", background: danger || value > max * 0.92 ? "#e23b3b" : "var(--ink)", transition: "width .18s" }} />
      </div>
    </div>
  );
}
