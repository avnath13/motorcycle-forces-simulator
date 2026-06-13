import { useRide } from "@/sim/RideContext";
import { deg } from "@/lib/physics";

export function Hud() {
  const { state: s } = useRide();
  const segs = 28, lit = Math.round((s.rpm / 11000) * segs);
  return (
    <div className="card-flat mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5">
      <div className="flex items-end gap-2.5">
        <div className="num text-[42px] leading-none text-foreground">{Math.round(s.speedKmh).toString().padStart(3, "0")}</div>
        <div className="pb-1 label-cap text-[10px] text-muted-foreground">km/h</div>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-md font-bold" style={{ background: "var(--yellow)", color: "#111" }}>{s.gear}</div>

      <div className="hidden h-9 w-px bg-border sm:block" />

      <div className="min-w-[140px] flex-1">
        <div className="mb-1 flex justify-between label-cap text-[10px] text-muted-foreground"><span>rpm</span><span className="num">{Math.round(s.rpm)}</span></div>
        <div className="flex h-2.5 items-end gap-[2px]">
          {Array.from({ length: segs }, (_, i) => {
            const on = i < lit, red = i > segs * 0.82;
            return <span key={i} className="flex-1 rounded-[1px]" style={{ height: `${45 + (i / segs) * 55}%`, background: on ? (red ? "#e23b3b" : "var(--ink)") : "var(--hair)" }} />;
          })}
        </div>
      </div>

      <div className="min-w-[120px]">
        <div className="mb-1 flex justify-between label-cap text-[10px] text-muted-foreground"><span>lean</span><span className="num">{Math.abs(deg(s.lean)).toFixed(0)}° {s.lean > 0.02 ? "R" : s.lean < -0.02 ? "L" : ""}</span></div>
        <div className="relative h-2.5 rounded-full" style={{ background: "var(--hair)" }}>
          <div className="absolute left-1/2 top-0 h-full w-px bg-muted-foreground/40" />
          <div className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[hsl(var(--card))]" style={{ left: `calc(${50 + (deg(s.lean) / 55) * 50}% - 6px)`, background: "var(--ink)", transition: "left .1s" }} />
        </div>
      </div>

      <div className="text-right">
        <div className="num text-sm text-foreground">{s.gripUsed > 1.4 ? "1.40+" : s.gripUsed.toFixed(2)}</div>
        <div className="label-cap text-[10px] text-muted-foreground">grip</div>
      </div>

      <div className="flex gap-1.5">
        {s.stalled && <span className="rounded-md bg-[#e23b3b] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Stalled</span>}
        {s.sliding && <span className="rounded-md bg-[#e23b3b] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Slide</span>}
        {s.wheelie && <span className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide" style={{ background: "var(--yellow)", color: "#111" }}>Wheelie</span>}
        {s.stoppie && <span className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide" style={{ background: "var(--yellow)", color: "#111" }}>Stoppie</span>}
        {!s.rolling && <span className="rounded-md border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Stopped</span>}
      </div>
    </div>
  );
}
