import { useRide } from "@/sim/RideContext";
import { FZ_LOW, FZ_HIGH } from "@/sim/engine";

function HoldBtn({ label, sub, onDown, onUp }: { label: string; sub: string; onDown: () => void; onUp: () => void }) {
  return (
    <button
      onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); onDown(); }}
      onPointerUp={onUp} onPointerCancel={onUp}
      className="flex select-none flex-col items-center rounded-2xl bg-foreground px-5 py-2.5 text-center text-[hsl(var(--background))] transition active:scale-95"
      style={{ touchAction: "none" }}>
      <span className="text-[13px] font-bold uppercase tracking-wide">{label}</span>
      <span className="label-cap text-[9px] opacity-60">{sub}</span>
    </button>
  );
}

export function RideControls() {
  const { state: s, inputs, press, setSteer, setClutch, gearUp, gearDown, assist, toggleAssist, reset } = useRide();
  const cl = Math.round(inputs.clutch * 100);
  const inFZ = inputs.clutch >= FZ_LOW && inputs.clutch <= FZ_HIGH;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <HoldBtn label="Throttle" sub="W" onDown={() => press("thr", true)} onUp={() => press("thr", false)} />
      <HoldBtn label="Brake" sub="S / Space" onDown={() => press("brk", true)} onUp={() => press("brk", false)} />

      {/* gear stepper */}
      <div className="flex items-center gap-1.5">
        <div className="flex flex-col items-center px-1">
          <span className="num text-xl leading-none text-foreground">{Math.round(inputs.gear)}</span>
          <span className="label-cap text-[8px] text-muted-foreground">gear</span>
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={gearUp} aria-label="Shift up" className="rounded-md border border-border px-2 py-0.5 text-[11px] font-bold text-foreground transition hover:border-foreground">▲<span className="ml-1 text-[8px] text-muted-foreground">E</span></button>
          <button onClick={gearDown} aria-label="Shift down" className="rounded-md border border-border px-2 py-0.5 text-[11px] font-bold text-foreground transition hover:border-foreground">▼<span className="ml-1 text-[8px] text-muted-foreground">Q</span></button>
        </div>
      </div>

      <div className="min-w-[140px] flex-1">
        <div className="mb-1 flex justify-between label-cap text-[10px] text-muted-foreground">
          <span>clutch · hold Shift</span>
          <span className="num" style={{ color: assist ? "#9a8a00" : s.stalled ? "#e23b3b" : inFZ ? "#9a8a00" : "inherit" }}>{assist ? "AUTO" : s.stalled ? "STALLED" : `${cl}%${inFZ ? " · friction zone" : cl < 20 ? " · out" : cl > 85 ? " · in" : ""}`}</span>
        </div>
        <div className="relative flex items-center" style={{ height: 16 }}>
          <div className="absolute h-1.5 rounded-full" style={{ left: 0, right: 0, background: "var(--hair)" }} />
          <div className="absolute h-1.5 rounded-sm" style={{ left: `${FZ_LOW * 100}%`, width: `${(FZ_HIGH - FZ_LOW) * 100}%`, background: "var(--yellow)", opacity: 0.55 }} />
          <input type="range" disabled={assist} className="mono-range relative w-full" style={{ background: "transparent", opacity: assist ? 0.4 : 1 }} min={0} max={100} value={cl} step={1} onChange={(e) => setClutch(+e.target.value / 100)} />
        </div>
      </div>

      <div className="min-w-[120px] flex-1">
        <div className="mb-1 flex justify-between label-cap text-[10px] text-muted-foreground">
          <span>lean · A / D</span>
          <span className="num text-foreground">{inputs.steer > 0.02 ? "R " + Math.round(inputs.steer * 100) : inputs.steer < -0.02 ? "L " + Math.round(-inputs.steer * 100) : "centre"}</span>
        </div>
        <input type="range" className="mono-range w-full" min={-100} max={100} value={Math.round(inputs.steer * 100)} step={1}
          onChange={(e) => setSteer(+e.target.value / 100)} onPointerUp={() => setSteer(null)} onBlur={() => setSteer(null)} />
      </div>

      <button onClick={toggleAssist} aria-label="Toggle assist" className={`rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide transition ${assist ? "bg-foreground text-[hsl(var(--background))]" : "border border-border text-muted-foreground hover:text-foreground"}`}>Assist {assist ? "On" : "Off"}</button>
      <button onClick={reset} className="rounded-full border border-border px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground transition hover:text-foreground">Reset</button>
    </div>
  );
}
