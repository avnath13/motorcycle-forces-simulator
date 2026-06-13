import { useRide } from "@/sim/RideContext";

export const SURFACES = [
  { key: "Dry", mu: 1.0 },
  { key: "Wet", mu: 0.65 },
  { key: "Gravel", mu: 0.45 },
  { key: "Ice", mu: 0.25 },
];
export const GRADIENTS = [
  { key: "Downhill", deg: -8 },
  { key: "Level", deg: 0 },
  { key: "Uphill", deg: 8 },
];
export const LOADS = [
  { key: "Solo", mass: 250, cogHeight: 0.6, cogFromRear: 0.7 },
  { key: "Pillion", mass: 340, cogHeight: 0.66, cogFromRear: 0.6 },
  { key: "Luggage", mass: 300, cogHeight: 0.62, cogFromRear: 0.66 },
];

export function isDefaultConditions(c: { surface: string; gradient: number; load: string }) {
  return c.surface === "Dry" && c.gradient === 0 && c.load === "Solo";
}

function Seg<T extends { key: string }>({ label, items, active, onPick, sub }: { label: string; items: T[]; active: string; onPick: (it: T) => void; sub: (it: T) => string }) {
  return (
    <div>
      <div className="eyebrow mb-1.5 text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => {
          const on = it.key === active;
          return (
            <button key={it.key} onClick={() => onPick(it)}
              className={`rounded-lg border px-3 py-1.5 text-left transition ${on ? "border-transparent bg-foreground text-[hsl(var(--background))]" : "border-border text-muted-foreground hover:text-foreground"}`}>
              <div className="text-[12px] font-bold uppercase tracking-wide">{it.key}</div>
              <div className="text-[10px] opacity-70">{sub(it)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ConditionsPanel({ onClose }: { onClose: () => void }) {
  const { config, setConfig } = useRide();
  const gradKey = GRADIENTS.find((g) => g.deg === config.gradient)?.key ?? "Level";
  return (
    <div className="card-flat mb-4 p-4">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
        <div className="eyebrow flex items-center gap-1.5 text-foreground"><span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--yellow)" }} />Riding conditions</div>
        <button onClick={onClose} aria-label="Close" className="text-muted-foreground transition hover:text-foreground">✕</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Seg label="Surface (grip)" items={SURFACES} active={config.surface} sub={(s) => "μ " + s.mu.toFixed(2)}
          onPick={(s) => setConfig({ surface: s.key, mu: s.mu })} />
        <Seg label="Gradient" items={GRADIENTS} active={gradKey} sub={(g) => (g.deg > 0 ? "+" : "") + g.deg + "°"}
          onPick={(g) => setConfig({ gradient: g.deg })} />
        <Seg label="Load" items={LOADS} active={config.load} sub={(l) => l.mass + " kg"}
          onPick={(l) => setConfig({ load: l.key, mass: l.mass, cogHeight: l.cogHeight, cogFromRear: l.cogFromRear })} />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        These feed the live model everywhere. <b className="text-foreground">Wet/ice</b> shrink the grip circle (slide sooner); <b className="text-foreground">uphill</b> saps drive, <b className="text-foreground">downhill</b> adds it; a <b className="text-foreground">pillion or luggage</b> raises mass and the centre of gravity, changing balance and transfer.
      </p>
    </div>
  );
}

export function conditionsSummary(c: { surface: string; gradient: number; load: string }) {
  const g = GRADIENTS.find((x) => x.deg === c.gradient)?.key ?? "Level";
  return `${c.surface} · ${g} · ${c.load}`;
}
