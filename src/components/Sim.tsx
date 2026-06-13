import { cn } from "@/lib/utils";

export function StageFrame({ children, label, aspect = "16 / 9" }: { children: React.ReactNode; label?: string; aspect?: string }) {
  return (
    <div className="stage" style={{ aspectRatio: aspect }}>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {Array.from({ length: 21 }, (_, i) => <line key={i} x1={i * 5} y1={0} x2={i * 5} y2={100} stroke="var(--grid)" strokeWidth={0.15} />)}
        {Array.from({ length: 21 }, (_, i) => <line key={"h" + i} x1={0} y1={i * 5} x2={100} y2={i * 5} stroke="var(--grid)" strokeWidth={0.15} />)}
      </svg>
      {label && <span className="absolute left-4 top-3 z-10 label-cap text-[10px]" style={{ color: "#7a7a7a" }}>{label}</span>}
      <div className="absolute right-4 top-3 z-10 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#111" }} />
        <span className="label-cap text-[10px]" style={{ color: "#7a7a7a" }}>live</span>
      </div>
      <div className="relative z-[1] h-full w-full">{children}</div>
    </div>
  );
}

export function GaugeRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-end justify-center gap-x-8 gap-y-3 sm:justify-start">{children}</div>;
}

export function Tile({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "good" | "warn" | "bad" }) {
  return (
    <div className="card-flat px-3.5 py-2.5">
      <div className="eyebrow text-muted-foreground">{label}</div>
      <div className={cn("num mt-0.5 text-lg", tone === "bad" ? "text-[#e23b3b]" : "text-foreground")}>{value}</div>
    </div>
  );
}

export function Chip({ tone, children }: { tone: "good" | "warn" | "bad"; children: React.ReactNode }) {
  if (tone === "bad") return <span className="inline-flex items-center rounded-md bg-[#e23b3b] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">{children}</span>;
  if (tone === "warn") return <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide" style={{ background: "var(--yellow)", color: "#111" }}>{children}</span>;
  return <span className="inline-flex items-center rounded-md border border-border bg-[hsl(var(--muted))] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-foreground">{children}</span>;
}

export function Deck({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-flat p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
        <span className="h-2 w-2 rounded-full" style={{ background: "var(--yellow)" }} />
        <h3 className="eyebrow text-muted-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function RunButton({ playing, onClick, label = "Run" }: { playing: boolean; onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-[13px] font-semibold uppercase tracking-wide text-[hsl(var(--background))] transition active:scale-95">
      {playing ? "Pause" : label}
    </button>
  );
}

export function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] leading-relaxed text-muted-foreground">{children}</p>;
}

export function Heading({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow text-muted-foreground">{kicker}</div>
      <h2 className="label-cap mt-1 text-xl font-bold text-foreground">{title}</h2>
      {children && <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{children}</p>}
    </div>
  );
}

export function TryThis({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-flat p-3.5" style={{ borderLeft: "4px solid var(--yellow)" }}>
      <div className="eyebrow mb-1.5 flex items-center gap-1.5 text-foreground">
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--yellow)" }} />Try this
      </div>
      <p className="text-[13px] leading-relaxed text-foreground">{children}</p>
    </div>
  );
}

export function KeyTakeaway({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1 border-t border-border pt-2 text-[12.5px] leading-relaxed text-muted-foreground">
      <span className="eyebrow mr-1.5 text-foreground">Key idea</span>{children}
    </div>
  );
}

export function ViewToggle({ fpv, setFpv }: { fpv: boolean; setFpv: (v: boolean) => void }) {
  return (
    <div className="mb-1 flex justify-end gap-1">
      {([["Diagram", false], ["First-person", true]] as [string, boolean][]).map(([l, v]) => (
        <button key={l} onClick={() => setFpv(v)}
          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition ${fpv === v ? "border-transparent bg-foreground text-[hsl(var(--background))]" : "border-border text-muted-foreground hover:text-foreground"}`}>{l}</button>
      ))}
    </div>
  );
}
